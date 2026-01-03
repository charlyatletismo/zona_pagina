import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { SportingEventSchema, SportingEventType, AthleteCategoryTemplateSchema, AthleteCategoryTemplateType } from '@/lib/types';
import SportingEventForm from '@/components/sportingEventForm';
import { FormBox } from '@/components/formBox';
import z from 'zod';


export const Route = createFileRoute('/sportingEvents/$eventId/edit')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const resSpEvent: {
      status: number;
      data: SportingEventType;
      message?: string;
    } = await getAuthenticatedThrow(`/api/sportingEvents/${params.eventId}`);
    const resCatTemplates: {
      status: number;
      data: AthleteCategoryTemplateType[];
      message?: string;
    } = await getAuthenticatedThrow('/api/sportingEventTypes');
    if (resSpEvent.data) {
      console.log(resSpEvent.data);
      resSpEvent.data = SportingEventSchema.parse(resSpEvent.data);
    }
    console.log(resCatTemplates);
    if (resCatTemplates.data) {
      console.log(resCatTemplates.data);
      resCatTemplates.data = z.array(AthleteCategoryTemplateSchema).parse(resCatTemplates.data);
    }
    return {
      resSpEvent,
      resCatTemplates,
    };
  },
  staleTime: 1000 * 60 * 5,
  gcTime: 0 // force reload every time
})


function RouteComponent() {
  const { resSpEvent, resCatTemplates } = Route.useLoaderData();
  return (
    <FormBox
      error={
        (resSpEvent.status !== 200 || resCatTemplates.status !== 200)
        ? "Error al cargar los datos del evento."
          + (resSpEvent.message ? ` ${resSpEvent.message || ''}` : '')
          + (resCatTemplates.message ? ` ${resCatTemplates.message || ''}` : '')
        : null}
      title="Editar Evento Deportivo"
      description="Actualiza la información del evento deportivo."
      returnText="Volver al Evento"
      returnPath="/sportingEvents/$eventId"
      returnParams={{ eventId: resSpEvent.data.id?.toString() }}
    >
      <SportingEventForm data={resSpEvent.data} catTemplates={resCatTemplates.data} />
    </FormBox>
  );
}
