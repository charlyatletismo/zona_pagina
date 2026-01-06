import { createFileRoute, useNavigate } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { UserProfile } from '@/lib/types';
import { ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE } from '@shared/roles';
import { ProfileForm } from '@/components/profileForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';


export const Route = createFileRoute('/users/$userId/edit')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
  loader: async ({ params }) => {
    console.log('Loading edit route for userId:', params.userId);
    const profileApi = await getAuthenticatedThrow(`/api/users/${params.userId}`);
    const profile: UserProfile = profileApi.body.data;
    return { profile, status: profileApi.status};
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  const { userId } = Route.useParams();
  const res = Route.useLoaderData();
  const navigate = useNavigate();

  if (res.status !== 200) {
    return <div className="text-red-500 p-8 text-center">Error al cargar la información del perfil. Por favor intenta recargar la página.</div>;
  }
  return (
    <div className="p-4 w-full md:max-w-2xl mx-auto">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => navigate({ to: '..' })}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver atrás
      </Button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Editar Perfil</h2>
          <p className="text-gray-500 text-sm mt-1">
            Ajustar perfil de usuario.
          </p>
        </div>

        <ProfileForm profile={res.profile} postUrl={`/api/users/${userId}/update`} />
      </div>
    </div>
  );
}
