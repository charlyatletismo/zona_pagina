import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import z from 'zod';
import { Button } from '@/components/ui/button'
import { Edit, ArrowLeft } from 'lucide-react'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { ARUserSchema } from '@shared/apiRespTypes';
import { ProfileCard } from '@/components/profileCard';
import { ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE } from '@shared/roles';


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
          <Link to="/users/$userId/edit" params={{ userId }}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </Link>
        </div>

        <ProfileCard profile={userApiRes.body.data} />
      </div>
    </div>
  )
}
