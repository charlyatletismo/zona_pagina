import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { SettingsSchema, TrainingTeamsApiResponseSchema } from '@shared/apiRespTypes';
import { ProfileForm } from '@/components/profileForm';
import z from 'zod';
import { FormBox } from '@/components/formBox';


export const Route = createFileRoute('/settings/profile')({
  component: RouteComponent,
  beforeLoad: authCheck(),
  loader: async () => {
    const profileApi = await getAuthenticatedThrow<
      z.infer<typeof SettingsSchema>
      >('/api/settings', SettingsSchema);
    const locationsApi = await getAuthenticatedThrow<
      string[]
      >('/api/locations', z.array(z.string()));
    const tteamsApi = await getAuthenticatedThrow<
      z.infer<typeof TrainingTeamsApiResponseSchema>
      >('/api/trainingTeams', TrainingTeamsApiResponseSchema);
    return { profileApi, locationsApi, tteamsApi };
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  const { profileApi, locationsApi, tteamsApi } = Route.useLoaderData();
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
            : tteamsApi.status !== 200
              ? "Error al cargar los equipos de entrenamiento. Por favor intenta recargar la página."
              : null
      }
    >
      <ProfileForm
        profile={profileApi.body.data}
        locations={locationsApi.body.data}
        trainingTeams={tteamsApi.body.data}
        postUrl='/api/settings'
      />
    </FormBox>
  )
}
