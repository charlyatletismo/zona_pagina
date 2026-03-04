import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Edit } from 'lucide-react'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { ProfileCard } from '@/components/profileCard'
import z from 'zod';
import { ARSettingsSchema } from '@shared/apiRespTypes';
import { GoBackButton } from '@/components/goBackButton';


export const Route = createFileRoute('/settings/')({
  component: RouteComponent,
  beforeLoad: authCheck(),
  loader: async () => {
    const res = await getAuthenticatedThrow<
      z.infer<typeof ARSettingsSchema>
      >('/api/settings', ARSettingsSchema);
    return { res };
  },
  staleTime: 1000 * 60 * 5,
})


function RouteComponent() {
  const { res } = Route.useLoaderData();

  if (!res.body?.data) {
    return <div className="p-8 text-center">No se encontró información del perfil</div>;
  }

  if (res.status === 404 || !res.body?.data) {
    return (
      <div className="p-4 w-full md:max-w-4xl mx-auto">
        <GoBackButton />
        <div className="p-8 text-center">No se encontró información del perfil</div>
      </div>
    );
  }

  if (res.status !== 200) {
    return (
      <div className="p-4 w-full md:max-w-4xl mx-auto">
        <GoBackButton />
        <div className="text-red-500 p-8 text-center">Error al cargar la información del perfil</div>
      </div>
    );
  }


  return (
    <div className="p-4 w-full md:max-w-4xl mx-auto">
      <GoBackButton />
      <div className="rounded-lg border shadow-md overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Mi Perfil</h2>
          <Link to="/settings/profile">
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </Link>
        </div>

        <ProfileCard profile={res.body?.data} />
      </div>
    </div>
  )
}
