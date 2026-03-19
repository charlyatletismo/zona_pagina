import { createFileRoute, Link } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import {
  // ADMIN_ROLE,
  ORGANIZER_ROLE,
  ATHLETES_MANAGER_ROLE,
  ATHLETE_ROLE,
} from '@shared/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { getManagersData, getTrainingTeamsData } from '@/lib/queryCache';
import { ARUserSchema } from '@shared/apiRespTypes';
import { Button } from '@/components/ui/button';
import {
  ActivityIcon,
  ArrowDown,
  ArrowUp,
  ChevronRight,
  PlusIcon,
  SearchIcon,
  GroupIcon,
  UngroupIcon,
  ArrowRight,
} from 'lucide-react';
import z from 'zod';
import { getMessage } from '@/lib/utils';
import { RolDescriptions } from '@shared/lang';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  GroupingState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  createColumnHelper,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import { customFilterFn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import React from 'react';


const ARUserSchemaPartial = ARUserSchema.partial().required({
  id: true,
}).extend({
  manager_full_name: z.string().optional().nullable(),
  training_team_name: z.string().optional().nullable(),
});


export const Route = createFileRoute('/users/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
  loader: async () => {
    const usersApi = await getAuthenticatedThrow<
      z.infer<typeof ARUserSchemaPartial>[]
      >('/api/users', z.array(ARUserSchemaPartial));
    const managersData = await getManagersData();
    const trainingTeamsData = await getTrainingTeamsData();
    const usersData = usersApi.status !== 200 ? null : usersApi.body.data?.map(user => {
      const trainingTeam = trainingTeamsData.find(team => team.id === user.training_team_id);
      const manager = managersData.find(m => m.id === user.manager_id);
      return {
        ...user,
        manager_full_name: manager ? `${manager.name} ${manager.surname}` : null,
        training_team_name: trainingTeam ? trainingTeam.name : null,
      }
    });
    return { usersData };
  },
  staleTime: 1000 * 60 * 5,
})


