import { createFileRoute, Link } from '@tanstack/react-router'
import z from 'zod';
import { Button } from '@/components/ui/button'
import { Edit, CogIcon, IdCard, AlertCircle, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls'
import { ARUserSchema, ARUserMinSchema } from '@shared/apiRespTypes';
import { ProfileCard } from '@/components/profileCard';
import { ADMIN_ROLE, ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE, ATHLETE_ROLE, authorizedOrg } from '@shared/roles';
import { customFilterFn, getMessage } from '@/lib/utils';
import { RolDescriptions } from '@shared/lang';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ComboBoxIdName } from '@/components/comboBoxIdName';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import { GoBackButton } from '@/components/goBackButton';
import React from 'react';


export const Route = createFileRoute('/users/$userId/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
  loader: async ({ params }) => {
    const userApiRes = await getAuthenticatedThrow<
      z.infer<typeof ARUserSchema>
      >(`/api/users/${params.userId}`,
        ARUserSchema);
    let managedUsers: z.infer<typeof ARUserMinSchema>[] = [];
    if (userApiRes.status === 200 && userApiRes.body.data.role === ATHLETES_MANAGER_ROLE) {
      const managedUsersRes = await getAuthenticatedThrow<
        z.infer<typeof ARUserMinSchema>[]
        >(`/api/users/${params.userId}/managedUsers`,
          z.array(ARUserMinSchema));
      managedUsers = managedUsersRes.body.data || [];
    }
    let managers: z.infer<typeof ARUserMinSchema>[] = [];
    if (authorizedOrg(localStorage.getItem("USER_ROLE"))) {
      const managersRes = await getAuthenticatedThrow<
        z.infer<typeof ARUserMinSchema>[]
        >('/api/users/managers', z.array(ARUserMinSchema));
      managers = managersRes.body.data || [];
    }
    return { userApiRes, managedUsers, managers };
  },
  staleTime: 1000 * 60 * 5,
})


