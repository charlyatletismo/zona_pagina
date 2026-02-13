import { createFileRoute } from '@tanstack/react-router';
import { ORGANIZER_ROLE } from '@shared/roles';
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { FormBox } from '@/components/formBox';
import { TrainingTeamForm } from '@/components/trainingTeamForm';
import { getMessage } from '@/lib/utils';
import { ARTrainingTeamIndexSchema } from '@shared/apiRespTypes';
import z from 'zod';


export const Route = createFileRoute('/trainingTeams/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const resLocations = await getAuthenticatedThrow<string[]>('/api/locations');
    const resTTeams = await getAuthenticatedThrow<
      z.infer<typeof ARTrainingTeamIndexSchema>[]
      >('/api/trainingTeams', z.array(ARTrainingTeamIndexSchema));
    return { resLocations, resTTeams };
  },
})


function RouteComponent() {
  const { resLocations, resTTeams } = Route.useLoaderData();
  return (
    <FormBox
      title="Crear Equipo de Entrenamiento"
      description="Cree un nuevo equipo de entrenamiento para organizar a los atletas."
      returnText="Volver a Equipos de Entrenamiento"
      returnPath=".."
      error={
        resTTeams.status !== 200
        ? "Error al cargar los datos de los equipos de entrenamiento. "
          + getMessage(resTTeams.body.message, "", " ")
        : resLocations.status !== 200
          ? "Error al cargar los datos de las localidades. "
            + getMessage(resLocations.body.message, "", " ")
          : null}
    >
      {/* Training Team Form Component Goes Here */}
        <TrainingTeamForm
          trainingTeam={null}
          dbTrainingTeams={resTTeams.body?.data || []}
          dbLocations={resLocations.body?.data || []}
          // onSuccess={() => {
          //   // Optional success handler
          // }}
        />
    </FormBox>
  );
}
