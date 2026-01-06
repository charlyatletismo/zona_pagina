import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import SportingEventForm from '@/components/sportingEventForm';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import {
  AthleteCategoryTemplateSchema,
  AthleteCategoryTemplateType
} from '@shared/types';
import { FormBox } from '@/components/formBox';
import z from 'zod';


export const Route = createFileRoute('/sportingEvents/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const resCatTemplates: {
      status: number;
      body: {
        data: AthleteCategoryTemplateType[]
        message?: Record<string, string>
      };
    } = await getAuthenticatedThrow('/api/athleteCategoryTemplates');
    if (resCatTemplates.status === 200 && resCatTemplates.body.data) {
      resCatTemplates.body.data = z.array(AthleteCategoryTemplateSchema).parse(resCatTemplates.body.data);
    }
    return { resCatTemplates };
  },
})


function RouteComponent() {
  const { resCatTemplates } = Route.useLoaderData();
  return (
    <FormBox
      error={resCatTemplates.status !== 200 ? "Error al cargar los datos de las plantillas de categorías de atletas." : null}
      title="Crear Evento Deportivo"
      description="Completa el formulario para crear un nuevo evento deportivo."
    >
      <SportingEventForm data={null} catTemplates={resCatTemplates.body.data || []} />
    </FormBox>
  );
}