function RouteComponent() {
  const { userId } = Route.useParams();
  const { userApiRes, managedUsers, managers } = Route.useLoaderData();
  const [changeRole, setChangeRole] = React.useState<string | null>(null);
  const [transferManagedUsersDialog, setTransferManagedUsersDialog] = React.useState<z.infer<typeof ARUserMinSchema>[] | null>(null);
  
  const [error, _setError] = React.useState('');
  const [success, _setSuccess] = React.useState('');
  const setError = (msg: string) => {
    _setError(msg)
    setTimeout(() => {
      _setError('');
    }, 2000);
  };
  const setSuccess = (msg: string) => {
    _setSuccess(msg)
    setTimeout(() => {
      _setSuccess('');
    }, 3000);
  };

  if (userApiRes.status === 404 || !userApiRes.body.data) {
    return (
      <div className="p-4 w-full md:max-w-4xl mx-auto">
        <GoBackButton />
        <div className="p-8 text-center">No se encontró información del perfil</div>
      </div>
    );
  }

  if (userApiRes.status !== 200) {
    return (
      <div className="p-4 w-full md:max-w-4xl mx-auto">
        <GoBackButton />
        <div className="text-red-500 p-8 text-center">Error al cargar la información del perfil</div>
      </div>
    );
  }

  const currentRole = userApiRes.body.data.role;

  // Don't allow changing roles when not admin or organizer,
  // Don't allow changing admin roles or self (simplified)
  const orgLevelEdit = (
    localStorage.getItem("USER_ROLE") === ORGANIZER_ROLE
    || localStorage.getItem("USER_ROLE") === ADMIN_ROLE)
    && currentRole && currentRole !== ADMIN_ROLE
    && localStorage.getItem('USER_ID') !== userApiRes.body.data.id;

  return (
    <div className="px-4 py-8 w-full md:max-w-4xl mx-auto">

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-3">
          {success}
        </div>
      )}

      {orgLevelEdit ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 justify-center mb-6 p-4 border-b'>
          <Button asChild variant="outline">
            <Link to="/users/$userId/changeId" params={{ userId }}>
              <IdCard className="w-4 h-4" />
              Cambiar DNI
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={
                  userApiRes.body.data.role === ADMIN_ROLE ? "destructive" :
                    userApiRes.body.data.role === ORGANIZER_ROLE ? "default" :
                      "outline"
                }
                className='cursor-pointer'
              >
                <CogIcon className="h-4 w-4" />
                {getMessage(RolDescriptions[userApiRes.body.data.role || ''], userApiRes.body.data.role)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              {/* <DropdownMenuItem onClick={() => handleRoleChange(userApiRes.body.data.id, ATHLETE_ROLE)}>Atleta</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange(userApiRes.body.data.id, ORGANIZER_ROLE)}>Organizador</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange(userApiRes.body.data.id, ATHLETES_MANAGER_ROLE)}>Manager</DropdownMenuItem> */}
              <DropdownMenuItem onClick={() => {
                if (managedUsers.length > 0) {
                  setError(
                    'No se puede cambiar el rol porque este usuario tiene atletas a cargo. '
                    + 'Por favor, reasigna los atletas a cargo antes de cambiar el rol.'
                  );
                  return;
                }
                setChangeRole(userApiRes.body.data.role!)
              }}>
                Cambiar Rol
              </DropdownMenuItem>
              {userApiRes.body.data.role === ATHLETES_MANAGER_ROLE && (
                <DropdownMenuItem onClick={() => {
                  setTransferManagedUsersDialog(managedUsers)
                }}>
                  Editar Atletas a Cargo
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild variant="outline">
            <Link to="/users/$userId/edit" params={{ userId }}>
              <Edit className="w-4 h-4" />
              Editar
            </Link>
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 justify-center mb-6 p-4 border-b'>
          <Button asChild variant="outline">
            <Link to="/users/$userId/edit" params={{ userId }}>
              <Edit className="w-4 h-4" />
              Editar
            </Link>
          </Button>
        </div>
      )}

      <RoleDialog
        currentRole={changeRole}
        setCurrentRole={setChangeRole}
        userId={userApiRes.body.data.id}
        setError={setError}
        setSuccess={setSuccess}
      />

      <TransferManagedUsersDialog
        managedUsers={transferManagedUsersDialog}
        setManagedUsers={setTransferManagedUsersDialog}
        managers={managers}
        userId={userApiRes.body.data.id}
        setError={setError}
        setSuccess={setSuccess}
      />

      <GoBackButton />

      <div className="rounded-lg border shadow-md overflow-hidden">
        <div className="p-6 border-b flex gap-5 justify-between items-center">
          <h2 className="text-2xl font-bold">{
            userApiRes.body.data
            ? `${userApiRes.body.data.name} ${userApiRes.body.data.surname}`
            : 'Falla en la carga del perfil'}
          </h2>
        </div>

        {userApiRes.body.data && (
          <ProfileCard profile={userApiRes.body.data} />
        )}
      </div>
    </div>
  )
}


