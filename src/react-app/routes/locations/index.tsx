import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { LocationSchema } from '@shared/types'
import z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  // FileArchiveIcon,
  EditIcon,
  PlusIcon,
  FileScanIcon,
  // Info,
  ActivityIcon,
  ArrowUp,
  ArrowDown,
  SearchIcon,
} from 'lucide-react';
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
import { customFilterFn } from '@/lib/utils';


export const Route = createFileRoute('/locations/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const locationsApi = await getAuthenticatedThrow<
      z.infer<typeof LocationSchema>[]
      >('/api/locations/all',
        z.array(LocationSchema));
    return { locationsApi };
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  const { locationsApi } = Route.useLoaderData();


  const columnHelper = createColumnHelper<z.infer<typeof LocationSchema>>();
  
  const defaultColumns = [
    columnHelper.accessor('locality', {
      header: 'Localidad',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
    }),
    columnHelper.accessor('province', {
      header: 'Provincia',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
    }),
    columnHelper.accessor('country', {
      header: 'País',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('latitude', {
      header: 'Latitud',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
    }),
    columnHelper.accessor('longitude', {
      header: 'Longitud',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
    }),
    columnHelper.display({
      "id": "actions",
      cell: props => (<div className='flex gap-2'>
        <Button variant='outline' size="icon-sm" className='cursor-pointer'>
          <Link
            to={`/locations/$locationId`}
            className='w-full h-full flex items-center justify-center'
            params={{ locationId: props.row.original.id.toString() }}
          >
            <EditIcon className='w-4 h-4' />
          </Link>
        </Button>
      </div>),
    })
  ]

  const table = useReactTable({
    columns: defaultColumns,
    data: locationsApi.body.data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      globalFilter: '',
      columnVisibility: {
        id: false,
      },
      sorting: [
        { id: "country", desc: false },
        { id: "province", desc: false },
        { id: "locality", desc: false }
      ]
    },
    globalFilterFn: customFilterFn,
  })

  return (
    <div className='max-w-full my-2 p-5 mx-auto'>
      <div className='flex flex-col sm:flex-row sm:justify-between'>
        <div className='mb-4 sm:mb-0'>
          <h1 className='text-2xl font-bold mb-4'>Ubicaciones</h1>
          <div className='flex gap-2 items-center mb-4 max-w-sm relative'>
            <SearchIcon className='w-4 h-4 text-gray-400 absolute right-2' />
            <Input
              value={table.getState().globalFilter ?? ''}
              onChange={e => table.setGlobalFilter(String(e.target.value))}
              placeholder="Buscar..."
            />
          </div>
        </div>
        <div className='flex gap-2 flex-col sm:flex-row mb-8 sm:mb-0'>
          <Button variant='outline'>
            <Link to='/locations/create' className='flex gap-2 items-center w-full justify-center'>
              <PlusIcon className='w-4 h-4' />
              Crear Ubicación
            </Link>
          </Button>
          <Button variant='outline'>
            <Link to='/locations/checkTemporary' className='flex gap-2 items-center w-full justify-center'>
              <FileScanIcon className='w-4 h-4' />
              Ub. Temporales
            </Link>
          </Button>
        </div>
      </div>
      {locationsApi.body.data.length > 0 && (table.getRowModel().rows.length > 0 ? (
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
      {locationsApi.body.data.length === 0 && (
        <div className='text-center py-10 text-gray-500'>
          <ActivityIcon className='w-8 h-8 mx-auto mb-2 animate-tremor repeat-2' />
          No hay localidades registradas. Crea la primera en el botón de arriba.
        </div>
      )}
      {/* {localStorage.getItem('ADMIN_MODE') === 'active' && (
        <pre>{JSON.stringify(sorting, null, 2)}</pre>
      )} */}

    </div>
  )
}
