import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import SportingEventForm from '@/components/sportingEventForm';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { AthCatApiResponse } from '@shared/apiRespTypes';
import { FormBox } from '@/components/formBox';
import z from 'zod';

export const Route = createFileRoute('/sportingEvents/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const resCatTemplates = await getAuthenticatedThrow<z.infer<typeof AthCatApiResponse>>('/api/athleteCategoryTemplates');
    const resLocations = await getAuthenticatedThrow<string[]>('/api/locations');
    return { resCatTemplates, resLocations };
  },
})


function RouteComponent() {
  const { resCatTemplates, resLocations } = Route.useLoaderData();
  return (
    <FormBox
      error={resCatTemplates.status !== 200 ? "Error al cargar los datos de las plantillas de categorías de atletas." : null}
      title="Crear Evento Deportivo"
      description="Completa el formulario para crear un nuevo evento deportivo."
    >
      <SportingEventForm
        data={null}
        catTemplates={resCatTemplates.body?.data || []}
        locations={resLocations.body?.data || []} />
    </FormBox>
  );
}
