import React from 'react';
import { Link } from '@tanstack/react-router';
import { ORGANIZER_ROLE } from '@shared/roles';
import {
  SportingEventBasicInfoSchema
} from '@shared/apiRespTypes';
import { Input } from '@/components/ui/input';
import {
  // FileArchiveIcon,
  // Info,
  ActivityIcon,
  ArrowUp,
  ArrowDown,
  SearchIcon,
  EditIcon,
  InfoIcon,
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
  SortingState,
  createColumnHelper,
  useReactTable,
  flexRender
} from '@tanstack/react-table';
import { customFilterFn } from '@/lib/utils';
import z from 'zod';
import { Button } from '@/components/ui/button';


export const SpBSchema = SportingEventBasicInfoSchema.extend({
  status: z.string(),
})


export const SportingEventsMinTable = ({
  data,
  title,
  emptyMessage = "No hay eventos deportivos para mostrar.",
  dateSortingDesc = true,
}: {
  data: z.infer<typeof SpBSchema>[],
  title: string,
  emptyMessage?: string,
  dateSortingDesc?: boolean,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: dateSortingDesc },
  ]);

  const columnHelper = createColumnHelper<z.infer<typeof SpBSchema>>();

  const defaultColumns = [
    columnHelper.accessor('status', {
      cell: info => {
        const value = info.getValue();
        const t = {"open": "Abierto", "comingSoon": "Próximo", "closed": "Cerrado", "past": "Pasado"}[value]
        return (<div className={
          "text-white rounded-full text-center p-1 px-2 w-full "
          + (value === "open"
            ? "bg-green-500"
            : value === "comingSoon"
              ? "bg-blue-500"
              : value === "closed"
                ? "bg-orange-500"
                : value === "past"
                  ? "bg-gray-500"
                  : "bg-gray-500")
        }>
          {t}
        </div>)
      },
      header: () => 'Estado',
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
    }),
    columnHelper.accessor('title', {
      cell: info => (
        <Link
            to={`/sportingEvents/$eventId`}
            params={{ eventId: info.row.original.id.toString() }}
            className='text-primary hover:text-primary/50 hover:underline'
        >
          {info.getValue()}
        </Link>),
      header: () => 'Título',
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
    }),
    columnHelper.accessor('description', {
      cell: info => info.getValue(),
      header: () => 'Descripción',
      footer: props => props.column.id,
      enableSorting: false,
      sortUndefined: 'last',
      enableHiding: true,
    }),
    columnHelper.accessor('date', {
      cell: info => info.getValue().toLocaleDateString(),
      header: () => 'Fecha',
      footer: props => props.column.id,
      enableSorting: true,
      sortDescFirst: false,
      sortUndefined: 'last',
    }),
    columnHelper.accessor('fee_amount', {
      cell: info => info.getValue() ? `$${info.getValue()}` : <div className={localStorage.getItem('USER_ROLE') === ORGANIZER_ROLE ? 'bg-destructive text-white rounded-full text-center p-1' : ''}>N/A</div>,
      header: () => 'Tarifa',
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
    }),
    // columnHelper.accessor(
    //   row => `${row.registration_start?.toLocaleDateString() || 'N/A'} - ${row.registration_end?.toLocaleDateString() || 'N/A'}`,
    //   {
    //     id: 'registration_period',
    //     cell: info => info.getValue(),
    //     header: () => 'Período de inscripción',
    //     footer: props => props.column.id,
    //   }
    // ),
    columnHelper.accessor('registration_start', {
      cell: info => info.getValue()?.toLocaleDateString() || 'N/A',
      header: () => 'Inicio de inscripciones',
      footer: props => props.column.id,
      enableSorting: true,
      sortDescFirst: false,
      sortUndefined: 'last',
    }),
    columnHelper.accessor('registration_end', {
      cell: info => info.getValue()?.toLocaleDateString() || 'N/A',
      header: () => 'Fin de inscripciones',
      footer: props => props.column.id,
      enableSorting: true,
      sortDescFirst: false,
      sortUndefined: 'last',
    }),
    columnHelper.accessor('location', {
      cell: info => info.getValue(),
      header: () => 'Ubicación',
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
    }),
    columnHelper.display({
        "id": "actions",
        enableHiding: true,
        cell: props => (<div className='flex gap-2 w-35 justify-center'>
          {/* <Link
            to={`/sportingEvents/$eventId`}
            params={{ eventId: props.row.original.id.toString() }}
            className='text-primary/80 hover:text-primary bg-primary/10 hover:bg-primary/20 p-2 rounded w-fit flex items-center gap-1'
          >
            <Info className='w-4 h-4' />
          </Link> */}
          <Button variant='outline' size="icon-sm" className='cursor-pointer'>
            <Link
              to={`/sportingEvents/$eventId`}
              params={{ eventId: props.row.original.id.toString() }}
              className='w-full h-full flex items-center justify-center'
            >
              <InfoIcon className='w-4 h-4' />
            </Link>
          </Button>
          <Button variant='outline' size="icon-sm" className='cursor-pointer'>
            <Link
              to={`/sportingEvents/$eventId/edit`}
              params={{ eventId: props.row.original.id.toString() }}
              className='w-full h-full flex items-center justify-center'
            >
              <EditIcon className='w-4 h-4' />
            </Link>
          </Button>
          {/* <Link
            to={`/sportingEvents/$eventId/registrations`}
            params={{ eventId: props.row.original.id.toString() }}
            className='text-primary/80 hover:text-primary bg-primary/10 hover:bg-primary/20 p-2 rounded w-fit flex items-center gap-1'
            about='Ver inscripciones al evento'
          >
            <FileArchiveIcon className='w-4 h-4' />
          </Link> */}
        </div>),
      })
  ]


  const table = useReactTable({
    columns: defaultColumns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    initialState: {
      globalFilter: "",
      columnVisibility: {
        description: false,
        actions: localStorage.getItem('USER_ROLE') === ORGANIZER_ROLE ? true : false,
      }
    },
    state: {
      sorting,
    },
    enableSortingRemoval: false,
    globalFilterFn: customFilterFn,
  })

  return (
    <div className='max-w-full my-2 p-5 mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>{title}</h1>
      {data.length > 0 && (<div className='flex gap-2 items-center mb-4 max-w-sm relative'>
        <SearchIcon className='w-4 h-4 text-gray-400 absolute right-2' />
        <Input
          value={table.getState().globalFilter ?? ''}
          onChange={e => table.setGlobalFilter(String(e.target.value))}
          placeholder="Buscar..."
        />
      </div>)}
      {data.length > 0 && (table.getRowModel().rows.length > 0 ? (
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
      {data.length === 0 && (
        <div className='text-center py-10 text-gray-500'>
          <ActivityIcon className='w-8 h-8 mx-auto mb-2 animate-tremor repeat-2' />
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
