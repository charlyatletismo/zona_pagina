import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { FormBox } from '@/components/formBox';
import { getMessage } from '@/lib/utils';
import SportingEventForm from '@/components/sportingEventForm';
import { ARSportingEventSchema } from '@shared/apiRespTypes';
import z from 'zod';
import { AthCatApiResponse } from '@shared/apiRespTypes';



export const Route = createFileRoute('/sportingEvents/$eventId/edit')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const resSpEvent = await getAuthenticatedThrow<
      z.infer<typeof ARSportingEventSchema>
      >(`/api/sportingEvents/${params.eventId}`, ARSportingEventSchema);
    const resCatTemplates = await getAuthenticatedThrow<
      z.infer<typeof AthCatApiResponse>
      >('/api/athleteCategoryTemplates');
    const resLocations = await getAuthenticatedThrow<
      string[]
      >('/api/locations', z.array(z.string()));
    return { resSpEvent, resCatTemplates, resLocations };
  },
  staleTime: 1000 * 60 * 5,
  gcTime: 0 // force reload every time
})


function RouteComponent() {
  const { resSpEvent, resCatTemplates, resLocations } = Route.useLoaderData();
  return (
    <FormBox
      error={
        (resSpEvent.status !== 200
          || resCatTemplates.status !== 200
          || resLocations.status !== 200
        )
        ? "Error al cargar los datos del evento. "
          + getMessage(resSpEvent.body.message, "", " ")
          + getMessage(resCatTemplates.body.message, "", " ")
          + getMessage(resLocations.body.message, "", " ")
        : null}
      title="Editar Evento Deportivo"
      description="Actualiza la información del evento deportivo."
      returnText="Volver al Evento"
      returnPath="/sportingEvents/$eventId"
      returnParams={{ eventId: resSpEvent.body?.data?.id?.toString() }}
    >
      <SportingEventForm
        data={resSpEvent.body?.data}
        catTemplates={resCatTemplates.body?.data || []}
        locations={resLocations.body?.data || []}
        />
    </FormBox>
  );
}
