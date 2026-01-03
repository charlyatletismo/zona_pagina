import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import SportingEventForm from '@/components/sportingEventForm';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { SportingEventTypeEnum } from '@/lib/types'
import { FormBox } from '@/components/formBox';


export const Route = createFileRoute('/sportingEvents/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const spEvType = await getAuthenticatedThrow('/api/sportingEventTypes');
    const evTypes: SportingEventTypeEnum[] = spEvType.data;
    return { evTypes, statusEvType: spEvType.status};
  },
})


function RouteComponent() {
  const { evTypes, statusEvType } = Route.useLoaderData();
  return (
    <FormBox
      error={statusEvType !== 200 ? "Error al cargar los datos de los tipos de evento." : null}
      title="Crear Evento Deportivo"
      description="Completa el formulario para crear un nuevo evento deportivo."
    >
      <SportingEventForm ev={null} evTypes={evTypes} />
    </FormBox>
  );
}
