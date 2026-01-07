import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { SettingsSchema } from '@shared/apiRespTypes';
import { ProfileForm } from '@/components/profileForm';
import z from 'zod';
import { FormBox } from '@/components/formBox';


export const Route = createFileRoute('/settings/profile')({
  component: RouteComponent,
  beforeLoad: authCheck(),
  loader: async () => {
    const profileApi = await getAuthenticatedThrow<
      z.infer<typeof SettingsSchema>>('/api/settings');
    const locationsApi = await getAuthenticatedThrow<string[]>('/api/locations');
    return { profileApi, locationsApi };
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  const { profileApi, locationsApi } = Route.useLoaderData();
  return (
    <FormBox
      title="Editar Perfil"
      description="Completa tu información para mejorar tu experiencia."
      returnText="Volver a Configuración"
      returnPath="/settings"
      error={
        profileApi.status !== 200
        ? "Error al cargar la información del perfil. Por favor intenta recargar la página."
        : locationsApi.status !== 200
          ? "Error al cargar las ubicaciones. Por favor intenta recargar la página."
          : null
      }
    >
      <ProfileForm
        profile={profileApi.body.data}
        locations={locationsApi.body.data}
        postUrl='/api/settings'
      />
    </FormBox>
  )
}
