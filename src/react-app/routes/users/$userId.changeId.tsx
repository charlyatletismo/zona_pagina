import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE } from '@shared/roles';
import { FormBox } from '@/components/formBox';
import { UserIdForm } from '@/components/userIdForm';


export const Route = createFileRoute('/users/$userId/changeId')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
})


function RouteComponent() {
  const { userId } = Route.useParams();
  return (
    <FormBox
      title="Cambiar DNI de Usuario"
      description="Cambia este identificador en todos los registros relacionados."
      returnText="Volver al perfil"
      returnPath='..'
    >
      <UserIdForm userId={userId} />
    </FormBox>
  );
}
