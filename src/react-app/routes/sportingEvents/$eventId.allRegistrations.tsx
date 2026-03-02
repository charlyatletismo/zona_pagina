import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import {
  ARSportingEventRegistrationFlatSchema,
} from '@shared/apiRespTypes';
import z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PackageIcon,
  PackageOpenIcon,
  ActivityIcon,
  ArrowUp,
  ArrowDown,
  SearchIcon,
  EllipsisIcon,
  CircleXIcon,
  ArrowLeftRightIcon,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  useReactTable,
  flexRender
} from '@tanstack/react-table';
import { GoBackButton } from '@/components/goBackButton';
import { customFilterFn } from '@/lib/utils';


export const Route = createFileRoute('/sportingEvents/$eventId/allRegistrations')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const resRegApi = await getAuthenticatedThrow<
      z.infer<typeof ARSportingEventRegistrationFlatSchema>[]
      >(`/api/sportingEvents/${params.eventId}/allRegistrations`,
        z.array(ARSportingEventRegistrationFlatSchema));
    return { resRegApi };
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  const { resRegApi } = Route.useLoaderData();

  const statusBadges: Record<string, { text: string, color: string }> = {
    'pending': { text: 'Pendiente', color: 'border border-yellow-400 text-yellow-500' },
    'partially_paid': { text: 'Pendiente', color: 'border border-yellow-400 text-yellow-500' },
    'paid': { text: 'Pagado', color: 'border border-green-400 text-green-500' },
    'expired': { text: 'Expirado', color: 'border border-gray-400 text-gray-500' },
    'cancelled': { text: 'Cancelado', color: 'border border-gray-400 text-gray-500' },
  };

  const columnHelper = createColumnHelper<z.infer<typeof ARSportingEventRegistrationFlatSchema>>();

  const defaultColumns = [
    columnHelper.accessor('user_full_name', {
      header: 'Nombre',
      cell: info => (
        <div>
          <Link
            to={`/users/$userId`}
            className='flex text-primary/70 underline hover:text-primary'
            params={{ userId: info.row.original.user_id.toString() }}
          >
            {info.getValue()}
          </Link>
          {/* {info.row.original.user_phone && 
            <a href={`https://wa.me/${info.row.original.user_phone.split("_").join("")}`}
              target='_blank'
            >
              <Button
                variant='outline'
                size="icon-sm"
                className='cursor-pointer'
                title="Whatsapp"
              >
                <PhoneIcon className='w-4 h-4' />
              </Button>
            </a>
          } */}
        </div>
      ),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: true,
    }),
    columnHelper.accessor('user_training_team_name', {
      header: 'Equipo',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
      enableGlobalFilter: true,
    }),
    columnHelper.accessor('status', {
      header: 'Estado',
      cell: info => {
        const status = info.getValue();
        const badge = statusBadges[status];
        return badge ?
          <div className={`${badge.color} px-2 py-1 rounded-md text-center border text-xs`}>{badge.text}</div>
          : status;
      },
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('pending_to_pay', {
      header: 'Pendiente',
      cell: info => <div>
        {info.getValue().toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        })}
      </div>,
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('category', {
      header: 'Categoría',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('bib_number', {
      header: 'Dorsal',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
      enableGlobalFilter: true,
    }),
    columnHelper.accessor('chip_id', {
      header: 'Chip',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
      enableGlobalFilter: true,
    }),
    columnHelper.accessor('demanded_clothing_size', {
      header: 'Talle',
      cell: info => (
        <div>
          {info.row.original.reserved_clothing_size || info.getValue()}
        </div>
      ),
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('kit_delivered', {
      header: 'Kit',
      cell: info => info.getValue()
        ? <div className='text-green-500 p-2'><PackageOpenIcon className='w-4 h-4' /></div>
        : <div className='text-red-500 p-2'><PackageIcon className='w-4 h-4' /></div>,
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
      enableGlobalFilter: false,
    }),
    columnHelper.display({
      "id": "actions",
      cell: props => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size="icon-sm"
              className='cursor-pointer'
            >
              <EllipsisIcon className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuItem onClick={() => {}}>Aplicar descuento</DropdownMenuItem>
            {props.row.original.status !== "paid" && (
              <DropdownMenuItem onClick={() => {}}>
                Marcar como pagado
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => {}}>
              <CircleXIcon className='w-4 h-4 text-red-500' />
              Cancelar
            </DropdownMenuItem>
            {props.row.original.status === "paid" && (
              <DropdownMenuItem onClick={() => {}}>
                <ArrowLeftRightIcon className='w-4 h-4' />
                Transferir
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => {}}>
              Kit {props.row.original.kit_delivered ? 'NO entregado' : 'ya entregado'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    })
  ]

  const table = useReactTable({
    columns: defaultColumns,
    data: resRegApi.body.data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      globalFilter: '',
      // columnVisibility: {
      //   id: false,
      // },
      sorting: [
        { id: "user_training_team_name", desc: false },
        { id: "user_full_name", desc: false },
      ]
    },
    globalFilterFn: customFilterFn,
  })

  return (
    <div className='max-w-full my-2 p-5 mx-auto'>
      <GoBackButton />
      <div className='flex flex-col sm:flex-row sm:justify-between'>
        <div className='mb-4 sm:mb-0 w-full'>
          <h1 className='text-2xl font-bold mb-4'>Inscripciones</h1>
          <div className='flex gap-2 items-center mb-4 w-full max-w-md relative'>
            <SearchIcon className='w-4 h-4 text-gray-400 absolute right-2' />
            <Input
              value={table.getState().globalFilter ?? ''}
              onChange={e => table.setGlobalFilter(String(e.target.value))}
              placeholder="Buscar..."
            />
          </div>
        </div>
        {/* <div className='flex gap-2 flex-col sm:flex-row mb-8 sm:mb-0'>
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
        </div> */}
      </div>
      {resRegApi.body.data.length > 0 && (table.getRowModel().rows.length > 0 ? (
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
      {resRegApi.body.data.length === 0 && (
        <div className='text-center py-10 text-gray-500'>
          <ActivityIcon className='w-8 h-8 mx-auto mb-2 animate-tremor repeat-2' />
          No hay inscripciones aún.
        </div>
      )}
    </div>
  )
}
