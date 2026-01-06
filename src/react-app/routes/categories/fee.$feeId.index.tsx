import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { FormBox } from '@/components/formBox';
import { CategoryFeeForm } from '@/components/categoryFeeForm';
import { FeeCategory } from '@shared/types';
import { getAuthenticatedThrow } from '@/lib/apiCalls';


export const Route = createFileRoute('/categories/fee/$feeId/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const resFees: {
      data: FeeCategory;
      status: number;
    } = await getAuthenticatedThrow(`/api/categories/fee/${params.feeId}`);
    return resFees;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
})


function RouteComponent() {
  const feeCat = Route.useLoaderData();
  return (
    <FormBox
      title="Actualizar Categoría de Tarifa"
      description="Rellena el formulario para actualizar la categoría de tarifa."
      returnText="Volver al listado de categorías"
      returnPath="/categories"
      error={feeCat.status !== 200 ? "Error al cargar los datos de la categoría de tarifa." : null}
    >
      <CategoryFeeForm feeCat={feeCat.data} />
    </FormBox>
  )
}
