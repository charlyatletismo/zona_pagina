import { Link, useNavigate } from '@tanstack/react-router';
import { TrainingTeamSchema } from '@shared/types';
import { ARTrainingTeamAllSchema } from '@shared/apiRespTypes';
import z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteButton } from '@/components/deleteButton';
import {
  // FileArchiveIcon,
  EditIcon,
  // Info,
  ActivityIcon,
  ArrowUp,
  ArrowDown,
  SearchIcon,
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
  createColumnHelper,
  useReactTable,
  flexRender
} from '@tanstack/react-table';
import { customFilterFn, getMessage } from '@/lib/utils';
import { postAuthenticated } from '@/lib/apiCalls';


export const TrainingTeamsTable = ({data}: {data: z.infer<typeof ARTrainingTeamAllSchema>[]}) => {
  const navigate = useNavigate();
  const columnHelper = createColumnHelper<z.infer<typeof TrainingTeamSchema>>();
  
  const defaultColumns = [
    columnHelper.accessor('name', {
      header: 'Nombre',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
    }),
    columnHelper.accessor('coach_name', {
      header: 'Entrenador',
      cell: info => <div>
        {info.row.original.coach_user_id
        ? <Link to={`/users/$userId`}
            params={{ userId: info.row.original.coach_user_id }}>
              {info.getValue() || info.row.original.coach_user_id}
          </Link>
        : info.getValue()}
      </div>,
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
    }),
    columnHelper.accessor('location', {
      header: 'Ubicación',
      cell: info => info.getValue(),
      footer: props => props.column.id,
      enableSorting: true,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('updated_at', {
      header: 'Última Actualización',
      cell: info => info.getValue()?.toLocaleString(),
      footer: props => props.column.id,
      enableSorting: true,
      sortUndefined: 'last',
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
          <Link
            to={`/trainingTeams/$trainingTeamId`}
            params={{ trainingTeamId: props.row.original.id!.toString() }}
            className='w-full h-full flex items-center justify-center'
          >
            <InfoIcon className='w-4 h-4' />
          </Link>
        </Button>
        <Button
          variant='outline'
          size="icon-sm"
          className='cursor-pointer'
          title="Ver detalles"
        >
          <Link
            to={`/trainingTeams/$trainingTeamId/edit`}
            params={{ trainingTeamId: props.row.original.id!.toString() }}
            className='w-full h-full flex items-center justify-center'
          >
            <EditIcon className='w-4 h-4' />
          </Link>
        </Button>
        <DeleteButton
          dgDescription="Esta acción no se puede deshacer. Esto eliminará permanentemente el equipo de entrenamiento."
          onConfirm={async () => {
            // Lógica para eliminar el equipo de entrenamiento
            const res = await postAuthenticated(`/api/trainingTeams/delete/${props.row.original.id}`);
            if (res.status !== 200) {
              console.error(
                'Error al eliminar el equipo de entrenamiento:',
                getMessage(res.body?.message, 'Error desconocido')
              );
              alert('Hubo un error al eliminar el equipo '
                + 'de entrenamiento. Por favor, intenta '
                + 'nuevamente más tarde.');
            }
            navigate({to: '.', reloadDocument: true});
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
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      globalFilter: '',
      columnVisibility: {
        id: false,
      },
      sorting: [
        { id: "name", desc: false },
      ]
    },
    globalFilterFn: customFilterFn,
  })


  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-2 items-center mb-4 max-w-sm relative'>
        <SearchIcon className='w-4 h-4 text-gray-400 absolute right-2' />
        <Input
          value={table.getState().globalFilter ?? ''}
          onChange={e => table.setGlobalFilter(String(e.target.value))}
          placeholder="Buscar..."
        />
      </div>
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
          No hay equipos registrados. Crea el primero en el botón de arriba.
        </div>
      )}

    </div>
  )
}