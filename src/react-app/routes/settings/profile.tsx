import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { UserProfile } from '@/lib/types'
import { ProfileForm } from '@/components/profileForm';


export const Route = createFileRoute('/settings/profile')({
  component: RouteComponent,
  beforeLoad: authCheck(),
  loader: async () => {
    const profileApi = await getAuthenticatedThrow('/api/settings');
    const profile: UserProfile = profileApi.data;
    return { profile, status: profileApi.status};
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  const res = Route.useLoaderData();
  if (res.status !== 200) {
    return <div className="text-red-500 p-8 text-center">Error al cargar la información del perfil. Por favor intenta recargar la página.</div>;
  }

  return (
    <div className="p-4 w-full md:max-w-4xl mx-auto">
      <ProfileForm profile={res.profile} />
    </div>
  );
}
