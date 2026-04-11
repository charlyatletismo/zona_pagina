import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls';
import {
  ARUserSchema,
  ARSportingEventRegistrationFlatSchema,
  ARSportingEventSchema,
} from '@shared/apiRespTypes';
import z from 'zod';
import { GoBackButton } from '@/components/goBackButton';
import {
  ActivityIcon,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  EllipsisIcon,
  InfoIcon,
  SearchIcon,
  CircleArrowUpIcon,
  Trash2Icon,
  CopyIcon,
  CheckIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from '@/components/ui/spinner';
import { MercadoPagoLogo } from '@/components/icons/mercadoPago';
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
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  createColumnHelper,
  useReactTable,
  flexRender
} from '@tanstack/react-table';
import { getTrainingTeamsData } from '@/lib/queryCache';
import { customFilterFn, getMessage } from '@/lib/utils';
import React from 'react';
import { PaginationButtons } from '@/components/paginationButtons';


const ARUserSchemaPartial = ARUserSchema.partial().required({
  id: true,
});
const ARUserSchemaPartialArray = ARUserSchemaPartial.array();


export const Route = createFileRoute('/sportingEvents/$eventId/registerAthletes')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
  loader: async ({ params }) => {
    const trainingTeams = await getTrainingTeamsData();
    const resUsersApi = await getAuthenticatedThrow<
      z.infer<typeof ARUserSchemaPartialArray>
      >('/api/users', ARUserSchemaPartialArray);
    const resRegApi = await getAuthenticatedThrow<
      z.infer<typeof ARSportingEventRegistrationFlatSchema>[]
      >(`/api/sportingEvents/${params.eventId}/allRegistrations`,
        z.array(ARSportingEventRegistrationFlatSchema));
    const resEventData = await getAuthenticatedThrow<
      z.infer<typeof ARSportingEventSchema>
      >(`/api/sportingEvents/${params.eventId}`,
        ARSportingEventSchema);
    const finalData = [...(resRegApi.body.data || [])];
    resUsersApi.body.data.forEach((user: z.infer<typeof ARUserSchemaPartial>) => {
      const found = finalData.find(reg => reg.user_id === user.id);
      if (!found) {
        // Not registered user, add to the list with default values
        finalData.push({
          id: -1,
          user_id: user.id,
          training_team_id: user.training_team_id!,
          event_id: Number(params.eventId),
          // circuit_id: -1,
          age_at_event_date: 0,
          discount_percentage: 0,
          discount_reason: null,
          registration_date: new Date(),
          promotional_fee_applied: false,
          paid_amount: 0,
          status: "not_registered",
          full_payment_date: null,
          demanded_clothing_id: null,
          reserved_clothing_id: null,
          chip_id: null,
          bib_number: null,
          kit_delivered: false,
          updated_at: new Date(),
          category: null,
          circuit_name: null,
          circuit_distance_km: null,
          circuit_competitive: null,
          user_full_name: `${user.surname} ${user.name}`,
          user_phone: user.phone!,
          user_email: user.email!,
          user_name: user.name!,
          user_surname: user.surname!,
          user_sex: user.sex!,
          user_date_of_birth: user.date_of_birth!,
          user_location: user.location!,
          user_training_team_name: trainingTeams.find(
            team => team.id === user.training_team_id)?.name || '',
          demanded_clothing_size: user.clothing_shirt_size!,
          reserved_clothing_size: null,
          pending_to_pay: 0,
        })
      }
    });
    return { finalData, eventData: resEventData.body.data };
  },
  staleTime: 1000 * 60 * 5,
})


