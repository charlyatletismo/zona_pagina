import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import {
  SportingEventSchema,
  AthleteCategoryTemplateSchema,
} from '@/lib/types';
import SportingEventForm from '@/components/sportingEventForm';
import { FormBox } from '@/components/formBox';
import z from 'zod';


export const Route = createFileRoute('/sportingEvents/$eventId/edit')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const resSpEvent = await getAuthenticatedThrow(`/api/sportingEvents/${params.eventId}`);
    const resCatTemplates = await getAuthenticatedThrow('/api/athleteCategoryTemplates');
    let dataSpEvent = null;
    let dataCatTemplates = null;
    if (resSpEvent.status === 200 && resSpEvent.body?.data) {
      try {
        dataSpEvent = SportingEventSchema.parse(resSpEvent.body.data);
      } catch (e) {
        // console.error('Error parsing SportingEvent data:', e);
        resSpEvent.body.message = {
          es: 'Los datos del evento deportivo están corruptos o no son válidos.',
          en: 'The sporting event data is corrupt or invalid.'
        }
      }
    }
    if (resCatTemplates.status === 200 && resCatTemplates.body.data) {
      try {
        dataCatTemplates = z.array(AthleteCategoryTemplateSchema).parse(resCatTemplates.body.data);
      } catch (e) {
        // console.error('Error parsing AthleteCategoryTemplate data:', e);
        resCatTemplates.body.message = {
          es: 'Los datos de la plantilla de categoría de atleta están corruptos o no son válidos.',
          en: 'The athlete category template data is corrupt or invalid.'
        }
      }
    }
    return {
      resSpEvent: {
        status: resSpEvent.status,
        data: dataSpEvent,
        message: resSpEvent.body.message,
      },
      resCatTemplates: {
        status: resCatTemplates.status,
        data: dataCatTemplates,
        message: resCatTemplates.body.message,
      }
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
        (resSpEvent.status !== 200 || resCatTemplates.status !== 200
          || !resSpEvent.data || !resCatTemplates.data
        )
        ? "Error al cargar los datos del evento."
          + (resSpEvent.message ? ` ${resSpEvent.message}` : '')
          + (resCatTemplates.message ? ` ${resCatTemplates.message}` : '')
        : null}
      title="Editar Evento Deportivo"
      description="Actualiza la información del evento deportivo."
      returnText="Volver al Evento"
      returnPath="/sportingEvents/$eventId"
      returnParams={{ eventId: resSpEvent.data?.id.toString() }}
    >
      <SportingEventForm
        data={resSpEvent.data}
        catTemplates={resCatTemplates.data || []}
        />
    </FormBox>
  );
}
