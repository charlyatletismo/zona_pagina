import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import z from 'zod';
import { Button } from '@/components/ui/button'
import { Edit, ArrowLeft, CogIcon } from 'lucide-react'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls'
import { ARUserSchema } from '@shared/apiRespTypes';
import { ProfileCard } from '@/components/profileCard';
import { ADMIN_ROLE, ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE, ATHLETE_ROLE } from '@shared/roles';
import { getMessage } from '@/lib/utils';
import { RolDescriptions } from '@shared/lang';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export const Route = createFileRoute('/users/$userId/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
  loader: async ({ params }) => {
    const userApiRes = await getAuthenticatedThrow<
      z.infer<typeof ARUserSchema>
      >(`/api/users/${params.userId}`, ARUserSchema);
    return { userApiRes };
  },
  staleTime: 1000 * 60 * 5,
})


function RouteComponent() {
  const { userId } = Route.useParams();
  const { userApiRes } = Route.useLoaderData();
  const navigate = useNavigate();

  if (userApiRes.status === 404 || !userApiRes.body.data) {
    return (
      <div className="p-4 w-full md:max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate({ to: '..' })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver atrás
        </Button>
        
        <div className="p-8 text-center">No se encontró información del perfil</div>
      </div>
    );
  }

  if (userApiRes.status !== 200) {
    return (
      <div className="p-4 w-full md:max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
          onClick={() => navigate({ to: '..' })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver atrás
        </Button>
        <div className="text-red-500 p-8 text-center">Error al cargar la información del perfil</div>
      </div>
    );
  }

  const currentRole = userApiRes.body.data.role;

  // Don't allow changing roles when not admin or organizer,
  // Don't allow changing admin roles or self (simplified)
  const canEdit = (
    localStorage.getItem("USER_ROLE") === ORGANIZER_ROLE
    || localStorage.getItem("USER_ROLE") === ADMIN_ROLE)
    && currentRole && currentRole !== ADMIN_ROLE
    && localStorage.getItem('USER_ID') !== userApiRes.body.data.id;


  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) return;

    const res = await postAuthenticated(
      `/api/users/${userId}/setRole`,
      { role: newRole },
      navigate);
    
    if (res.status === 200) {
      navigate({ to: '.', reloadDocument: true }); // Reload route
    } else {
      alert(`Error al cambiar el rol: ${getMessage(res.body?.message, 'Error desconocido')}`);
    }

  };



  return (
    <div className="p-4 w-full md:max-w-4xl mx-auto">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate({ to: '..' })}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver atrás
      </Button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{userApiRes.body.data.name} {userApiRes.body.data.surname}</h2>

          <div className='flex gap-2'>
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={
                      userApiRes.body.data.role === ADMIN_ROLE ? "destructive" :
                        userApiRes.body.data.role === ORGANIZER_ROLE ? "default" :
                          "outline"
                    }
                  >
                    <CogIcon className="h-4 w-4" />
                    {getMessage(RolDescriptions[userApiRes.body.data.role || ''], userApiRes.body.data.role)}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                  <DropdownMenuItem onClick={() => handleRoleChange(userApiRes.body.data.id, ATHLETE_ROLE)}>Atleta</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleChange(userApiRes.body.data.id, ORGANIZER_ROLE)}>Organizador</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleChange(userApiRes.body.data.id, ATHLETES_MANAGER_ROLE)}>Manager</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Link to="/users/$userId/edit" params={{ userId }}>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            </Link>
          </div>
        </div>

        <ProfileCard profile={userApiRes.body.data} />
      </div>
    </div>
  )
}
