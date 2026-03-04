import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { FormBox } from '@/components/formBox';
import { SearchRegistrationForm } from '@/components/searchRegistrationForm';
import { ARSportingEventRegistrationMinSchema } from '@shared/apiRespTypes';
import { ConfirmButton } from '@/components/confirmButton';
import {
  XIcon,
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
import z from 'zod';
import { DeleteButton } from '@/components/deleteButton';
import { postAuthenticated } from '@/lib/apiCalls';
import { getMessage } from '@/lib/utils';
import React from 'react';


export const Route = createFileRoute('/sportingEvents/$eventId/kitDelivery')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
})


function RouteComponent() {
  const { eventId } = Route.useParams();
  const [data, setData] = React.useState<z.infer<typeof ARSportingEventRegistrationMinSchema>[]>([]);

  const columnHelper = createColumnHelper<z.infer<typeof ARSportingEventRegistrationMinSchema>>();

  const defaultColumns = [
    columnHelper.accessor('user_id', {
      header: 'DNI',
      cell: info => <div>
        <Link to={`/users/$userId`}
          params={{ userId: info.getValue() }}>
            {info.getValue()}
        </Link>
      </div>,
      footer: props => props.column.id,
    }),
    columnHelper.accessor('full_name', {
      header: 'Nombre Completo',
      cell: info => info.getValue(),
      footer: props => props.column.id,
    }),
    columnHelper.accessor('bib_number', {
      header: 'Dorsal',
      cell: info => info.getValue(),
      footer: props => props.column.id,
    }),
    columnHelper.accessor('chip_id', {
      header: 'Chip',
      cell: info => info.getValue(),
      footer: props => props.column.id,
    }),
    columnHelper.accessor('clothing_size', {
      header: 'Talle',
      cell: info => info.getValue(),
      footer: props => props.column.id,
    }),
    columnHelper.display({
      "id": "actions",
      cell: props => (<div className='flex gap-2'>
        {/* <Button
          variant='outline'
          size="icon-sm"
          className='cursor-pointer'
          title="Ver detalles de la inscripción"
        >
          <Link
            to={`/trainingTeams/$trainingTeamId`}
            params={{ trainingTeamId: props.row.original.id!.toString() }}
            className='w-full h-full flex items-center justify-center'
          >
            <InfoIcon className='w-4 h-4' />
          </Link>
        </Button> */}
        {props.row.original.kit_delivered ? (
          <DeleteButton
            btnIcon={<XIcon className='w-4 h-4' />}
            dgDescription="Cancela la entrega del kit, marcando como no entregado. Esta acción se puede revertir volviendo a marcar como entregado."
            onConfirm={async () => {
              // Lógica para marcar el kit como no entregado
              const res = await postAuthenticated(
                `/api/sportingEvents/${eventId}`
                + `/registrations/${props.row.original.id}`
                + `/deliveredKit/false`);
              if (res.status !== 200) {
                console.error(
                  'Error al marcar como no entregado:',
                  getMessage(res.body?.message, 'Error desconocido')
                );
                alert('Hubo un error al marcar como no entregado. '
                  + 'Por favor, intenta nuevamente más tarde.');
              }
              setData([])
            }}
          />
        ) : (
          <ConfirmButton
            dgDescription="Marca como entregado el kit a este inscripto. Esta acción se puede revertir si se marca por error."
            onConfirm={async () => {
              // Lógica para marcar el kit como entregado
              const res = await postAuthenticated(
                `/api/sportingEvents/${eventId}`
                + `/registrations/${props.row.original.id}`
                + `/deliveredKit/true`);
              if (res.status !== 200) {
                console.error(
                  'Error al marcar como entregado:',
                  getMessage(res.body?.message, 'Error desconocido')
                );
                alert('Hubo un error al marcar como entregado. '
                  + 'Por favor, intenta nuevamente más tarde.');
              }
              setData([])
            }}
          />
        )}
      </div>),
    })
  ]

  const table = useReactTable({
    columns: defaultColumns,
    data: data,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <FormBox
      title="Entrega de Kits"
      description="Marcá como entregado los kits a los inscriptos que tienen paga su inscripción."
    >
      <SearchRegistrationForm eventId={Number(eventId)} setData={setData} />

      {data.length > 0 && (
        <div className='flex flex-col gap-2 p-6 pt-0'>
        <Table className='border max-w-full'>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => {
              return (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
        <div className='text-muted-foreground mt-2'>{table.getRowModel().rows.length.toLocaleString()} resultados</div>
        </div>
      )}
    </FormBox>
  )
}
