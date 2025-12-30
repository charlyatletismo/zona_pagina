import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import { FormBox } from '@/components/formBox';
import { SportingEventTypeForm } from '@/components/sportingEventTypeForm';
import { SportingEventType } from '@/lib/types';
import { getAuthenticatedThrow } from '@/lib/apiCalls';


export const Route = createFileRoute(
  '/categories/sportingEventTypes/$spTypeId',
)({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const res: {
      data: SportingEventType;
      status: number;
    } = await getAuthenticatedThrow(`/api/sportingEventTypes/${params.spTypeId}`);
    return res;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
})


function RouteComponent() {
  const spType = Route.useLoaderData();
  return (
    <FormBox
      title="Actualizar Tipo de Evento Deportivo"
      description="Rellena el formulario para actualizar el tipo de evento deportivo."
      returnText="Volver al listado de categorías"
      returnPath="/categories"
      error={spType.status !== 200 ? "Error al cargar los datos del tipo de evento deportivo." : null}
    >
      <SportingEventTypeForm spType={spType.data} />
    </FormBox>
  )
}