const RoleDialog = ({
  currentRole,
  setCurrentRole,
  userId,
  setError,
  setSuccess,
}: {
  currentRole: string | null,
  setCurrentRole: (role: string | null) => void,
  userId: string,
  setError: (message: string) => void,
  setSuccess: (message: string) => void,
}) => {
  const [newRole, setNewRole] = React.useState("");

  React.useEffect(() => {
    if (currentRole) {
      setNewRole(currentRole);
    }
  }, [currentRole]);

  return (
    <Dialog open={currentRole !== null} onOpenChange={() => {
      setCurrentRole(null);
    }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Cambiar Rol</DialogTitle>
          <DialogDescription>
            <span>
              Selecciona el nuevo rol para el usuario. Ten en cuenta que cambiar el rol
              puede afectar los permisos y accesos del usuario dentro de la plataforma.
            </span>

            <div className='flex gap-4 mt-4'>
              <div className='flex'>
                <input
                  type="radio"
                  id="role-athlete"
                  name="role"
                  value={ATHLETE_ROLE}
                  checked={newRole === ATHLETE_ROLE}
                  onChange={() => setNewRole(ATHLETE_ROLE)}
                  />
                <label
                  className='pl-2'
                  htmlFor="role-athlete"
                >
                  Atleta
                </label>
              </div>
              
              <div className='flex'>
                <input
                  type="radio"
                  id="role-athlete-manager"
                  name="role"
                  value={ATHLETES_MANAGER_ROLE}
                  checked={newRole === ATHLETES_MANAGER_ROLE}
                  onChange={() => setNewRole(ATHLETES_MANAGER_ROLE)}
                  />
                <label
                  className='pl-2'
                  htmlFor="role-athlete-manager"
                >
                  Manager
                </label>
              </div>
              
              <div className='flex'>
                <input
                  type="radio"
                  id="role-organizer"
                  name="role"
                  value={ORGANIZER_ROLE}
                  checked={newRole === ORGANIZER_ROLE}
                  onChange={() => setNewRole(ORGANIZER_ROLE)}
                  />
                <label
                  className='pl-2'
                  htmlFor="role-organizer"
                >
                  Organizador
                </label>
              </div>
            </div>
          </DialogDescription>

          <div className='flex gap-2 justify-end mt-2'>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className='max-w-20 cursor-pointer'
              >
                Cancelar
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="default"
                className='max-w-20 cursor-pointer'
                disabled={!newRole || newRole === currentRole}
                onClick={async () => {
                  const res = await postAuthenticated(
                    `/api/users/${userId}/setRole`,
                    { role: newRole });
                  if (res.status === 200) {
                    setSuccess('Rol cambiado exitosamente.');
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  } else {
                    setError(`Error al cambiar el rol: ${getMessage(res.body?.message, 'Error desconocido')}`);
                  }
                  setCurrentRole(null);
                }}
              >
                Confirmar
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}


export const ManagedUsersTable = ({
  managedUsers,
  rowSelection,
  setRowSelection,
}: {
  managedUsers: z.infer<typeof ARUserMinSchema>[],
  rowSelection: Record<string, boolean>,
  setRowSelection: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
}) => {
  const columnHelper = createColumnHelper<z.infer<typeof ARUserMinSchema>>();

  const defaultColumns = [
    columnHelper.display({
      "id": "select",
      header: ({ table }) => (
        <div className="flex gap-2 items-center px-1">
          <Checkbox
            className="cursor-pointer"
            checked={table.getIsSomeRowsSelected() ? "indeterminate" : table.getIsAllRowsSelected()}
            onCheckedChange={
              (c) => table.getToggleAllRowsSelectedHandler()(
                {target: {checked: c === "indeterminate" ? true : c}}
              )
            }
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className={"flex gap-2 items-center px-1 " /*+ `pl-${row.depth*4}`*/}>
          <Checkbox
            className="cursor-pointer"
            checked={row.getIsSomeSelected() ? "indeterminate" : row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={
              (c) => row.getToggleSelectedHandler()(
                {target: {checked: c === "indeterminate" ? true : c}}
              )
            }
          />
        </div>
      ),
    }),
    columnHelper.accessor('id', {
      header: 'DNI',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: true,
    }),
    columnHelper.accessor('surname', {
      header: 'Apellido',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: true,
    }),
    columnHelper.accessor('name', {
      header: 'Nombre',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: true,
    }),
  ]

  const table = useReactTable({
    columns: defaultColumns,
    data: managedUsers,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      globalFilter: '',
      // columnVisibility: {
      //   id: false,
      // },
      sorting: [
        { id: "surname", desc: false },
        { id: "name", desc: false },
      ]
    },
    globalFilterFn: customFilterFn,
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection
    },
    // use the row's id from the database as the row id
    getRowId: row => row.id.toString(),
  })
  
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => {
          return (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                  <div className='flex gap-1 items-center'>
                    <div className={"flex items-center gap-1 "
                      + (header.column.getCanSort()
                        ? "cursor-pointer select-none hover:text-primary"
                        : "")
                      + (header.column.getCanSort() ?
                          header.column.getIsSorted()
                            ? " mr-0"
                            : " mr-5"
                          : " mr-0")}
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === 'asc'
                            ? 'Sort ascending'
                            : header.column.getNextSortingOrder() === 'desc'
                              ? 'Sort descending'
                              : 'Clear sort'
                          : undefined
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: <ArrowUpIcon className="h-4 w-4" />,
                        desc: <ArrowDownIcon className="h-4 w-4" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          )
        })}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id}>
                {cell.getIsPlaceholder() ? null
                  : flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )
                }
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}


