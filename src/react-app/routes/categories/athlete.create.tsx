import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import { CategoryAthleteForm } from '@/components/categoryAthleteForm';
import { FormBox } from '@/components/formBox';


export const Route = createFileRoute('/categories/athlete/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
})


function RouteComponent() {
  return (
    <FormBox
      title="Crear categoría de atleta"
      description='Completa el formulario para crear una nueva categoría de atleta.'
      returnText="Volver al listado de categorías"
      returnPath="/categories"
    >
      <CategoryAthleteForm />
    </FormBox>
  );
}