function RouteComponent() {
  const { finalData, eventData } = Route.useLoaderData();
  const { eventId } = Route.useParams();
  const [pagination, setPagination] = React.useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [generalActionBtnsEnabled, setGeneralActionBtnsEnabled] = React.useState({
    canPay: false,
    canRegister: false,
    canDelete: false,
  });

  const [loading, setLoading] = React.useState(false);
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

  const [payRegs, setPayRegs] = React.useState<z.infer<typeof ARSportingEventRegistrationFlatSchema>[] | null>(null);
  const [registerUsers, setRegisterUsers] = React.useState<z.infer<typeof ARSportingEventRegistrationFlatSchema>[] | null>(null);
  const [deleteRegs, setDeleteRegs] = React.useState<z.infer<typeof ARSportingEventRegistrationFlatSchema>[] | null>(null);
  const [seeDetailReg, setSeeDetailReg] = React.useState<z.infer<typeof ARSportingEventRegistrationFlatSchema> | null>(null);

  const statusBadges: Record<string, { text: string, color: string }> = {
    'not_registered': { text: 'No registrado', color: 'border border-blue-400 text-blue-500' },
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
        const order = [
          'not_registered',
          'pending',
          'paid',
          'expired',
          'cancelled'
        ];
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
              <p><b>Edad a la fecha del evento</b> {info.row.original.age_at_event_date}</p>
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
              {(props.row.original.pending_to_pay > 0 && eventData.mercadopago_enabled) && (
                <DropdownMenuItem className="cursor-pointer group" onClick={async () => {
                  setPayRegs([props.row.original]);
                }}>
                  <MercadoPagoLogo className='size-6' />
                  Pagar
                </DropdownMenuItem>
              )}
              {props.row.original.status !== 'not_registered' && (
                <DropdownMenuItem className="cursor-pointer group" onClick={async () => {
                  setSeeDetailReg(props.row.original);
                }}>
                  <InfoIcon className='w-4 h-4' />
                  Ver Detalle
                </DropdownMenuItem>
              )}
              {props.row.original.status === 'not_registered' && (
                <DropdownMenuItem className="cursor-pointer group" onClick={async () => {
                  setRegisterUsers([props.row.original]);
                }}>
                  <CircleArrowUpIcon className='w-4 h-4 text-blue-500' />
                  Inscribir
                </DropdownMenuItem>
              )}
              {(props.row.original.status === 'pending'
                && props.row.original.paid_amount === 0) && (
                <DropdownMenuItem className="cursor-pointer group" onClick={async () => {
                  setDeleteRegs([props.row.original]);
                }}>
                  <Trash2Icon className='w-4 h-4 text-red-500' />
                  Borrar
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    })
  ]

  const table = useReactTable({
    columns: defaultColumns,
    data: finalData,
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
        { id: "status", desc: false },
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
    },
    onPaginationChange: setPagination,
    getRowId: row => row.user_id,
  });


  React.useEffect(() => {
    if (Object.keys(rowSelection).length === 0) {
      setGeneralActionBtnsEnabled({
        canPay: false,
        canRegister: false,
        canDelete: false,
      });
      return;
    }
    let canPay = true;
    let canRegister = true;
    let canDelete = true;
    Object.keys(rowSelection).forEach((key) => {
      const row = table.getRow(key);
      canPay = canPay && row.original.pending_to_pay > 0;
      canRegister = canRegister && row.original.status === "not_registered";
      canDelete = canDelete && row.original.status === 'pending' && row.original.paid_amount === 0;
    });
    setGeneralActionBtnsEnabled({
      canPay,
      canRegister,
      canDelete,
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

      {loading ? (
        <div className="my-4 bg-muted text-muted-foreground p-3 rounded-md text-sm flex gap-4 items-center">
          <Spinner /><div>Cargando...</div>
        </div>) : null
      }

      <GoBackButton />

      <RegisterUsersDialog
        regs={registerUsers}
        setRegs={setRegisterUsers}
        eventId={eventId}
        eventData={eventData}
        setError={setError}
        setSuccess={setSuccess}
        setLoading={setLoading}
        />
      
      <DeleteRegistrationDialog
        regs={deleteRegs}
        setRegs={setDeleteRegs}
        eventId={eventId}
        setError={setError}
        setSuccess={setSuccess}
        setLoading={setLoading}
        />

      <PayRegsDialog
        regs={payRegs}
        setRegs={setPayRegs}
        eventId={eventId}
        setError={setError}
        setSuccess={setSuccess}
        setLoading={setLoading}
        />

      <SeeRegistrationDetailsDialog
        reg={seeDetailReg}
        setReg={setSeeDetailReg}
        statusBadges={statusBadges}
      />

      <div className='flex flex-col sm:flex-row sm:justify-between'>
        <div className='mb-4 sm:mb-0 w-full'>
          <h1 className='text-2xl font-bold mb-4'>Inscribir atletas</h1>
          {finalData.length > 0 && (
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
        {eventData.bank_alias !== null && (
          <div className='flex flex-col justify-center gap-2'>
            <div className='text-sm text-center'>Alias para transferencias</div>
            <Button
              className='cursor-pointer'
              variant={'outline'}
              onClick={() => {
                navigator.clipboard.writeText(eventData.bank_alias!);
                const copyIcon = document.getElementById('clipboard-copy');
                const copiedIcon = document.getElementById('clipboard-copied');
                if (copyIcon && copiedIcon) {
                  copyIcon.style.display = 'none';
                  copiedIcon.style.display = 'inline-block';
                  setTimeout(() => {
                    copyIcon.style.display = 'inline-block';
                    copiedIcon.style.display = 'none';
                  }, 2000);
                }
              }}
            >
              <div className='border-r-2'>
                <div id="clipboard-copy" style={{display: 'inline-block' }}>
                  <CopyIcon className="w-5 h-5 inline-block mr-2 text-gray-500" />
                </div>
                <div id="clipboard-copied" style={{display: 'none'}}>
                  <CheckIcon className="w-5 h-5 inline-block mr-2 text-gray-500" />
                </div>
              </div>
              {eventData.bank_alias}
            </Button>
          </div>
        )}
      </div>


      <div className='mb-4 flex gap-2'>
        <Button
          variant="outline"
          className='cursor-pointer'
          disabled={!generalActionBtnsEnabled.canRegister || loading}
          onClick={() => {
            setRegisterUsers(Object.keys(rowSelection).map(
                id => finalData.find(
                  r => r.user_id.toString() === id
                )!
              )
            );
          }}
        >
          <CircleArrowUpIcon className='w-4 h-4 text-blue-500' />
          Inscribir
        </Button>
        {eventData.mercadopago_enabled && (<Button
          variant="outline"
          className='cursor-pointer'
          disabled={!generalActionBtnsEnabled.canPay || loading}
          onClick={() => {
            setPayRegs(Object.keys(rowSelection).map(
                id => finalData.find(
                  r => r.user_id.toString() === id
                )!
              )
            );
          }}
        >
          <MercadoPagoLogo className='w-6 h-6' />
          Pagar
        </Button>)}
        <Button
          variant="outline"
          className='cursor-pointer'
          disabled={!generalActionBtnsEnabled.canDelete || loading}
          onClick={() => {
            setDeleteRegs(Object.keys(rowSelection).map(
                id => finalData.find(
                  r => r.user_id.toString() === id
                )!
              )
            );
          }}
        >
          <Trash2Icon className='w-4 h-4 text-red-500' />
          Borrar
        </Button>
      </div>

      {finalData.length > 0 && (table.getRowModel().rows.length > 0 ? (
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
                    {cell.getIsPlaceholder() ? null
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
            <span>{Object.keys(rowSelection).length} resultados seleccionados</span>
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
      {finalData.length === 0 && (
        <div className='text-center py-10 text-muted-foreground'>
          <ActivityIcon className='w-8 h-8 mx-auto mb-2 animate-tremor repeat-2' />
          No hay datos para mostrar.
        </div>
      )}
    </div>
  )
}


const RegisterUsersDialog = ({
  regs,
  setRegs,
  eventId,
  eventData,
  setError,
  setSuccess,
  setLoading,
}: {
  regs: z.infer<typeof ARSportingEventRegistrationFlatSchema>[] | null,
  setRegs: (regs: z.infer<typeof ARSportingEventRegistrationFlatSchema>[] | null) => void,
  eventId: string,
  eventData: z.infer<typeof ARSportingEventSchema>,
  setError: (msg: string) => void,
  setSuccess: (msg: string) => void,
  setLoading: (loading: boolean) => void,
}) => {
  const [circuitId, setCircuitId] = React.useState<number | null>(null);

  return (
    <Dialog open={regs !== null} onOpenChange={() => {
      setCircuitId(null)
      setRegs(null);
    }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Inscribir</DialogTitle>
          <DialogDescription>
            Se inscribirán las personas seleccionadas al circuito que elijas.
          </DialogDescription>

          <div className='flex gap-2 mt-4'>
            {eventData.circuits?.map(circuit => (
              <div key={circuit.id} className='flex items-center gap-2 mb-2'>
                <Button
                  type="button"
                  variant={circuitId === circuit.id ? 'default' : 'outline'}
                  className='cursor-pointer border'
                  onClick={() => setCircuitId(circuitId === circuit.id ? null : circuit.id!)}
                >
                  {circuit.name}
                </Button>
              </div>
            ))}
          </div>
          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
            <Table className='border mt-4'>
              <TableHeader>
                <TableRow>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Equipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regs?.map(reg => (
                  <TableRow key={reg.id}>
                    <TableCell>{reg.user_full_name}</TableCell>
                    <TableCell>{reg.user_training_team_name}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} className='font-bold'>{regs?.length} personas a inscribir</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

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
                disabled={circuitId === null}
                onClick={async (e) => {
                  if (circuitId === null) {
                    e.preventDefault();
                    return;
                  }
                  setLoading(true);
                  // Lógica para registrar usuarios
                  const r = await postAuthenticated<
                    {id: number, status: 'pending' | 'paid', discount: number, pending: number}[]
                    >(`/api/sportingEvents/${eventId}/register`,
                      {userIds: regs?.map(reg => reg.user_id), circuitId: circuitId}
                    );
                  setLoading(false);
                  if (r.status !== 200) {
                    console.error('Error registrando usuarios:', getMessage(r.body?.message, 'Error desconocido'));
                    setError('Hubo un error al registrar los usuarios. '
                      + getMessage(r.body?.message, 'Error desconocido')
                    );
                  } else {
                    setSuccess('Usuarios registrados exitosamente.');
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  }
                  setCircuitId(null);
                  setRegs(null);
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



const DeleteRegistrationDialog = ({
  regs,
  setRegs,
  eventId,
  setError,
  setSuccess,
  setLoading,
}: {
  regs: z.infer<typeof ARSportingEventRegistrationFlatSchema>[] | null,
  setRegs: (regs: z.infer<typeof ARSportingEventRegistrationFlatSchema>[] | null) => void,
  eventId: string,
  setError: (msg: string) => void,
  setSuccess: (msg: string) => void,
  setLoading: (loading: boolean) => void,
}) => {
  return (
    <Dialog open={regs !== null} onOpenChange={() => {
      setRegs(null);
    }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Borrar Inscripciones</DialogTitle>
          <DialogDescription>
            Se borrarán las inscripciones seleccionadas.
          </DialogDescription>

          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
            <Table className='border mt-4'>
              <TableHeader>
                <TableRow>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Circuito</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regs?.map(reg => (
                  <TableRow key={reg.id}>
                    <TableCell>{reg.user_full_name}</TableCell>
                    <TableCell>{reg.user_training_team_name}</TableCell>
                    <TableCell>{reg.circuit_name}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className='font-bold'>{regs?.length} inscripciones a borrar</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
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
                variant="destructive"
                className='max-w-20 cursor-pointer'
                onClick={async () => {
                  setLoading(true);
                  // Lógica para borrar inscripciones de usuarios
                  const r = await postAuthenticated(`/api/sportingEvents/${eventId}/unregister`,
                      {userIds: regs?.map(reg => reg.user_id)}
                    );
                  setLoading(false);
                  if (r.status !== 200) {
                    console.error('Error borrando inscripciones:', getMessage(r.body?.message, 'Error desconocido'));
                    setError('Hubo un error al borrar las inscripciones. '
                      + getMessage(r.body?.message, 'Error desconocido')
                    );
                  } else {
                    setSuccess('Inscripciones borradas exitosamente.');
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  }
                  setRegs(null);
                }}
              >
                Borrar
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}


const PayRegsDialog = ({
  regs,
  setRegs,
  eventId,
  setError,
  setSuccess,
  setLoading,
}: {
  regs: z.infer<typeof ARSportingEventRegistrationFlatSchema>[] | null,
  setRegs: (regs: z.infer<typeof ARSportingEventRegistrationFlatSchema>[] | null) => void,
  eventId: string,
  setError: (msg: string) => void,
  setSuccess: (msg: string) => void,
  setLoading: (loading: boolean) => void,
}) => {

  return (
    <Dialog open={regs !== null} onOpenChange={() => {
      setRegs(null);
    }}>
      {/* <DialogTrigger className='w-full'>
        {children}
      </DialogTrigger> */}
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Pagar montos pendientes</DialogTitle>
          <DialogDescription>
            Se le redirigirá al portal de Mercado Pago para completar el pago de los montos pendientes.
          </DialogDescription>

          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
            <Table className='border mt-4'>
              <TableHeader>
                <TableRow>
                  <TableHead>Atleta</TableHead>
                  {/* <TableHead>Equipo</TableHead> */}
                  <TableHead className='text-right'>Monto pendiente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regs?.map(reg => (
                  <TableRow key={reg.id}>
                    <TableCell>{reg.user_full_name}</TableCell>
                    {/* <TableCell>{reg.user_training_team_name}</TableCell> */}
                    <TableCell className='text-right'>
                      {reg.pending_to_pay.toLocaleString('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className='text-right font-bold'>Total a pagar:</TableCell>
                  <TableCell className='text-right font-bold'>
                    {regs?.reduce((sum, reg) => sum + reg.pending_to_pay, 0).toLocaleString('es-AR', {
                      style: 'currency',
                      currency: 'ARS',
                    })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

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
                variant="outline"
                className='cursor-pointer'
                onClick={async () => {
                  setLoading(true);
                  // Lógica para redirigir al portal de pago de MercadoPago
                  const r = await postAuthenticated(
                    `/api/sportingEvents/${eventId}/payMultipleRegs`,
                    {registrationIds: regs?.map(r => r.id) },
                  );
                  setLoading(false);
                  if (r.status !== 200) {
                    setError('Hubo un error al redirigir a Mercado Pago. '
                      + getMessage(r.body?.message, 'Error desconocido') );
                  } else {
                    setSuccess('Redirigiendo a Mercado Pago...');
                    const mpLink = r.body.data.init_point;
                    if (mpLink) {
                      // redirect to MP
                      window.location.href = mpLink;
                    } else {
                      setError('No se recibió un link de pago válido. '
                        + 'Por favor, intenta nuevamente o contacta al organizador.');
                    }
                  }
                  setRegs(null);
                }}
              >
                <MercadoPagoLogo className='w-6 h-6' />
                Pagar con Mercado Pago
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}


export const SeeRegistrationDetailsDialog = ({
  reg,
  setReg,
  statusBadges,
}: {
  reg: z.infer<typeof ARSportingEventRegistrationFlatSchema> | null,
  setReg: (reg: z.infer<typeof ARSportingEventRegistrationFlatSchema> | null) => void,
  statusBadges: Record<string, { text: string, color: string }>,
}) => {

  return (
    <Dialog open={reg !== null} onOpenChange={() => {
      setReg(null);
    }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className='flex justify-between items-center'>
            <div>{reg?.user_full_name}</div>
            <div className={statusBadges[reg?.status || '']?.color + ' px-2 py-1 rounded-md text-center border text-xs'}>
              {statusBadges[reg?.status || '']?.text}
            </div>
          </DialogTitle>
          <DialogDescription className='flex flex-col gap-2 text-foreground'>
            <div className='flex gap-2'>
              {reg?.status === 'paid' && <div className='border border-primary text-primary px-2 py-1 rounded-md text-center text-xs'>
                Categoría: {reg?.category || 'Sin categoría asignada'}
              </div>}
              {reg?.bib_number && <div className='border border-primary text-primary px-2 py-1 rounded-md text-center text-xs'>
                Dorsal: {reg?.bib_number}
              </div>}
              {reg?.chip_id && <div className='border border-primary text-primary px-2 py-1 rounded-md text-center text-xs'>
                Chip: {reg?.chip_id}
              </div>}
            </div>
            <div>
              <h3 className='font-bold'>Información general</h3>
              <div className='font-light'>
                Inscripto el {new Date(reg?.registration_date || '').toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                })}
              </div>
              <div className='font-light'>
                Edad a la fecha del evento: {reg?.age_at_event_date}
              </div>
              <div className='font-light'>
                Equipo de entrenamiento: {reg?.user_training_team_name || 'Sin equipo'}
              </div>
              <div className='font-light'>
                Talle solicitado: {reg?.demanded_clothing_size || 'No solicitado'}
              </div>
              <div className='font-light'>
                Talle reservado: {reg?.reserved_clothing_size || 'No reservado'}
              </div>
              <div className='font-light'>
                Dorsal: {reg?.bib_number || 'No reservado'}
              </div>
              <div className='font-light'>
                Chip: {reg?.chip_id || 'No reservado'}
              </div>
            </div>
            <div>
              <h3 className='font-bold'>Circuito</h3>
              <div className='font-light'>Nombre: {reg?.circuit_name}</div>
              <div className='font-light'>Distancia: {reg?.circuit_distance_km}km</div>
              <div className='font-light'>{reg?.circuit_competitive ? 'Competitivo' : 'No competitivo'}</div>
              <div className='font-light'>Categoría: {reg?.category || 'Sin categoría asignada'}</div>
            </div>
            <div>
              <h3 className='font-bold'>Detalles de pago</h3>
              {reg?.full_payment_date && (
                <div className='font-light'>
                  Pago completo el {new Date(reg.full_payment_date).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })}
                </div>
              )}
              <div className='font-light'>
                Pagado: ${reg?.paid_amount.toLocaleString()}
              </div>
              <div className='font-light'>
                Pendiente por pagar: ${reg?.pending_to_pay.toLocaleString()}
              </div>
              {(reg?.discount_percentage !== undefined && reg?.discount_percentage > 0) && <div className='font-light'>
                Descuento aplicado: {reg?.discount_percentage ? `${reg.discount_percentage.toFixed(0)}%` : 'No tiene descuento'}
              </div>}
              {reg?.discount_reason && <div className='font-light'>
                Razón del descuento: {reg?.discount_reason || 'No tiene descuento'}
              </div>}
            </div>
          </DialogDescription>

          <div className='flex gap-2 justify-end mt-2'>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className='max-w-20 cursor-pointer'
              >
                Cerrar
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
