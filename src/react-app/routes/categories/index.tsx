import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { FeeCategory, AthleteCategory } from '@/lib/types';
import React from 'react';
import { ArrowUp, ArrowDown, Plus, Eye, EyeOff, Edit2 } from "lucide-react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


export const Route = createFileRoute('/categories/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const resCategories = await getAuthenticatedThrow(`/api/categories`);
    const categoriesData: {
      athleteCategories: AthleteCategory[];
      feeCategories: FeeCategory[];
    } = resCategories.data;
    return {
      ...categoriesData,
      status: resCategories.status
    };
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
})


function RouteComponent() {
  const {
    athleteCategories,
    feeCategories,
    status
  } = Route.useLoaderData();

  if (status !== 200) {
    return (
      <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center text-sm mb-4">
        Error al cargar las categorías. Por favor, refresque la página.
      </div>
    )
  };

  const [sortingFee, setSortingFee] = React.useState<SortingState>([])
  const columnHelperFee = createColumnHelper<FeeCategory>();
  const columnsFee = React.useMemo(() => [
    columnHelperFee.accessor('id', {
      header: 'ID',
      cell: info => info.getValue(),
      enableSorting: true,
    }),
    columnHelperFee.accessor('name', {
      header: 'Nombre',
      cell: info => info.getValue(),
      enableSorting: true,
    }),
    columnHelperFee.accessor('description', {
      header: 'Descripción',
      cell: info => info.getValue() || 'Sin descripción',
    }),
    columnHelperFee.display({
      id: 'actions',
      header: '',
      cell: (info) => {
        return (
          <Link
            to='/categories/fee/$feeId'
            params={{ feeId: info.row.original.id.toString() }}
          >
            <Button size="sm" className='cursor-pointer'><Edit2 className="h-4 w-4" /></Button>
          </Link>
        );
      },
      enableSorting: false,
    }),
  ], []);
  const tableFee = useReactTable({
    data: feeCategories,
    columns: columnsFee,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: sortingFee,
    },
    onSortingChange: setSortingFee,
  });

  const [sortingAthlete, setSortingAthlete] = React.useState<SortingState>([])
  const [visibleColAth, setVisibleColAth] = React.useState<boolean>(false);
  const [visibilityAthlete, setVisibilityAthlete] = React.useState<{ [key: string]: boolean }>({
    description: visibleColAth,
    condition: visibleColAth,
    sex: visibleColAth,
  });
  const columnHelperAthlete = createColumnHelper<AthleteCategory>();
  const columnsAthlete = React.useMemo(() => [
    columnHelperAthlete.accessor('name', {
      header: 'Nombre',
      cell: info => info.getValue(),
      enableSorting: true,
    }),
    columnHelperAthlete.accessor('description', {
      header: 'Descripción',
      cell: info => info.getValue() || '-',
      enableSorting: false,
      enableHiding: true,
    }),
    columnHelperAthlete.accessor('fee_category_name', {
      header: 'Tarifa',
      cell: (info) => {
        return (
          <div onClick={() => {
            const element = document.getElementById(`fee-${info.row.original.fee_category_id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.focus();
            }
          }} className="hover:underline cursor-pointer">
            {info.getValue()}
          </div>
        );
      },
      enableSorting: true,
    }),
    columnHelperAthlete.accessor('min_age', {
      header: 'Edad Mín.',
      cell: info => info.getValue() !== null ? info.getValue() : 'N/A',
      enableSorting: true,
    }),
    columnHelperAthlete.accessor('max_age', {
      header: 'Edad Máx.',
      cell: info => info.getValue() !== null ? info.getValue() : 'N/A',
      enableSorting: true,
    }),
    columnHelperAthlete.accessor('sex', {
      header: 'Sexo',
      cell: info => info.getValue() !== null ? info.getValue() === 'M' ? 'Masculino' : 'Femenino' : 'Unisex',
      enableSorting: true,
      enableHiding: true,
    }),
    columnHelperAthlete.accessor('condition', {
      header: 'Condición',
      cell: info => info.getValue() || '-',
      enableSorting: false,
      enableHiding: true,
    }),
    columnHelperAthlete.display({
      id: 'actions',
      header: '',
      cell: (info) => {
        return (
          <Link
            to='/categories/athlete/$athleteId'
            params={{ athleteId: info.row.original.id.toString() }}
            >
            <Button size="sm" className='cursor-pointer'><Edit2 className="h-4 w-4" /></Button>
          </Link>
        );
      },
      enableSorting: false,
    }),
  ], []);
  const tableAthlete = useReactTable({
    data: athleteCategories,
    columns: columnsAthlete,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: sortingAthlete,
      columnVisibility: visibilityAthlete,
    },
    onSortingChange: setSortingAthlete,
    onColumnVisibilityChange: setVisibilityAthlete,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">

        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Categorías</h2>
          <p className="text-gray-500 text-sm mt-1">
            {'Gestione las categorías de atletas y tarifas asociadas para los eventos deportivos.'}
          </p>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between">
            <h2 className='text-gray-700 text-2xl mb-5'>Tarifas</h2>
            <Link to='/categories/fee' title='Agregar nueva categoría' className=''>
              <Button className='cursor-pointer'><Plus className="h-6 w-6" /></Button>
            </Link>
          </div>
          <Table>
            <TableHeader>
              {tableFee.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none flex gap-2 items-center'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                          title={
                            header.column.getCanSort()
                              ? header.column.getNextSortingOrder() === 'asc'
                                ? 'Ordenar ascendentemente'
                                : header.column.getNextSortingOrder() === 'desc'
                                  ? 'Ordenar descendentemente'
                                  : 'Sacar orden'
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
              ))}
            </TableHeader>
            <TableBody>
              {tableFee.getRowModel().rows.length > 0
                ? tableFee.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    id={'fee-' + row.original.id}
                    className='focus:bg-primary/5 transition-colors duration-500'
                    tabIndex={-1}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={columnsFee.length} className="h-20 text-center">
                      No se encontraron categorías de tarifas.
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
        </div>

        <div className='p-6'>
          <div className="flex justify-between">
            <h2 className='text-gray-700 text-2xl mb-5'>Atletas</h2>
            <div className='flex gap-2'>
              <Button
                className='cursor-pointer'
                title={visibleColAth ? 'Mostrar menos columnas' : 'Mostrar más columnas'}
                onClick={() => {
                setVisibleColAth(!visibleColAth);
                setVisibilityAthlete({
                  description: !visibleColAth,
                  condition: !visibleColAth,
                  sex: !visibleColAth,
                });
              }}>{visibleColAth ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}</Button>
              <Link to='/categories/athlete' title='Agregar nueva categoría'>
                <Button className='cursor-pointer'><Plus className="h-6 w-6" /></Button>
              </Link>
            </div>
          </div>
          <Table>
            <TableHeader>
              {tableAthlete.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none flex gap-2 items-center'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                          title={
                            header.column.getCanSort()
                              ? header.column.getNextSortingOrder() === 'asc'
                                ? 'Ordenar ascendentemente'
                                : header.column.getNextSortingOrder() === 'desc'
                                  ? 'Ordenar descendentemente'
                                  : 'Sacar orden'
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
              ))}
            </TableHeader>
            <TableBody>
              {tableAthlete.getRowModel().rows.length > 0
                ? (tableAthlete.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )))
                : (
                  <TableRow>
                    <TableCell colSpan={columnsAthlete.length} className="h-20 text-center">
                      No se encontraron categorías de atletas.
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
