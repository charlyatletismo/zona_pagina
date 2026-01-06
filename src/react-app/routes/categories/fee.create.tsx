import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { FormBox } from '@/components/formBox';
import { CategoryFeeForm } from '@/components/categoryFeeForm';


export const Route = createFileRoute('/categories/fee/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
})


function RouteComponent() {
  return (
    <FormBox
      title="Crear Nueva Categoría de Tarifa"
      description="Rellena el formulario para crear una nueva categoría de tarifa."
      returnText="Volver al listado de categorías"
      returnPath="/categories"
    >
      <CategoryFeeForm feeCat={null} />
    </FormBox>
  )
}
