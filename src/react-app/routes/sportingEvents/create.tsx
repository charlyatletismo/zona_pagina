import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import SportingEventForm from '@/components/sportingEventForm';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { FormBox } from '@/components/formBox';
import { getMessage } from '@/lib/utils';


export const Route = createFileRoute('/sportingEvents/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const resLocations = await getAuthenticatedThrow<string[]>('/api/locations');
    return { resLocations };
  },
})


function RouteComponent() {
  const { resLocations } = Route.useLoaderData();
  return (
    <FormBox
      error={resLocations.status !== 200
        ? "Error al cargar los datos de las localidades. "
          + getMessage(resLocations.body.message, "", " ")
        : null}
      title="Crear Evento Deportivo"
      description="Completa el formulario para crear un nuevo evento deportivo."
    >
      <SportingEventForm
        data={null}
        locations={resLocations.body?.data || []} />
    </FormBox>
  );
}
