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
// import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DeleteButton } from '@/components/deleteButton';
import { GoBackButton } from '@/components/goBackButton';
import {
  ActivityIcon,
  ArrowUp,
  ArrowDown,
  BadgeDollarSign,
  AlertCircle,
  InfoIcon,
  EditIcon,
  BanknoteArrowUpIcon,
  BanknoteArrowDownIcon,
  UngroupIcon,
  GroupIcon,
  ArrowRight,
  // SearchIcon,
} from 'lucide-react';
import React from 'react';
import {
  TransactionCategoryDesc,
  // TransactionTypeDesc,
  // TransactionPaymentMethodDesc,
  // TransactionStatusDesc,
} from "@shared/lang";
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
  // getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  createColumnHelper,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import { getMessage, getLang } from '@/lib/utils';


export const Route = createFileRoute('/sportingEvents/$eventId/transactions/')({
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
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
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
      aggregatedCell: () => {},
    }),
    columnHelper.accessor('transaction_date', {
      header: 'Fecha',
      cell: info => info.getValue().toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
      enableGrouping: false,
      aggregatedCell: () => {},
    }),
    columnHelper.accessor('transaction_type', {
      header: 'Tipo',
      cell: info => 
        info.getValue() === 'inflow'
          ? <div className="flex items-center border border-green-600 text-green-600 text-sm px-2 rounded-lg w-fit">
            <BanknoteArrowUpIcon className="w-4 h-4 mr-1" />
            Ingreso
          </div>
          : <div className="flex items-center border border-red-600 text-red-600 text-sm px-2 rounded-lg w-fit">
            <BanknoteArrowDownIcon className="w-4 h-4 mr-1" />
            Egreso
          </div>,
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('category', {
      header: 'Categoría',
      cell: info => TransactionCategoryDesc[info.getValue()][getLang()],
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
    }),
    // columnHelper.accessor('payment_method', {
    //   header: 'Método de Pago',
    //   cell: info => info.getValue() ? TransactionPaymentMethodDesc[info.getValue()][getLang()] : null,
    //   footer: props => props.column.id,
    //   enableSorting: true,
    //   enableGlobalFilter: false,
    // }),
    columnHelper.accessor('vendor_or_athlete', {
      header: 'Org/Atleta',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: true,
    }),
    columnHelper.accessor('amount', {
      header: 'Monto',
      cell: info => {
        let amount = info.getValue() as number;
        if (info.row.original.transaction_type === 'outflow') { amount = -amount; }
        return amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
      },
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
      enableGrouping: false,
      aggregatedCell: info => {
        const total = info.getValue() as number;
        return total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
      },
      aggregationFn: (_columnId, leafRows) => {
        // return the aggregated value
        const total = leafRows.reduce((sum, row) => {
          const trType = row.original.transaction_type;
          const amount = row.original.amount;
          if (trType === 'inflow') {
            return sum + amount;
          } else if (trType === 'outflow') {
            return sum - amount;
          }
          return sum;
        }, 0);
        return total;
      },
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
          <Link to='/sportingEvents/$eventId/transactions/$transactionId' params={{ eventId, transactionId: props.row.original.id!.toString() }}>
            <InfoIcon className='w-4 h-4' />
          </Link>
        </Button>
        <Button asChild
          variant='outline'
          size="icon-sm"
          className='cursor-pointer'
          title="Editar transacción"
        >
          <Link to='/sportingEvents/$eventId/transactions/$transactionId/edit' params={{ eventId, transactionId: props.row.original.id!.toString() }}>
            <EditIcon className='w-4 h-4' />
          </Link>
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
    // getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    initialState: {
      // globalFilter: '',
      sorting: [
        { id: "id", desc: false },
      ]
    },
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
            <Link to="/sportingEvents/$eventId/transactions/create" params={{ eventId }}>
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
                      (<div className='flex items-center gap-2'>
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
                      </div>)
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
              <TableRow>
                <TableCell colSpan={table.getVisibleFlatColumns().length - 2} className='text-right font-bold'>Total</TableCell>
                <TableCell className='text-left font-bold'>
                  {table.getFilteredRowModel().rows.reduce((sum, row) => {
                    if (row.original.transaction_type === 'outflow') {
                      return sum - row.original.amount
                    }
                    return sum + row.original.amount
                  }, 0).toLocaleString('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                  })}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
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

      </div>
    </div>
  )
}
