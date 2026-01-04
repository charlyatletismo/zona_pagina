import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import {
  SportingEventSchema,
  SportingEventType,
  AthleteCategoryTemplateSchema,
  AthleteCategoryTemplateType
} from '@/lib/types';
import SportingEventForm from '@/components/sportingEventForm';
import { FormBox } from '@/components/formBox';
import z from 'zod';


export const Route = createFileRoute('/sportingEvents/$eventId/edit')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const resSpEvent: {
      status: number;
      body: {
        data: SportingEventType,
        message?: Record<string, string>
      };
    } = await getAuthenticatedThrow(`/api/sportingEvents/${params.eventId}`);
    const resCatTemplates: {
      status: number;
      body: {
        data: AthleteCategoryTemplateType[]
        message?: Record<string, string>
      };
    } = await getAuthenticatedThrow('/api/athleteCategoryTemplates');
    if (resSpEvent.status === 200 && resSpEvent.body.data) {
      resSpEvent.body.data = SportingEventSchema.parse(resSpEvent.body.data);
    }
    if (resCatTemplates.status === 200 && resCatTemplates.body.data) {
      resCatTemplates.body.data = z.array(AthleteCategoryTemplateSchema).parse(resCatTemplates.body.data);
    }
    return {
      resSpEvent,
      resCatTemplates
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
          + (resSpEvent.body.message ? ` ${resSpEvent.body.message || ''}` : '')
          + (resCatTemplates.body.message ? ` ${resCatTemplates.body.message || ''}` : '')
        : null}
      title="Editar Evento Deportivo"
      description="Actualiza la información del evento deportivo."
      returnText="Volver al Evento"
      returnPath="/sportingEvents/$eventId"
      returnParams={{ eventId: resSpEvent.body.data.id?.toString() }}
    >
      <SportingEventForm
        data={resSpEvent.body.data}
        catTemplates={resCatTemplates.body.data}
        />
    </FormBox>
  );
}
