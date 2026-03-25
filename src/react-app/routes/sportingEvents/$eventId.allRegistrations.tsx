import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import {
  getAuthenticatedThrow,
  postAuthenticated
} from '@/lib/apiCalls';
import {
  ARSportingEventRegistrationFlatSchema,
} from '@shared/apiRespTypes';
import z from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  PackageIcon,
  PackageOpenIcon,
  ActivityIcon,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowUpCircleIcon,
  ArrowLeftRightIcon,
  CircleXIcon,
  CircleCheckIcon,
  CircleDollarSignIcon,
  SearchIcon,
  AlertCircle,
  PercentCircleIcon,
  EllipsisIcon,
  GroupIcon,
  UngroupIcon,
} from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenuGroup,
  // DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  GroupingState,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  createColumnHelper,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import { GoBackButton } from '@/components/goBackButton';
import { customFilterFn, getMessage } from '@/lib/utils';
import React from 'react';
import { SpEvTransactionRegPaymentForm } from '@/components/spEvTransactionRegPayment';
import { PaginationButtons } from '@/components/paginationButtons';


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
  const { eventId } = Route.useParams();
  const [data, setData] = React.useState(resRegApi.body.data);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });
  const [grouping, setGrouping] = React.useState<GroupingState>([])
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [generalActionBtnsEnabled, setGeneralActionBtnsEnabled] = React.useState({
    canCancel: false,
    canMarkPaid: false,
    canApplyDiscount: false,
    canReactivate: false,
  });

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

  const [addPaymentRegId, setAddPaymentRegId] = React.useState<number | null>(null);
  const [applyDiscountRegId, setApplyDiscountRegId] = React.useState<number[] | null>(null);
  const [markPaidRegId, setMarkPaidRegId] = React.useState<number[] | null>(null);
  const [cancelingRegId, setCancelingRegId] = React.useState<number[] | null>(null);
  const [reactivatingRegId, setReactivatingRegId] = React.useState<number[] | null>(null);
  const [transferringRegId, setTransferringRegId] = React.useState<number | null>(null);


  const statusBadges: Record<string, { text: string, color: string }> = {
    'pending': { text: 'Pendiente', color: 'border border-yellow-400 text-yellow-500' },
    'paid': { text: 'Pagado', color: 'border border-green-400 text-green-500' },
    'expired': { text: 'Expirado', color: 'border border-gray-400 text-gray-500' },
    'cancelled': { text: 'Cancelado', color: 'border border-gray-400 text-gray-500' },
  };

  const columnHelper = createColumnHelper<z.infer<typeof ARSportingEventRegistrationFlatSchema>>();

  const defaultColumns = [
    columnHelper.display({
      "id": "select",
      header: ({ table }) => (
        <div className="flex gap-2 items-center px-1">
          <Checkbox
            className="cursor-pointer"
            checked={table.getIsSomeRowsSelected() ? "indeterminate" : table.getIsAllRowsSelected()}
            onCheckedChange={
              (c) => table.getToggleAllRowsSelectedHandler()(
                {target: {checked: c === "indeterminate" ? true : c}}
              )
            }
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className={"flex gap-2 items-center px-1 " /*+ `pl-${row.depth*4}`*/}>
          <Checkbox
            className="cursor-pointer"
            checked={row.getIsSomeSelected() ? "indeterminate" : row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={
              (c) => row.getToggleSelectedHandler()(
                {target: {checked: c === "indeterminate" ? true : c}}
              )
            }
          />
        </div>
      ),
      aggregatedCell: ({ row }) => (
        <div className={"flex gap-2 items-center px-1 "
          + `pl-${row.depth}`}>
          <Checkbox
            className="cursor-pointer"
            checked={row.getIsSomeSelected() ? "indeterminate" : row.getIsAllSubRowsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={
              (c) => row.subRows.forEach(subRow => {
                if (subRow.getCanSelect()) {
                  subRow.getToggleSelectedHandler()(
                    {target: {checked: c === "indeterminate" ? true : c}}
                  )
                }
              })
            }
          />
        </div>
      ),
    }),
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
      enableGrouping: false,
    }),
    columnHelper.accessor('user_training_team_name', {
      header: 'Equipo',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
      sortingFn: 'alphanumeric',
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
      sortingFn: (rowA, rowB, columnId) => {
        const statusA: string = rowA.getValue(columnId);
        const statusB: string = rowB.getValue(columnId);
        const order = ['not_registered', 'pending', 'paid', 'expired', 'cancelled'];
        return order.indexOf(statusA) - order.indexOf(statusB);
      },
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
      enableGrouping: false,
      aggregationFn: () => {},
    }),
    columnHelper.accessor('discount_percentage', {
      header: 'Desc.',
      cell: info => <div>
        <Popover>
          <PopoverTrigger
            asChild
            disabled={!info.getValue() || info.getValue() === 0}
          >
            <button className={
              (!info.getValue() || info.getValue() === 0)
                ? ''
                : 'underline decoration-dotted cursor-pointer'
              }
            >
              {info.getValue().toFixed(0)}%
            </button>
          </PopoverTrigger>
          <PopoverContent>
            <div className='text-xs'>{info.row.original.discount_reason}</div>
          </PopoverContent>
        </Popover>
      </div>,
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
      enableGrouping: false,
      aggregationFn: () => {},
    }),
    columnHelper.accessor('category', {
      header: 'Categoría',
      cell: info => <div>
        <Popover>
          <PopoverTrigger asChild>
            <button className='underline decoration-dotted cursor-pointer'>{info.getValue()}</button>
          </PopoverTrigger>
          <PopoverContent>
            <div className='space-y-1 text-xs'>
              <p><b>Circuito</b> {info.row.original.circuit_name} ({info.row.original.circuit_distance_km}km)</p>
              <p><b>Competitivo</b> {info.row.original.circuit_competitive ? 'Sí' : 'No'}</p>
              <p><b>Edad al inscribirse</b> {info.row.original.age_at_registration}</p>
            </div>
          </PopoverContent>
        </Popover>
      </div>,
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
      sortingFn: 'alphanumeric',
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('bib_number', {
      header: 'Dorsal',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
      enableGlobalFilter: true,
      enableGrouping: false,
      aggregationFn: () => {},
    }),
    columnHelper.accessor('chip_id', {
      header: 'Chip',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
      sortingFn: 'alphanumeric',
      enableGlobalFilter: true,
      enableGrouping: false,
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
      cell: info => <div>
        {info.getValue()
        ? <div className='text-green-500 p-2'><PackageOpenIcon className='w-4 h-4' /></div>
        : <div className='text-gray-500 p-2'><PackageIcon className='w-4 h-4' /></div>}
      </div>,
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
            <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                Acciones
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {props.row.original.status === "pending" && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setAddPaymentRegId(props.row.original.id);
                      }}
                    >
                      <CircleDollarSignIcon className='w-4 h-4 text-blue-500' />
                      Registrar pago
                    </DropdownMenuItem>
                  )}
                  {props.row.original.status === "pending" && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setApplyDiscountRegId([props.row.original.id]);
                      }}
                    >
                      <PercentCircleIcon className='w-4 h-4' />
                      Aplicar descuento
                    </DropdownMenuItem>
                  )}
                  {["pending", "expired"].includes(props.row.original.status) && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setMarkPaidRegId([props.row.original.id]);
                      }}
                    >
                      <CircleCheckIcon className='w-4 h-4 text-green-500' />
                      Desestimar pendiente
                    </DropdownMenuItem>
                  )}
                  {["pending", "paid"].includes(props.row.original.status) && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setCancelingRegId([props.row.original.id]);
                      }}
                    >
                      <CircleXIcon className='w-4 h-4 text-red-500' />
                      Cancelar
                    </DropdownMenuItem>
                  )}
                  {props.row.original.status === "cancelled" && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setReactivatingRegId([props.row.original.id]);
                      }}
                    >
                      <ArrowUpCircleIcon className='w-4 h-4 text-blue-500' />
                      Reactivar
                    </DropdownMenuItem>
                  )}
                  {props.row.original.status === "paid" && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        setTransferringRegId(props.row.original.id);
                      }}
                    >
                      <ArrowLeftRightIcon className='w-4 h-4' />
                      Transferir
                    </DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>

              </DropdownMenuPortal>
            </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer group" onClick={async () => {
                // Lógica para marcar el kit como entregado
                const res = await postAuthenticated(
                  `/api/sportingEvents/${eventId}`
                  + `/registrations/${props.row.original.id}`
                  + `/deliveredKit/${props.row.original.kit_delivered ? 'false' : 'true'}`);
                if (res.status !== 200) {
                  console.error(
                    'Error al marcar como entregado:',
                    getMessage(res.body?.message, 'Error desconocido')
                  );
                  setError('Hubo un error al marcar como entregado. '
                    + 'Por favor, intenta nuevamente más tarde.');
                }
                setData(prevData => prevData.map(item => 
                  item.id === props.row.original.id 
                    ? { ...item, kit_delivered: !item.kit_delivered } 
                    : item
                ));
              }}>
                <PkgAnimation kit_delivered={props.row.original.kit_delivered} />
              </DropdownMenuItem>

            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    })
  ]

  const table = useReactTable({
    columns: defaultColumns,
    data: data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
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
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      pagination,
      grouping,
    },
    onPaginationChange: setPagination,
    // use the row's id from the database as the row id
    getRowId: row => row.id.toString(),
    onGroupingChange: (updater) => {
      setGrouping((old) => {
        const newGrouping = typeof updater === 'function' ? updater(old) : updater;
        // Take only the last clicked (or first) column to limit to 1
        return newGrouping.slice(-1);
      });
    },
  })

  React.useEffect(() => {
    if (Object.keys(rowSelection).length === 0) {
      setGeneralActionBtnsEnabled({
        canCancel: false,
        canMarkPaid: false,
        canApplyDiscount: false,
        canReactivate: false,
      });
      return;
    }
    let canCancel = true;
    let canMarkPaid = true;
    let canApplyDiscount = true;
    let canReactivate = true;
    Object.keys(rowSelection).forEach((key) => {
      const row = table.getRow(key);
      canCancel = canCancel && ["pending", "paid"].includes(row.original.status);
      canMarkPaid = canMarkPaid && ["pending", "expired"].includes(row.original.status);
      canApplyDiscount = canApplyDiscount && row.original.status === 'pending';
      canReactivate = canReactivate && row.original.status === 'cancelled';
      // console.log('row', row.original.status, canCancel, canMarkPaid, canApplyDiscount);
    });
    setGeneralActionBtnsEnabled({
      canCancel,
      canMarkPaid,
      canApplyDiscount,
      canReactivate,
    });
  }, [
    table,
    rowSelection,
  ])

  return (
    <div className='max-w-full my-2 p-5 mx-auto'>
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

      <GoBackButton />

      <AddPaymentRegDialog
        eventId={eventId}
        regId={addPaymentRegId}
        setRegId={setAddPaymentRegId}
        setSuccess={setSuccess}
        />

      <ApplyDiscountRegDialog
        eventId={eventId}
        regsId={applyDiscountRegId}
        setRegsId={setApplyDiscountRegId}
        setError={setError}
        setSuccess={setSuccess}
        onSuccess={(regs) => {
          setData(prevData => prevData.map(reg => {
            const found = regs.find(r => r.id === reg.id)
            if (!found) return reg;
            return {
              ...reg,
              status: found.status,
              pending_to_pay: found.pending,
              discount_percentage: found.discount,
              discount_reason: 'Descuento aplicado manualmente por el organizador'
            }
          }));
        }}
        />

      <MarkAsPaidRegDialog
        eventId={eventId}
        regsId={markPaidRegId}
        setRegsId={setMarkPaidRegId}
        setError={setError}
        setSuccess={setSuccess}
        onSuccess={(regs) => {
          setData(prevData => prevData.map(reg => {
            const found = regs.find(r => r.id === reg.id)
            if (!found) return reg;
            return {
              ...reg,
              status: found.status,
              pending_to_pay: found.pending,
            }
          }));
        }}
        />

      <CancelRegDialog
        eventId={eventId}
        regsId={cancelingRegId}
        setRegsId={setCancelingRegId}
        setError={setError}
        setSuccess={setSuccess}
        onSuccess={async () => {
          setSuccess('Inscripciones canceladas exitosamente.');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }}
        />

      <ReactivatingRegDialog
        eventId={eventId}
        regsId={reactivatingRegId}
        setRegsId={setReactivatingRegId}
        setError={setError}
        setSuccess={setSuccess}
        onSuccess={async () => {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }}
        />

      <TransferRegDialog
        eventId={eventId}
        regId={transferringRegId}
        setRegId={setTransferringRegId}
        setError={setError}
        setSuccess={setSuccess}
        onSuccess={async () => {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }}
      />

      <div className='flex flex-col sm:flex-row sm:justify-between'>
        <div className='mb-4 sm:mb-0 w-full'>
          <h1 className='text-2xl font-bold mb-4'>Inscripciones</h1>
          {resRegApi.body.data.length > 0 && (
            <div className='flex gap-2 items-center mb-4 w-full max-w-sm relative'>
              <SearchIcon className='w-4 h-4 text-gray-400 absolute right-2' />
              <Input
                value={table.getState().globalFilter ?? ''}
                onChange={e => table.setGlobalFilter(String(e.target.value))}
                placeholder="Buscar..."
              />
            </div>
          )}
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
      <div className='mb-4 flex gap-2'>
        <Button
          variant="outline"
          className='cursor-pointer'
          disabled={!generalActionBtnsEnabled.canApplyDiscount}
          onClick={() => {
            setApplyDiscountRegId(Object.keys(rowSelection).map(id => Number(id)));
          }}
        >
          <PercentCircleIcon className='w-4 h-4' />
          Aplicar descuento
        </Button>
        <Button
          variant="outline"
          className='cursor-pointer'
          disabled={!generalActionBtnsEnabled.canMarkPaid}
          onClick={() => {
            setMarkPaidRegId(Object.keys(rowSelection).map(id => Number(id)));
          }}
        >
          <CircleCheckIcon className='w-4 h-4 text-green-500' />
          Desestimar pendiente
        </Button>
        <Button
          variant="outline"
          className='cursor-pointer'
          disabled={!generalActionBtnsEnabled.canCancel}
          onClick={() => {
            setCancelingRegId(Object.keys(rowSelection).map(id => Number(id)));
          }}
        >
          <CircleXIcon className='w-4 h-4 text-red-500' />
          Cancelar
        </Button>
        <Button
          variant="outline"
          className='cursor-pointer'
          disabled={!generalActionBtnsEnabled.canReactivate}
          onClick={() => {
            setReactivatingRegId(Object.keys(rowSelection).map(id => Number(id)));
          }}
        >
          <ArrowUpCircleIcon className='w-4 h-4 text-blue-500' />
          Reactivar
        </Button>
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
                      <div className='flex items-center gap-2'>
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
                        {(cell.column.id === "user_training_team_name"
                          && row.subRows.length >= 10)
                          && <span className='text-primary'>
                            <PercentCircleIcon className='w-4 h-4' />
                            </span>
                        }
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}{" "}
                        <span className='text-muted-foreground'>({row.subRows.length})</span>
                      </div>
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
          </TableBody>
        </Table>
        {Object.keys(rowSelection).length > 0 && (
          <div className='flex items-center gap-2 mt-2 text-muted-foreground'>
            <span>{Object.keys(rowSelection).length} inscripciones seleccionadas</span>
          </div>
        )}
        <PaginationButtons
          table={table}
          pagination={pagination}
        />
        </div>
      ) : (
        <div className='text-center py-10 text-muted-foreground min-w-3xl max-w-full'>
          <ActivityIcon className='w-8 h-8 mx-auto mb-2 animate-tremor repeat-2' />
          No hay resultados para tu búsqueda.
        </div>
      ))}
      {resRegApi.body.data.length === 0 && (
        <div className='text-center py-10 text-muted-foreground'>
          <ActivityIcon className='w-8 h-8 mx-auto mb-2 animate-tremor repeat-2' />
          No hay inscripciones aún.
        </div>
      )}
    </div>
  )
}


