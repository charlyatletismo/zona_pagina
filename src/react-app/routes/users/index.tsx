import { createFileRoute, useNavigate } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ADMIN_ROLE, ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE, ATHLETE_ROLE } from '@/lib/roles';
import { getAuthenticated, postAuthenticated } from '@/lib/apiCalls';
import { User } from '@/lib/types';
import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

export const Route = createFileRoute('/users/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
  loader: async () => {
    const users: User[] = await getAuthenticated(`/api/users`);
    return { users };
  },
  staleTime: 1000 * 60 * 5,
})

const getRoleWeight = (role: string) => {
  if (role.includes(ADMIN_ROLE)) return 1;
  if (role.includes(ORGANIZER_ROLE)) return 2;
  if (role.includes(ATHLETES_MANAGER_ROLE)) return 3;
  return 4;
}

function RouteComponent() {
  const { users } = Route.useLoaderData();
  const [data, setData] = React.useState<User[]>(() => {
    return [...(users || [])].sort((a, b) => getRoleWeight(a.roles) - getRoleWeight(b.roles));
  });
  const navigate = useNavigate();

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) return;

    const res = await postAuthenticated(`/api/users/${userId}/setRole`, { role: newRole });
    if (res.status === 200) {
      setData(prev => {
        const newData = prev.map(u => u.id === userId ? { ...u, roles: newRole } : u);
        return newData.sort((a, b) => getRoleWeight(a.roles) - getRoleWeight(b.roles));
      });
    } else {
      alert('Error al actualizar el rol');
    }
  };

  const columnHelper = createColumnHelper<User>()

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: info => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('surname', {
        header: 'Apellido',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: info => <span className="text-gray-500">{info.getValue()}</span>,
      }),
      columnHelper.accessor('roles', {
        header: 'Rol',
        cell: info => {
          const role = info.getValue();
          let className = ""
          let label = "Atleta";

          if (role.includes(ADMIN_ROLE)) {
            label = "Admin";
          } else if (role === ORGANIZER_ROLE) {
            label = "Organizador";
          } else if (role.includes(ATHLETES_MANAGER_ROLE)) {
            className = "bg-blue-500 text-white dark:bg-blue-600";
            label = "Manager";
          }

          return (
            <div>
              
              <Badge variant={
                role.includes(ADMIN_ROLE) ? "destructive" :
                role === ORGANIZER_ROLE ? "default" :
                role.includes(ATHLETES_MANAGER_ROLE) ? "secondary" : "outline"
              } className={className}>
                {label}
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
          const currentRole = user.roles;
          
          // Don't allow changing admin roles or self (simplified)
          const canEdit = !currentRole.includes(ADMIN_ROLE); 

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => navigate({ to: `/users/${user.id}` })}
                title="Ver detalles"
              >
                <Info className="h-4 w-4" />
              </Button>

              {canEdit && (
                <div className="relative group">
                  <select
                    className="h-8 w-32 text-sm border rounded px-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                    value={currentRole.split(',')[0]} // Simple assumption for single role
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value={ATHLETE_ROLE}>Atleta</option>
                    <option value={ORGANIZER_ROLE}>Organizador</option>
                    <option value={ATHLETES_MANAGER_ROLE}>Manager</option>
                  </select>
                </div>
              )}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-gray-200">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No se encontraron usuarios.
          </div>
        )}
      </div>
    </div>
  )
}
