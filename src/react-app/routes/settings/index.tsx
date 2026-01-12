import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Edit, ArrowLeft } from 'lucide-react'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { Profile } from '@/components/profileCard'
import z from 'zod';
import { SettingsSchema } from '@shared/apiRespTypes';


export const Route = createFileRoute('/settings/')({
  component: RouteComponent,
  beforeLoad: authCheck(),
  loader: async () => {
    const res = await getAuthenticatedThrow<
      z.infer<typeof SettingsSchema>
      >('/api/settings', SettingsSchema);
    return { res };
  },
  staleTime: 1000 * 60 * 5,
})


function RouteComponent() {
  const { res } = Route.useLoaderData();
  const navigate = useNavigate();

  if (!res.body?.data) {
    return <div className="p-8 text-center">No se encontró información del perfil</div>;
  }

  if (res.status === 404 || !res.body?.data) {
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

  if (res.status !== 200) {
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

        <Profile profile={res.body?.data} />
      </div>
    </div>
  )
}