export const PkgAnimation = ({kit_delivered} : {kit_delivered: boolean}) => {
  const open = <PackageOpenIcon className='w-4 h-4' />;
  const closed = <PackageIcon className='w-4 h-4' />;
  const order = kit_delivered ? [open, closed] : [closed, open];

  return (
    <div className='flex gap-2 items-center'>
      <div className='group-hover:hidden'>{order[0]}</div>
      <div className='hidden group-hover:block'>{order[1]}</div>
      Kit {kit_delivered ? 'NO entregado' : 'ya entregado'}
    </div>
  )
}


const AddPaymentRegDialog = ({
  regId,
  setRegId,
  eventId,
  setSuccess,
}: {
  regId: number | null,
  setRegId: (regId: number | null) => void,
  eventId: string,
  setSuccess: (msg: string) => void,
}) => {

  return (
    <Dialog open={regId !== null} onOpenChange={() => {
      setRegId(null);
    }}>
      <DialogContent showCloseButton={true} className='md:min-w-3xl lg:min-w-4xl'>
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
          <DialogDescription>
            Se agregará una nueva transacción de pago a la inscripción,
            sumando al monto ya pagado. Útil para registrar pagos
            parciales o pagos realizados fuera de la plataforma
            (transferencia, efectivo, etc.).
          </DialogDescription>

          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
            <SpEvTransactionRegPaymentForm
              eventId={Number(eventId)}
              regId={regId!}
              onSuccess={async () => {
                setSuccess('Pago registrado exitosamente.');
                setRegId(null);
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              }}
            />
          </div>

          <div className='flex gap-2 justify-end mt-2'>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className='max-w-20 cursor-pointer'
              >
                Salir
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}


const ApplyDiscountRegDialog = ({
  regsId,
  setRegsId,
  eventId,
  setError,
  setSuccess,
  onSuccess,
}: {
  regsId: number[] | null,
  setRegsId: (regsId: number[] | null) => void,
  eventId: string,
  setError: (msg: string) => void,
  setSuccess: (msg: string) => void,
  onSuccess: (regs: {id: number, status: 'pending' | 'paid', discount: number, pending: number}[]) => void,
}) => {
  const [discount, setDiscount] = React.useState(0);
  const [reason, setReason] = React.useState('');

  React.useEffect(() => {
    if (regsId && regsId.length >= 10) {
      setReason('Descuento para equipos con 10 o más inscripciones');
    }
  }, [regsId])

  return (
    <Dialog open={regsId !== null} onOpenChange={() => {
      setDiscount(0);
      setReason('');
      setRegsId(null);
    }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Descuento</DialogTitle>
          <DialogDescription>
            Se aplicará un descuento al monto de la tarifa total de la inscripción.
          </DialogDescription>

          <Label htmlFor="discount" className="mt-4">Porcentaje de descuento a aplicar (%)</Label>
          <Input
            id="discount"
            name="discount"
            placeholder=""
            value={discount || ''}
            onChange={(e) => {
              const num = Number(e.target.value)
              if (isNaN(num) || num < 0 || num > 100) {
                return;
              }
              setDiscount(num)
            }}
            required={true}
            />
          <Label htmlFor="reason" className="mt-4">Motivo del descuento (opcional)</Label>
          <Input
            id="reason"
            name="reason"
            placeholder=""
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required={false}
            />

          <div className='flex gap-2 justify-end mt-2'>
            {(!discount || discount <= 0) && (
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="cursor-pointer"
                  disabled={!!discount || discount > 0}
                  onClick={async (e) => {
                    if (discount || discount > 0) {
                      e.preventDefault();
                      return;
                    }
                    // Lógica para sacar un descuento
                    const r = await postAuthenticated<
                      {id: number, status: 'pending' | 'paid', discount: number, pending: number}[]
                      >(`/api/sportingEvents/${eventId}/registrations/applyDiscount`,
                        {registrationIds: regsId, discount: 0}
                      );
                    if (r.status !== 200) {
                      console.error('Error sacando el descuento:', getMessage(r.body?.message, 'Error desconocido'));
                      setError('Hubo un error al sacar el descuento. Por favor, intenta nuevamente.');
                    } else {
                      setSuccess('Descuento sacado exitosamente.');
                      onSuccess(r.body?.data);
                    }
                    setDiscount(0);
                    setReason('');
                    setRegsId(null);
                  }}
                >
                  Sacar descuento
                </Button>
              </DialogClose>
            )}
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className='max-w-20 cursor-pointer'
              >
                Cancelar
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="default"
                className='max-w-20 cursor-pointer'
                disabled={!discount || discount <= 0}
                onClick={async (e) => {
                  if (!discount || discount <= 0) {
                    e.preventDefault();
                    return;
                  }
                  // Lógica para aplicar un descuento
                  const r = await postAuthenticated<
                    {id: number, status: 'pending' | 'paid', discount: number, pending: number}[]
                    >(`/api/sportingEvents/${eventId}/registrations/applyDiscount`,
                      {registrationIds: regsId, discount: discount, reason: reason}
                    );
                  if (r.status !== 200) {
                    console.error('Error aplicando el descuento:', getMessage(r.body?.message, 'Error desconocido'));
                    setError('Hubo un error al aplicar el descuento. Por favor, intenta nuevamente.');
                  } else {
                    setSuccess('Descuento aplicado exitosamente.');
                    onSuccess(r.body?.data);
                  }
                  setDiscount(0);
                  setReason('');
                  setRegsId(null);
                }}
              >
                Aplicar
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}


const MarkAsPaidRegDialog = ({
  regsId,
  setRegsId,
  eventId,
  setError,
  setSuccess,
  onSuccess,
}: {
  regsId: number[] | null,
  setRegsId: (regsId: number[] | null) => void,
  eventId: string,
  setError: (msg: string) => void,
  setSuccess: (msg: string) => void,
  onSuccess: (regs: {id: number, status: 'pending' | 'paid', discount: number, pending: number}[]) => void,
}) => {
  return (
    <Dialog open={regsId !== null} onOpenChange={() => {
      setRegsId(null);
    }}>
      {/* <DialogTrigger className='w-full'>
        {children}
      </DialogTrigger> */}
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Desestimar monto pendiente</DialogTitle>
          <DialogDescription>
            Se le dará al beneficiario como descuento el monto
            pendiente de pago, completando así el pago de la inscripción.
          </DialogDescription>

          <div className='flex gap-2 justify-end mt-2'>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className='max-w-20 cursor-pointer'
              >
                Cancelar
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="default"
                className='max-w-20 cursor-pointer'
                onClick={async () => {
                  // Lógica para desestimar el monto pendiente
                  const r = await postAuthenticated<
                    {id: number, status: 'pending' | 'paid', discount: number, pending: number}[]
                    >(
                    `/api/sportingEvents/${eventId}/registrations/dismissPending`,
                    {registrationIds: regsId}
                  );
                  if (r.status !== 200) {
                    console.error('Error desestimando el monto pendiente:', getMessage(r.body?.message, 'Error desconocido'));
                    setError('Hubo un error al desestimar el monto pendiente. Por favor, intenta nuevamente.');
                  } else {
                    setSuccess('Monto pendiente desestimado exitosamente.');
                    onSuccess(r.body.data);
                  }
                  setRegsId(null);
                }}
              >
                Confirmar
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}


const CancelRegDialog = ({
  regsId,
  setRegsId,
  eventId,
  setError,
  setSuccess,
  onSuccess,
}: {
  regsId: number[] | null,
  setRegsId: (regsId: number[] | null) => void,
  eventId: string,
  setError: (msg: string) => void,
  setSuccess: (msg: string) => void,
  onSuccess: () => void,
}) => {
  return (
    <Dialog open={regsId !== null} onOpenChange={() => {
      setRegsId(null);
    }}>
      {/* <DialogTrigger className='w-full'>
        {children}
      </DialogTrigger> */}
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>Al cancelar la inscripción,
            evitarás que el usuario participe en el evento y
            no se pueda volver a inscribir a no ser que vuelvas
            a activarlo manualmente.
          </DialogDescription>

          <div className='flex gap-2 justify-end mt-2'>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className='max-w-20 cursor-pointer'
              >
                Salir
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="destructive"
                className='max-w-20 cursor-pointer'
                onClick={async () => {
                  // Lógica para cancelar la inscripción
                  const r = await postAuthenticated(
                    `/api/sportingEvents/${eventId}/registrations/cancel`,
                    {registrationIds: regsId}
                  );
                  if (r.status !== 200) {
                    console.error('Error canceling registration:', getMessage(r.body?.message, 'Error desconocido'));
                    setError('Hubo un error al cancelar la inscripción. Por favor, intenta nuevamente.');
                  } else {
                    setSuccess('Inscripción cancelada exitosamente.');
                    onSuccess();
                  }
                  setRegsId(null);
                }}
              >
                Confirmar
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

const ReactivatingRegDialog = ({
  regsId,
  setRegsId,
  eventId,
  setError,
  setSuccess,
  onSuccess,
}: {
  regsId: number[] | null,
  setRegsId: (regsId: number[] | null) => void,
  eventId: string,
  setError: (msg: string) => void,
  setSuccess: (msg: string) => void,
  onSuccess: () => void,
}) => {
  return (
    <Dialog open={regsId !== null} onOpenChange={() => {
      setRegsId(null);
    }}>
      {/* <DialogTrigger className='w-full'>
        {children}
      </DialogTrigger> */}
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>Al reactivar la inscripción, el usuario podrá volver a participar en el evento.</DialogDescription>

          <div className='flex gap-2 justify-end mt-2'>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className='max-w-20 cursor-pointer'
              >
                Salir
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="default"
                className='max-w-20 cursor-pointer'
                onClick={async () => {
                  // Lógica para reactivar la inscripción
                  const r = await postAuthenticated(
                    `/api/sportingEvents/${eventId}/registrations/reactivate`,
                    {registrationIds: regsId}
                  );
                  if (r.status !== 200) {
                    console.error('Error reactivating registration:', getMessage(r.body?.message, 'Error desconocido'));
                    setError('Hubo un error al reactivar la inscripción. Por favor, intenta nuevamente.');
                  } else {
                    setSuccess('Inscripción reactivada exitosamente.');
                    onSuccess();
                  }
                  setRegsId(null);
                }}
              >
                Confirmar
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

const TransferRegDialog = ({
  regId,
  setRegId,
  eventId,
  setError,
  setSuccess,
  onSuccess,
}: {
  regId: number | null,
  setRegId: (regId: number | null) => void,
  eventId: string,
  setError: (msg: string) => void,
  setSuccess: (msg: string) => void,
  onSuccess: () => void,
}) => {
  const [benefUserId, setBenefUserId] = React.useState("");

  return (
    <Dialog open={regId !== null} onOpenChange={() => {
      setRegId(null);
    }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Descuento</DialogTitle>
          <DialogDescription>
            Se aplicará un descuento al monto de la tarifa total de la inscripción.
          </DialogDescription>

          <Input
            name="benefUserId"
            placeholder="DNI del usuario beneficiario"
            value={benefUserId || ''}
            onChange={(e) => setBenefUserId(e.target.value)}
            required={true}
            />

          <div className='flex gap-2 justify-end mt-2'>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className='max-w-20 cursor-pointer'
              >
                Cancelar
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="default"
                className='max-w-20 cursor-pointer'
                onClick={async (e) => {
                  if (!benefUserId) {
                    e.preventDefault();
                    return;
                  }
                  // Lógica para transferir la inscripción
                  const r = await postAuthenticated(
                    `/api/sportingEvents/${eventId}/registrations/transfer`,
                    {fromRegistrationId: regId, benefUserId: benefUserId}
                  );
                  if (r.status !== 200) {
                    console.error('Error transfiriendo inscripción:', getMessage(r.body?.message, 'Error desconocido'));
                    setError(
                      'Hubo un error al transferir la inscripción. '
                      + getMessage(r.body?.message, 'Error desconocido'));
                  } else {
                    setSuccess('Inscripción transferida exitosamente.');
                    onSuccess();
                  }
                  setBenefUserId('');
                  setRegId(null);
                }}
              >
                Confirmar
              </Button>
              </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
