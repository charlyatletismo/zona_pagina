import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { UserProfile } from '@/lib/types'
import { Profile } from '@/components/profileCard'


export const Route = createFileRoute('/settings/')({
  component: RouteComponent,
  beforeLoad: authCheck(),
  loader: async () => {
    const profileApi = await getAuthenticatedThrow('/api/settings');
    const profile: UserProfile = profileApi.data;
    return { profile, status: profileApi.status};
  },
  staleTime: 1000 * 60 * 5,
})


function RouteComponent() {
  const res = Route.useLoaderData();

  if (res.status !== 200) {
    return <div className="text-red-500 p-8 text-center">Error al cargar la información del perfil</div>;
  }

  if (!res.profile) {
    return <div className="p-8 text-center">No se encontró información del perfil</div>;
  }

  return (
    <div className="p-4 w-full md:max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
          <Link to="/settings/profile">
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </Link>
        </div>

        <Profile profile={res.profile} />
      </div>
    </div>
  )
}
