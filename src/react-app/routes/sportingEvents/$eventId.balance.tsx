import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import {
  getAuthenticatedThrow,
  postAuthenticated
} from '@/lib/apiCalls';
import z from 'zod';
import {
  ARSportEvTransactionMinSchema
} from '@shared/apiRespTypes';
import { Button } from '@/components/ui/button';
import { DeleteButton } from '@/components/deleteButton';
import {
  ActivityIcon,
  ArrowUp,
  ArrowDown,
  BadgeDollarSign,
  AlertCircle,
  InfoIcon,
  EditIcon,
} from 'lucide-react';
import React from 'react';
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
  createColumnHelper,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import { getMessage } from '@/lib/utils';
import { GoBackButton } from '@/components/goBackButton';


export const Route = createFileRoute('/sportingEvents/$eventId/balance')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const resTrApi = await getAuthenticatedThrow<
      z.infer<typeof ARSportEvTransactionMinSchema>[]
      >(`/api/sportingEventTransactions/all/${params.eventId}`,
        z.array(ARSportEvTransactionMinSchema));
    return { resTrApi };
  },
  staleTime: 5,
})


function RouteComponent() {
  const { resTrApi } = Route.useLoaderData();
  const data = resTrApi.body.data || [];
  const { eventId } = Route.useParams();
  const totalInflow = data
    .filter(tr => tr.transaction_type === 'inflow')
    .reduce((sum, tr) => sum + tr.amount, 0)
  const totalOutflow = data
    .filter(tr => tr.transaction_type === 'outflow')
    .reduce((sum, tr) => sum + tr.amount, 0)
  const totalBalance = totalInflow - totalOutflow;

  const [error, _setError] = React.useState('');
  const [success, _setSuccess] = React.useState('');
  const setError = (msg: string) => {
    _setError(msg)
    setTimeout(() => {
      _setError('');
    }, 2000);
  };
  const setSuccess = (msg: string) => {
    _setSuccess(msg)
    setTimeout(() => {
      _setSuccess('');
    }, 3000);
  };

  const columnHelper = createColumnHelper<z.infer<typeof ARSportEvTransactionMinSchema>>();

  const defaultColumns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
      enableGrouping: false,
    }),
    columnHelper.accessor('transaction_type', {
      header: 'Tipo',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('category', {
      header: 'Categoría',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('payment_method', {
      header: 'Método de Pago',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('amount', {
      header: 'Monto',
      cell: info => info.getValue().toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
    }),
    columnHelper.display({
      "id": "actions",
      cell: props => (<div className='flex gap-2'>
        <Button
          variant='outline'
          size="icon-sm"
          className='cursor-pointer'
          title="Ver detalles"
        >
          {/* TODO: Open dialog */}
          <InfoIcon className='w-4 h-4' />
        </Button>
        <Button
          variant='outline'
          size="icon-sm"
          className='cursor-pointer'
          title="Editar transacción"
        >
          {/* TODO: Open dialog */}
          <EditIcon className='w-4 h-4' />
        </Button>
        <DeleteButton
          dgDescription="Esta acción no se puede deshacer. Esto eliminará permanentemente la transacción."
          onConfirm={async () => {
            // Lógica para eliminar la transacción
            const res = await postAuthenticated(`/api/sportingEventTransactions/delete/${props.row.original.id}`);
            if (res.status !== 200) {
              console.error(
                'Error al eliminar la transacción:',
                getMessage(res.body?.message, 'Error desconocido')
              );
              setError('Hubo un error al eliminar la transacción: '
                + getMessage(res.body?.message, 'Error desconocido')
              );
              return;
            }
            setSuccess('Transacción eliminada exitosamente');
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }}
        />
      </div>),
    })
  ]

  const table = useReactTable({
    columns: defaultColumns,
    data: data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className='max-w-full my-2 p-5 mx-auto'>
      <GoBackButton />
      
      {error && (
        <div className="my-4 bg-red-500/10 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="my-4 bg-green-500/10 text-green-600 p-3 rounded-md text-sm">
          {success}
        </div>
      )}

      <div className='flex flex-col sm:flex-row sm:justify-between'>
        <div className='mb-4 sm:mb-0'>
          <h1 className='text-2xl font-bold mb-4'>Balance del Evento</h1>
        </div>
        <div className='flex gap-2 flex-col sm:flex-row mb-8 sm:mb-0'>
          <Button asChild variant="outline">
            <Link to="/sportingEvents/$eventId/newTransaction" params={{ eventId }}>
              <BadgeDollarSign className="w-4 h-4" />
              Nueva transacción
            </Link>
          </Button>
        </div>
      </div>
      <div className='flex flex-col gap-2 mb-5'>
        <Table className='border min-w-3xl max-w-full'>
          <TableBody>
            <TableRow>
              <TableCell>
                Ingresos
              </TableCell>
              <TableCell className='text-green-600 font-medium'>
                {totalInflow.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </TableCell>
              <TableCell>
                Egresos
              </TableCell>
              <TableCell className='text-red-600 font-medium'>
                {totalOutflow.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </TableCell>
              <TableCell>
                Balance
              </TableCell>
              <TableCell className={`font-medium ${
                totalBalance > 0
                  ? 'text-green-600'
                  : totalBalance < 0
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}>
                {totalBalance.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

      </div>
      <div className='flex flex-col gap-2'>
        <div>
          <h2 className='text-lg font-semibold mb-2'>Transacciones</h2>
        </div>
        {/* <div className='flex gap-2 items-center mb-4 max-w-sm relative'>
          <SearchIcon className='w-4 h-4 text-gray-400 absolute right-2' />
          <Input
            value={table.getState().globalFilter ?? ''}
            onChange={e => table.setGlobalFilter(String(e.target.value))}
            placeholder="Buscar..."
          />
        </div> */}
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
          <div className='text-gray-500 mt-2'>{table.getRowModel().rows.length.toLocaleString()} resultados</div>
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
            No hay transacciones registradas para este evento.
          </div>
        )}
        {/* {localStorage.getItem('ADMIN_MODE') === 'active' && (
          <pre>{JSON.stringify(sorting, null, 2)}</pre>
        )} */}

      </div>

    </div>
  )
}
