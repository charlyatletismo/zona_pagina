import { createFileRoute, useNavigate } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ADMIN_ROLE, ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE, ATHLETE_ROLE } from '@/lib/roles';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls';
import { User } from '@/lib/types';
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronRight, BookUser } from 'lucide-react';

export const Route = createFileRoute('/users/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
  loader: async () => {
    const usersApi = await getAuthenticatedThrow('/api/users');
    const users: User[] = usersApi.data;
    return { users, usersStatus: usersApi.status};
  },
  staleTime: 1000 * 60 * 5,
})

const getRoleWeight = (role: string | undefined) => {
  if (!role) return 5;
  if (role === ADMIN_ROLE) return 4;
  if (role === ORGANIZER_ROLE) return 1;
  if (role === ATHLETES_MANAGER_ROLE) return 2;
  return 3;
}

function RouteComponent() {
  const { users, usersStatus } = Route.useLoaderData();
  if (usersStatus !== 200) {
    return (
      <div className="text-red-600 p-3 rounded-md flex items-center text-sm my-4 mx-auto">
        Error al cargar los usuarios. Por favor, refresque la página.
      </div>
    );
  }
  const [data, setData] = React.useState<User[]>(() => {
    return [...(users || [])].sort((a, b) => getRoleWeight(a.role) - getRoleWeight(b.role));
  });
  const navigate = useNavigate();

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) return;

    const res = await postAuthenticated(`/api/users/${userId}/setRole`, { role: newRole }, navigate);
    if (res.status === 200) {
      setData(prev => {
        const newData = prev.map(u => u.id === userId ? { ...u, role: newRole } : u);
        return newData.sort((a, b) => getRoleWeight(a.role) - getRoleWeight(b.role));
      });
    } else {
      alert('Error al actualizar el rol');
    }
  };

  const columnHelper = createColumnHelper<User>()

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: info => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('surname', {
        header: 'Apellido',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('phone', {
        header: 'Teléfono',
        cell: info => <span className="text-gray-500">{info.getValue()}</span>,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: info => <span className="text-gray-500">{info.getValue()}</span>,
      }),
      columnHelper.accessor('role', {
        // TODO: Hide role when is not admin or organizer
        header: 'Rol',
        cell: info => {
          const role = info.getValue();
          if (!role) return null;
          let className = role !== ATHLETES_MANAGER_ROLE ? "" : "bg-blue-500 text-white dark:bg-blue-600"
          let label = {
            [ADMIN_ROLE]: "Admin",
            [ORGANIZER_ROLE]: "Organizador",
            [ATHLETES_MANAGER_ROLE]: "Manager",
            [ATHLETE_ROLE]: "Atleta",
          }[role];

          return (
            <div>
              <Badge variant={
                role === ADMIN_ROLE ? "destructive" :
                role === ORGANIZER_ROLE ? "default" :
                role === ATHLETES_MANAGER_ROLE ? "secondary" : "outline"
              } className={className}>
                {label}
              </Badge>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: props => {
          const user = props.row.original;
          const currentRole = user.role;

          // Don't allow changing roles when not admin or organizer,
          // Don't allow changing admin roles or self (simplified)
          const canEdit = (
            localStorage.getItem("USER_ROLE") === ORGANIZER_ROLE
            || localStorage.getItem("USER_ROLE") === ADMIN_ROLE)
            && currentRole && currentRole !== ADMIN_ROLE
            && localStorage.getItem('USER_ID') !== user.id;

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => navigate({ to: `/users/$userId`, params: { userId: user.id } })}
                title="Ver detalles"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary"><BookUser className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, ATHLETE_ROLE)}>Atleta</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, ORGANIZER_ROLE)}>Organizador</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, ATHLETES_MANAGER_ROLE)}>Manager</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        },
      }),
    ],
    [navigate]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <div className="text-sm text-gray-500">
          Total: {data.length} usuarios
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No se encontraron usuarios.
          </div>
        )}
      </div>
    </div>
  )
}
