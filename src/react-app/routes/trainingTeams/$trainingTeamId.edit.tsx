import { createFileRoute } from '@tanstack/react-router';
import { ORGANIZER_ROLE } from '@shared/roles';
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { FormBox } from '@/components/formBox';
import { TrainingTeamForm } from '@/components/trainingTeamForm';
import { getMessage } from '@/lib/utils';
import {
  ARTrainingTeamAllSchema
} from '@shared/apiRespTypes';
import z from 'zod';


export const Route = createFileRoute('/trainingTeams/$trainingTeamId/edit')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const { trainingTeamId } = params;
    const res = await getAuthenticatedThrow<
      z.infer<typeof ARTrainingTeamAllSchema>
      >(`/api/trainingTeams/${trainingTeamId}`,
        ARTrainingTeamAllSchema);
    const resLocations = await getAuthenticatedThrow<string[]>('/api/locations');
    return { res, resLocations };
  },
})


function RouteComponent() {
  const { res, resLocations } = Route.useLoaderData();
  return (
    <FormBox
      title="Editar Equipo de Entrenamiento"
      description="Edite un equipo de entrenamiento existente para organizar a los atletas."
      error={
        resLocations.status !== 200
        ? "Error al cargar los datos de las localidades. "
          + getMessage(resLocations.body.message, "", " ")
        : null}
    >
      {/* Training Team Form Component Goes Here */}
        <TrainingTeamForm
          trainingTeam={res.body?.data || null}
          dbTrainingTeams={[]}
          dbLocations={resLocations.body?.data || []}
          // onSuccess={() => {
          //   // Optional success handler
          // }}
        />
    </FormBox>
  );
}
