import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticated } from '@/lib/apiCalls';
import {
  // FileArchiveIcon,
  EditIcon,
  Info,
  ActivityIcon
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
  createColumnHelper,
  useReactTable,
  flexRender
} from '@tanstack/react-table';
import {
  SportingEventBasicInfoSchema,
  ARAllSportingEventSchema
} from '@shared/apiRespTypes';
import z from 'zod';

export const Route = createFileRoute('/sportingEvents/active')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const res = await getAuthenticated<
      z.infer<typeof ARAllSportingEventSchema>
      >('/api/sportingEvents', ARAllSportingEventSchema);
    return { res }
  },
  staleTime: 1000 * 60 * 5,
})

function RouteComponent() {
  const { res } = Route.useLoaderData();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const SpBSchema = SportingEventBasicInfoSchema.extend({
    status: z.string(),
  })

  const columnHelper = createColumnHelper<z.infer<typeof SpBSchema>>();

  const defaultColumns = [
    columnHelper.accessor('status', {
      cell: info => ({"open": "Abierto", "comingSoon": "Próximo", "closed": "Cerrado"}[info.getValue()] || info.getValue()),
      header: () => 'Estado',
      footer: props => props.column.id,
    }),
    columnHelper.accessor('title', {
      cell: info => info.getValue(),
      header: () => 'Título',
      footer: props => props.column.id,
    }),
    columnHelper.accessor('date', {
      cell: info => info.getValue().toLocaleDateString(),
      header: () => 'Fecha',
      footer: props => props.column.id,
    }),
    columnHelper.accessor('fee_amount', {
      cell: info => info.getValue() ? `$${info.getValue()}` : <div className='bg-destructive text-white rounded-full text-center p-1'>N/A</div>,
      header: () => 'Tarifa',
      footer: props => props.column.id,
    }),
    columnHelper.accessor('location', {
      cell: info => info.getValue(),
      header: () => 'Ubicación',
      footer: props => props.column.id,
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
    }),
    columnHelper.accessor('registration_end', {
      cell: info => info.getValue()?.toLocaleDateString() || 'N/A',
      header: () => 'Fin de inscripciones',
      footer: props => props.column.id,
    }),
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
  ]

  const data = res.body.data.open.map(e => ({...e, status: "open"}))
    .concat(res.body.data.comingSoon.map(e => ({...e, status: "comingSoon"})))
    .concat(res.body.data.closed.map(e => ({...e, status: "closed"})))

  const tableOpen = useReactTable({
    columns: defaultColumns,
    data,
    getCoreRowModel: getCoreRowModel(),
  })

  // tableOpen.getRowModel().rows

  return (
    <div className='max-w-full my-3 p-2 mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Eventos deportivos activos</h1>
      {tableOpen.getRowModel().rows.length > 0 && (
        <Table className='border-2 min-w-3xl max-w-full'>
        <TableHeader>
          {tableOpen.getHeaderGroups().map(headerGroup => {
            return (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            )
          })}
        </TableHeader>
        <TableBody>
          {tableOpen.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getAllCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
      {tableOpen.getRowModel().rows.length === 0 && (
        <div className='text-center py-10 text-gray-500'>
          <ActivityIcon className='w-8 h-8 mx-auto mb-2 animate-tremor repeat-2' />
          No hay eventos deportivos activos.
          </div>
      )}
    </div>
  );
}
