import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticated } from '@/lib/apiCalls';
import {
  // FileArchiveIcon,
  EditIcon,
  Info,
  ActivityIcon,
  ArrowUp,
  ArrowDown
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
  SortingState,
  createColumnHelper,
  useReactTable,
  flexRender
} from '@tanstack/react-table';
import { SportingEventSchema } from '@shared/types';
import {
  ARAllSportingEventSchema
} from '@shared/apiRespTypes';
import z from 'zod';


const SpBSchema = SportingEventSchema.pick({
  id: true,
  title: true,
  date: true,
  fee_amount: true,
  // fee_amount_promotional: true,
  registration_start: true,
  registration_end: true,
  location: true,
}).required({
  id: true,
}).extend({
  status: z.string(),
})


export const Route = createFileRoute('/sportingEvents/active')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const res = await getAuthenticated<
      z.infer<typeof ARAllSportingEventSchema>
      >('/api/sportingEvents', ARAllSportingEventSchema);
    const data = []
    data.push(...z.array(SpBSchema).parse(res.body.data.open.map(e => ({...e, status: "open"}))))
    data.push(...z.array(SpBSchema).parse(res.body.data.comingSoon.map(e => ({...e, status: "comingSoon"}))))
    data.push(...z.array(SpBSchema).parse(res.body.data.closed.map(e => ({...e, status: "closed"}))))
    console.log(data)
    return { data }
  },
  staleTime: 1000 * 60 * 5,
})

function RouteComponent() {
  const { data } = Route.useLoaderData();

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: false },
  ]);

  const columnHelper = createColumnHelper<z.infer<typeof SpBSchema>>();

  const defaultColumns = [
    columnHelper.display({
      "id": "actions",
      cell: props => (<div className='flex gap-2'>
        <Link
          to={`/sportingEvents/$eventId`}
          params={{ eventId: props.row.original.id.toString() }}
          className='text-primary/80 hover:text-primary bg-primary/10 hover:bg-primary/20 p-2 rounded w-fit flex items-center gap-1'
        >
          <Info className='w-4 h-4' />
        </Link>
        <Link
          to={`/sportingEvents/$eventId/edit`}
          params={{ eventId: props.row.original.id.toString() }}
          className='text-primary/80 hover:text-primary bg-primary/10 hover:bg-primary/20 p-2 rounded w-fit flex items-center gap-1'
        >
          <EditIcon className='w-4 h-4' />
        </Link>
        {/* <Link
          to={`/sportingEvents/$eventId/registrations`}
          params={{ eventId: props.row.original.id.toString() }}
          className='text-primary/80 hover:text-primary bg-primary/10 hover:bg-primary/20 p-2 rounded w-fit flex items-center gap-1'
          about='Ver inscripciones al evento'
        >
          <FileArchiveIcon className='w-4 h-4' />
        </Link> */}
      </div>),
    }),
    columnHelper.accessor('status', {
      cell: info => {
        const value = info.getValue();
        const t = {"open": "Abierto", "comingSoon": "Próximo", "closed": "Cerrado"}[value]
        return (<div className={
          "text-white rounded-full text-center p-1 px-2 w-full "
          + (value === "open"
            ? "bg-green-500"
            : value === "comingSoon"
              ? "bg-blue-500"
              : "bg-orange-500")
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
      cell: info => info.getValue(),
      header: () => 'Título',
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
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
      cell: info => info.getValue() ? `$${info.getValue()}` : <div className='bg-destructive text-white rounded-full text-center p-1'>N/A</div>,
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
  ]

  const table = useReactTable({
    columns: defaultColumns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting
    },
  })

  return (
    <div className='max-w-full my-2 p-5 mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Eventos deportivos activos</h1>
      {table.getRowModel().rows.length > 0 && (
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
      )}
      {table.getRowModel().rows.length > 0 && (
        <div className='text-gray-500'>{table.getRowModel().rows.length.toLocaleString()} resultados</div>
      )}
      {table.getRowModel().rows.length === 0 && (
        <div className='text-center py-10 text-gray-500'>
          <ActivityIcon className='w-8 h-8 mx-auto mb-2 animate-tremor repeat-2' />
          No hay eventos deportivos activos.
          </div>
      )}
      {/* {localStorage.getItem('ADMIN_MODE') === 'active' && (
        <pre>{JSON.stringify(sorting, null, 2)}</pre>
      )} */}
    </div>
  );
}