const TransferManagedUsersDialog = ({
  managedUsers,
  setManagedUsers,
  managers,
  userId,
  setError,
  setSuccess,
}: {
  managedUsers: z.infer<typeof ARUserMinSchema>[] | null,
  setManagedUsers: (users: z.infer<typeof ARUserMinSchema>[] | null) => void,
  managers: z.infer<typeof ARUserMinSchema>[],
  userId: string,
  setError: (message: string) => void,
  setSuccess: (message: string) => void,
}) => {
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});
  const [newManager, setNewManager] = React.useState<string>("");

  return (
    <Dialog open={managedUsers !== null} onOpenChange={() => {
      setNewManager("");
      setRowSelection({});
      setManagedUsers(null);
    }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Administrar atletas a cargo</DialogTitle>
          <DialogDescription className='gap-4'>
            <span className='mb-4'>
              Selecciona los atletas que quieras administrar.
              Luego podrás reasignarlos a otro manager o remover su management.
            </span>

            {(managedUsers && managedUsers.length > 0) ? (
              <ManagedUsersTable
              managedUsers={managedUsers || []}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              />
            ) : (
              <div className='p-4 text-center'>No hay atletas a cargo</div>
            )}
            
            <div className='mt-4'>
              <ComboBoxIdName
                data={managers
                  .filter(manager => manager.id !== userId)
                  .map(
                    manager => ({
                      id: manager.id,
                      name: `${manager.surname} ${manager.name}`
                    }))
                  .sort((a, b) => a.name.localeCompare(b.name))
                }
                label="Reasignar nuevo manager"
                name="newManager"
                value={newManager}
                onChange={(value) => {
                  setNewManager(value || "");
                }}
                onBlur={() => {}}
                placeholder="DNI del nuevo manager"
              />
            </div>
          </DialogDescription>

          <div className='flex gap-2 justify-end mt-2'>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className='max-w-20 cursor-pointer'
              >
                Cancelar
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="destructive"
                className='cursor-pointer'
                disabled={Object.keys(rowSelection).length === 0}
                onClick={async () => {
                  const res = await postAuthenticated(
                    `/api/users/managementRemoval`,
                    { usersIds: Object.keys(rowSelection) });
                  if (res.status === 200) {
                    setSuccess('Management removido exitosamente.');
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  } else {
                    setError(`Error al remover el management: ${getMessage(res.body?.message, 'Error desconocido')}`);
                  }
                  setManagedUsers(null);
                }}
              >
                Remover management
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="default"
                className='max-w-20 cursor-pointer'
                disabled={Object.keys(rowSelection).length === 0 || !newManager || newManager === ""}
                onClick={async () => {
                  const res = await postAuthenticated(
                    `/api/users/managementTransfer`,
                    { usersIds: Object.keys(rowSelection), newManagerId: newManager });
                  if (res.status === 200) {
                    setSuccess('Transferido exitosamente.');
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  } else {
                    setError(`Error al transferir: ${getMessage(res.body?.message, 'Error desconocido')}`);
                  }
                  setManagedUsers(null);
                }}
              >
                Transferir
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
