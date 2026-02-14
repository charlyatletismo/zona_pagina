import { createFileRoute, Link } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import {
  // ADMIN_ROLE,
  ORGANIZER_ROLE,
  ATHLETES_MANAGER_ROLE,
  ATHLETE_ROLE,
} from '@shared/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { ARUserSchema } from '@shared/apiRespTypes';
import { Button } from '@/components/ui/button';
import { ActivityIcon, ArrowDown, ArrowUp, ChevronRight, PlusIcon, SearchIcon } from 'lucide-react';
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
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  useReactTable,
  flexRender
} from '@tanstack/react-table';
import { lowerAndRemoveDiacritics } from '@/lib/utils';
import { Input } from '@/components/ui/input';


const ARUserSchemaPartial = ARUserSchema.partial().required({
  id: true,
});
const ARUserSchemaPartialArray = ARUserSchemaPartial.array();


export const Route = createFileRoute('/users/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
  loader: async () => {
    const usersApi = await getAuthenticatedThrow<
      z.infer<typeof ARUserSchemaPartialArray>
      >('/api/users', ARUserSchemaPartialArray);
    return { usersApi };
  },
  staleTime: 1000 * 60 * 5,
})



const customFilterFn = (row: any, columnId: string, filterValue: string) => {
  const cellValue: string = row.getValue(columnId);
  return lowerAndRemoveDiacritics(String(cellValue)).includes(lowerAndRemoveDiacritics(filterValue));
}



function RouteComponent() {
  const { usersApi } = Route.useLoaderData();
  if (usersApi.status !== 200) {
    return (
      <div className="text-red-600 p-3 rounded-md flex items-center text-sm my-4 mx-auto">
        Error al cargar los usuarios. Por favor, refresque la página.
      </div>
    );
  }

  const columnHelper = createColumnHelper<z.infer<typeof ARUserSchemaPartial>>()

  const defaultColumns = [
    columnHelper.accessor('id', {
      header: 'DNI',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableHiding: true,
    }),
    columnHelper.accessor('name', {
      header: 'Nombre',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
    }),
    columnHelper.accessor('surname', {
      header: 'Apellido',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
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
    data: usersApi.body.data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      globalFilter: '',
      columnVisibility: {
        id: false,
      },
      sorting: [
        { id: "role", desc: true },
        { id: "surname", desc: false },
        { id: "name", desc: false }
      ]
    },
    globalFilterFn: customFilterFn,
  })

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

      <div className='flex gap-2 items-center mb-4 relative'>
        <SearchIcon className='w-4 h-4 text-gray-400 absolute right-2' />
        <Input
          value={table.getState().globalFilter ?? ''}
          onChange={e => table.setGlobalFilter(String(e.target.value))}
          placeholder="Buscar..."
        />
      </div>
      {usersApi.body.data.length > 0 && (table.getRowModel().rows.length > 0 ? (
        <div>
        <Table className='border min-w-3xl max-w-full'>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => {
              return (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
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
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
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
      {usersApi.body.data.length === 0 && (
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
