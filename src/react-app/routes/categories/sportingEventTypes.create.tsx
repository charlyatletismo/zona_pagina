import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import { FormBox } from '@/components/formBox';
import { SportingEventTypeForm } from '@/components/sportingEventTypeForm';


export const Route = createFileRoute('/categories/sportingEventTypes/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
})

function RouteComponent() {
  return (
    <FormBox
      title="Crear Nuevo Tipo de Evento Deportivo"
      description="Rellena el formulario para crear un nuevo tipo de evento deportivo."
      returnText="Volver al listado de categorías"
      returnPath="/categories"
    >
      <SportingEventTypeForm spType={null} />
    </FormBox>
  )
}
