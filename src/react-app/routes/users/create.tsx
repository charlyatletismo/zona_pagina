import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE } from '@shared/roles';
import { ProfileForm } from '@/components/profileForm';
import z from 'zod';
import { ARTrainingTeamIndexSchema } from '@shared/apiRespTypes';
import { FormBox } from '@/components/formBox';


export const Route = createFileRoute('/users/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE ]),
  loader: async () => {
    const locationsApi = await getAuthenticatedThrow<string[]>('/api/locations');
    const tteamsApi = await getAuthenticatedThrow<
      z.infer<typeof ARTrainingTeamIndexSchema>[]
      >('/api/trainingTeams', z.array(ARTrainingTeamIndexSchema));
    return { locationsApi, tteamsApi };
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  const { locationsApi, tteamsApi } = Route.useLoaderData();

  let defaultManagerId = null;
  if (localStorage.getItem('USER_ROLE') === ATHLETES_MANAGER_ROLE) {
    defaultManagerId = localStorage.getItem('USER_ID');
  }

  return (
    <FormBox
      title="Crear Usuario"
      description="Añadir un nuevo usuario al sistema."
      returnText="Volver a usuarios"
      returnPath='..'
      error={
        locationsApi.status !== 200
          ? "Error al cargar las ubicaciones. Por favor intenta recargar la página."
          : tteamsApi.status !== 200
            ? "Error al cargar los equipos de entrenamiento. Por favor intenta recargar la página."
            : null
      }
    >
      <ProfileForm
        profile={null}
        defaultManagerId={defaultManagerId}
        locations={locationsApi.body.data}
        trainingTeams={tteamsApi.body.data}
        postUrl={`/api/users/create`}
      />
    </FormBox>
  );
}
