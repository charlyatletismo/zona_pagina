import { createFileRoute, useNavigate } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import {
  ADMIN_ROLE,
  ORGANIZER_ROLE,
  ATHLETES_MANAGER_ROLE,
} from '@shared/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { ARUserSchema } from '@shared/apiRespTypes'
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronRight } from 'lucide-react';
import z from 'zod';
import { getMessage } from '@/lib/utils';
import { RolDescriptions } from '@shared/lang';


const ARUserSchemaPartial = ARUserSchema.partial().required({
  id: true,
});
const ARUserSchemaPartialArray = ARUserSchemaPartial.array();


export const Route = createFileRoute('/users/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
  loader: async () => {
    const usersApi = await getAuthenticatedThrow<
      z.infer<typeof ARUserSchemaPartialArray>
      >('/api/users', ARUserSchemaPartialArray);
    return { usersApi };
  },
  staleTime: 1000 * 60 * 5,
})

const getRoleWeight = (role: string | undefined) => {
  if (!role) return 5;
  if (role === ADMIN_ROLE) return 4;
  if (role === ORGANIZER_ROLE) return 1;
  if (role === ATHLETES_MANAGER_ROLE) return 2;
  return 3;
}

function RouteComponent() {
  const { usersApi } = Route.useLoaderData();
  if (usersApi.status !== 200) {
    return (
      <div className="text-red-600 p-3 rounded-md flex items-center text-sm my-4 mx-auto">
        Error al cargar los usuarios. Por favor, refresque la página.
      </div>
    );
  }
  const [data, _] = React.useState<z.infer<typeof ARUserSchemaPartialArray>>(() => {
    return [...(usersApi.body.data || [])].sort((a, b) => getRoleWeight(a.role) - getRoleWeight(b.role));
  });
  const navigate = useNavigate();

  const columnHelper = createColumnHelper<z.infer<typeof ARUserSchemaPartial>>()

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: info => <span className="font-medium">{info.getValue() || "N/A"}</span>,
      }),
      columnHelper.accessor('surname', {
        header: 'Apellido',
        cell: info => info.getValue() || "N/A",
      }),
      columnHelper.accessor('phone', {
        header: 'Teléfono',
        cell: info => <span className="text-gray-500">{info.getValue() || "N/A"}</span>,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: info => <span className="text-gray-500">{info.getValue() || "N/A"}</span>,
      }),
      columnHelper.accessor('role', {
        // TODO: Hide role when is not admin or organizer
        header: 'Rol',
        cell: info => {
          const role = info.getValue();
          if (!role) return null;
          let className = role !== ATHLETES_MANAGER_ROLE ? "" : "bg-blue-500 text-white dark:bg-blue-600"

          return (
            <div>
              <Badge variant={
                role === ADMIN_ROLE ? "destructive" :
                role === ORGANIZER_ROLE ? "default" :
                role === ATHLETES_MANAGER_ROLE ? "secondary" : "outline"
              } className={className}>
                {getMessage(RolDescriptions[role], role)}
              </Badge>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: props => {
          const user = props.row.original;

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => navigate({ to: `/users/$userId`, params: { userId: user.id } })}
                title="Ver detalles"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [navigate]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <div className="text-sm text-gray-500">
          Total: {data.length} usuarios
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No se encontraron usuarios.
          </div>
        )}
      </div>
    </div>
  )
}
