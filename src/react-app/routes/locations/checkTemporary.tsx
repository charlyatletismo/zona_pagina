import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls';
import { ARTempLocationSchema } from '@shared/apiRespTypes'
import z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  // FileArchiveIcon,
  // Info,
  ActivityIcon,
  PartyPopperIcon,
  ArrowUp,
  ArrowDown,
  SearchIcon,
  WrenchIcon,
  ListRestartIcon,
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
import { lowerAndRemoveDiacritics } from '@/lib/utils';
import React from 'react';
import { LocationForm } from '@/components/locationForm';


export const Route = createFileRoute('/locations/checkTemporary')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const res = await getAuthenticatedThrow<
      z.infer<typeof ARTempLocationSchema>[]
      >('/api/locations/temporary',
        z.array(ARTempLocationSchema));
    const resLocations = await getAuthenticatedThrow<string[]>('/api/locations', z.array(z.string()));
    return { res, resLocations };
  },
  staleTime: 0, // force reload every time
})


const customFilterFn = (row: any, columnId: string, filterValue: string) => {
  const cellValue: string = row.getValue(columnId);
  return lowerAndRemoveDiacritics(String(cellValue)).includes(lowerAndRemoveDiacritics(filterValue));
}

function RouteComponent() {
  const { res, resLocations } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const [tableData, setTableData] = React.useState<z.infer<typeof ARTempLocationSchema>[]>(res.body?.data || []);
  const [newLocation, setNewLocation] = React.useState(false);
  const [loadedLocations, setLoadedLocations] = React.useState<string[]>(resLocations.body?.data || []);
  const [focusedLocation, setFocusedLocation] = React.useState<string | null>(null);
  const [focusedUser, setFocusedUser] = React.useState<string | null>(null);

  const columnHelper = createColumnHelper<z.infer<typeof ARTempLocationSchema>>();
  
  const defaultColumns = [
    columnHelper.accessor('id', {
      header: 'DNI Usuario',
      cell: info => (
        <Link to="/users/$userId"
          params={{ userId: info.getValue() }}
          className='text-primary hover:underline'
        >
          {info.getValue()}
        </Link>
      ),
      footer: props => props.column.id,
      enableSorting: true,
    }),
    columnHelper.accessor('temp', {
      header: 'Localidad temporal',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
    }),
    columnHelper.display({
      "id": "actions",
      cell: props => (<div className='flex gap-2'>
        <Button
          onClick={() => {
            setFocusedLocation(props.row.original.temp);
            setFocusedUser(props.row.original.id);
            setNewLocation(true);
            setTimeout(() => {
              // Scroll to top of the page
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          }}
          className='text-primary/80 hover:text-primary
            bg-primary/10 hover:bg-primary/20
            p-2 rounded w-fit
            flex items-center gap-1 cursor-pointer'
          variant='outline'
        >
          <WrenchIcon className='w-4 h-4' />
        </Button>
      </div>),
    })
  ]

  const table = useReactTable({
    columns: defaultColumns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      globalFilter: '',
      sorting: [
        { id: "temp", desc: true },
      ]
    },
    globalFilterFn: customFilterFn,
  })

  return (
    <div className='max-w-full my-2 p-5 mx-auto'>
      {newLocation && (
        <div className='mb-2 border-b-2'>
          <div className='flex justify-between px-6 pt-6'>
            <div className='text-xl font-bold flex-row md:flex-col'>
              Crear nueva localidad
            </div>
            <Button
              onClick={() => {
                setNewLocation(false)
                setFocusedLocation(null);
                setFocusedUser(null);
              }}
              variant='outline'
            >
              <ListRestartIcon className="w-4 h-4 mr-2" />
              Cancelar crear nueva localidad
            </Button>
          </div>
          <LocationForm
            dbLocations={loadedLocations}
            location={{ id: '', locality: focusedLocation || '', province: '', country: 'Argentina'}}
            onSuccess={async (locationId) => {
              const locationsApi = await getAuthenticatedThrow<string[]>('/api/locations', z.array(z.string()));
              setLoadedLocations(locationsApi.body?.data || []);
              await postAuthenticated('/api/locations/updateUser', {
                userId: focusedUser!,
                location: locationId,
              });
              setNewLocation(false);
              setFocusedLocation(null);
              setFocusedUser(null);
              const res2 = await getAuthenticatedThrow<
                z.infer<typeof ARTempLocationSchema>[]
                >('/api/locations/temporary',
                  z.array(ARTempLocationSchema));
              setTableData(res2.body?.data || []);
              if (res2.body?.data.length === 0) {
                navigate({to: '/locations/checkTemporary', reloadDocument: true});
              }
            }}
          />
        </div>
      )}
      <div className='flex flex-col sm:justify-between'>
        <h1 className='text-2xl font-bold mb-4'>Ubicaciones Temporales</h1>
        {res.body.data.length > 0 && (
          <div className='flex gap-2 items-center mb-4 max-w-xl relative'>
            <SearchIcon className='w-4 h-4 text-gray-400 absolute right-2' />
            <Input
              value={table.getState().globalFilter ?? ''}
              onChange={e => table.setGlobalFilter(String(e.target.value))}
              placeholder="Buscar..."
            />
          </div>
        )}
      </div>
      {res.body.data.length > 0 && (table.getRowModel().rows.length > 0 ? (
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
      {res.body.data.length === 0 && (
        <div className='text-center py-10 text-gray-500'>
          <PartyPopperIcon className='w-8 h-8 mx-auto mb-2 animate-tremor repeat-2' />
          No hay localidades temporales a revisar
        </div>
      )}
      {/* {localStorage.getItem('ADMIN_MODE') === 'active' && (
        <pre>{JSON.stringify(sorting, null, 2)}</pre>
      )} */}

    </div>
  )
}
