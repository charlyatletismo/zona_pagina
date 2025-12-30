import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import { CategoryAthleteForm } from '@/components/categoryAthleteForm';
import { FormBox } from '@/components/formBox';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { FeeCategory } from '@/lib/types';


export const Route = createFileRoute('/categories/athlete/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const resFees: {
      data: FeeCategory[];
      status: number;
    } = await getAuthenticatedThrow(`/api/categories/fee`);
    return resFees;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
})


function RouteComponent() {
  const resFees = Route.useLoaderData();
  return (
    <FormBox
      title="Crear categoría de atleta"
      description='Completa el formulario para crear una nueva categoría de atleta.'
      returnText="Volver al listado de categorías"
      returnPath="/categories"
      error={resFees.status !== 200 ? "Error al cargar las tarifas." : null}
    >
      <CategoryAthleteForm athCat={null} feeCats={resFees.data} />
    </FormBox>
  );
}