function RouteComponent() {
  const { usersData } = Route.useLoaderData();

  const [grouping, setGrouping] = React.useState<GroupingState>([])

  const columnHelper = createColumnHelper<z.infer<typeof ARUserSchemaPartial>>()

  const defaultColumns = [
    columnHelper.accessor('id', {
      header: 'DNI',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableHiding: true,
      enableGrouping: false,
    }),
    columnHelper.accessor('name', {
      header: 'Nombre',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableGrouping: false,
    }),
    columnHelper.accessor('surname', {
      header: 'Apellido',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableGrouping: false,
    }),
    columnHelper.accessor('training_team_name', {
      header: 'Equipo de Entrenamiento',
      cell: info => info.getValue() || '',
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
    }),
    columnHelper.accessor('phone', {
      header: 'Celular',
      cell: info => {
        const phone = info.getValue();
        if (!phone) return null;
        return (
          <a href={`https://wa.me/${phone.split("_").join("")}`}
            className='text-md underline text-primary/70 hover:text-primary'
            target='_blank'
          >
            {"+" + phone.split("_").join(" ")}
          </a>
        )
      },
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
      enableGrouping: false,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => {
        const email = info.getValue();
        if (!email) return null;
        return (
          <a href={`mailto:${email}`}
            className='text-md underline text-primary/70 hover:text-primary'
            target='_blank'
          >
            {email}
          </a>
        )
      },
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
      enableGrouping: false,
    }),
    columnHelper.accessor('manager_full_name', {
      header: 'Manager',
      cell: info => info.getValue() || '',
      footer: props => props.column.id,
      enableHiding: true,
      enableSorting: true,
      sortUndefined: 'last',
    }),
    columnHelper.accessor('role', {
      header: 'Rol',
      cell: info => {
        const role = info.getValue();
        if (!role) return null;
        const t = getMessage(RolDescriptions[role], role);
        return (<div className={
          "text-white text-xs rounded-full text-center p-1 "
          + (role === ATHLETE_ROLE
            ? "bg-green-500"
            : role === ATHLETES_MANAGER_ROLE
              ? "bg-blue-500"
              : role === ORGANIZER_ROLE
              ? "bg-orange-500"
              : "bg-sky-500")
        }>
          {t}
        </div>)
      },
      footer: props => props.column.id,
      enableHiding: true,
      enableSorting: true,
      sortUndefined: 'last',
    }),
    columnHelper.display({
      "id": "actions",
      cell: props => (<div className='flex gap-2 w-20 justify-center'>
        <Button
          variant='outline'
          size="icon-sm"
          className='cursor-pointer'
          title="Ver detalles"
        >
          <Link
            to={`/users/$userId`}
            className='w-full h-full flex items-center justify-center'
            params={{ userId: props.row.original.id.toString() }}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>),
    })
  ]

  const table = useReactTable({
    columns: defaultColumns,
    data: usersData || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    initialState: {
      globalFilter: '',
      columnVisibility: {
        id: false,
        role: localStorage.getItem('USER_ROLE') !== ATHLETES_MANAGER_ROLE,
        manager_full_name: localStorage.getItem('USER_ROLE') !== ATHLETES_MANAGER_ROLE,
      },
      sorting: [
        { id: "role", desc: true },
        { id: "surname", desc: false },
        { id: "name", desc: false }
      ]
    },
    globalFilterFn: customFilterFn,
    state: {
      grouping
    },
    onGroupingChange: (updater) => {
      setGrouping((old) => {
        const newGrouping = typeof updater === 'function' ? updater(old) : updater;
        // Take only the last clicked (or first) column to limit to 1
        return newGrouping.slice(-1);
      });
    },
  })

  if (usersData === null) {
    return (
      <div className="text-red-600 p-3 rounded-md flex items-center text-sm my-4 mx-auto">
        Error al cargar los usuarios. Por favor, refresque la página.
      </div>
    );
  }

  return (
    <div className='max-w-full my-2 p-5 mx-auto'>
      <div className='flex justify-between mb-4'>
        <h1 className='text-2xl font-bold mb-2'>Usuarios</h1>
        <div className='flex gap-2'>
          <Button variant='outline' className='w-40'>
            <Link to='/users/create' className='flex gap-2 items-center w-full justify-center'>
              <PlusIcon className='w-4 h-4' />
              Crear Usuario
            </Link>
          </Button>
        </div>
      </div>

      <div className='flex gap-2 items-center mb-4 w-full max-w-sm relative'>
        <SearchIcon className='w-4 h-4 text-gray-400 absolute right-2' />
        <Input
          value={table.getState().globalFilter ?? ''}
          onChange={e => table.setGlobalFilter(String(e.target.value))}
          placeholder="Buscar DNI, nombre, email, celular, etc..."
        />
      </div>
      {usersData && usersData.length > 0 && (table.getRowModel().rows.length > 0 ? (
        <div>
        <Table className='border min-w-3xl max-w-full'>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => {
              return (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                      <div className='flex gap-1 items-center'>
                        {header.column.getCanGroup() ? (
                          <button
                            onClick={header.column.getToggleGroupingHandler()}
                            className='cursor-pointer hover:text-primary'
                            title={
                              header.column.getIsGrouped()
                              ? 'Desagrupar'
                              : 'Agrupar'
                            }
                          >
                            {header.column.getIsGrouped()
                              ? <UngroupIcon className='w-4 h-4' />
                              : <GroupIcon className='w-4 h-4' />}
                          </button>
                        ) : null}
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
                            asc: <ArrowUp className="h-4 w-4" />,
                            desc: <ArrowDown className="h-4 w-4" />,
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
                    {cell.getIsGrouped() ? (
                      // If it's a grouped cell, add an expander and row count
                      <div className='flex items-center gap-2'>
                        <Button
                          variant="ghost"
                          onClick={row.getToggleExpandedHandler()}
                          className={
                            row.getCanExpand() ? 'cursor-pointer' : ''
                          }
                        >
                          {row.getIsExpanded()
                            ? <ArrowDown className='w-4 h-4' />
                            : <ArrowRight className='w-4 h-4' />}
                        </Button>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}{" "}
                        <span className='text-muted-foreground'>({row.subRows.length})</span>
                      </div>
                    ) : cell.getIsAggregated() ? (
                      flexRender(
                        cell.column.columnDef.aggregatedCell ??
                            cell.column.columnDef.cell,
                        cell.getContext()
                      )
                    ) : cell.getIsPlaceholder() ? null
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
        <div className='text-gray-500'>{table.getRowModel().rows.length.toLocaleString()} resultados</div>
        </div>
      ) : (
        <div className='text-center py-10 text-gray-500 min-w-3xl max-w-full'>
          <ActivityIcon className='w-8 h-8 mx-auto mb-2 animate-tremor repeat-2' />
          No hay resultados para tu búsqueda.
        </div>
      ))}
      {usersData && usersData.length === 0 && (
        <div className='text-center py-10 text-gray-500'>
          <ActivityIcon className='w-8 h-8 mx-auto mb-2 animate-tremor repeat-2' />
          No hay usuarios registrados. Crea el primero en el botón de arriba.
        </div>
      )}
      {/* {localStorage.getItem('ADMIN_MODE') === 'active' && (
        <pre>{JSON.stringify(sorting, null, 2)}</pre>
      )} */}

    </div>
  )
}
