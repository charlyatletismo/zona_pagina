import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { CategoryAthleteForm } from '@/components/categoryAthleteForm';
import { FormBox } from '@/components/formBox';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { AthleteCategory, FeeCategory } from '@shared/types';


export const Route = createFileRoute('/categories/athlete/$athleteId/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const resAth: {
      data: AthleteCategory;
      status: number;
    } = await getAuthenticatedThrow(`/api/categories/athlete/${params.athleteId}`);
    const resFees: {
      data: FeeCategory[];
      status: number;
    } = await getAuthenticatedThrow(`/api/categories/fee`);
    return {resAth, resFees};
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
})


function RouteComponent() {
  const {resAth, resFees} = Route.useLoaderData();
  return (
    <FormBox
      title="Editar Categoría de Atleta"
      description="Actualiza la información de la categoría de atleta."
      returnText="Volver al listado de categorías"
      returnPath="/categories"
      error={(resAth.status !== 200 || resFees.status !== 200) ? "Error al cargar los datos de la categoría o tarifas." : null}
    >
      {/* TODO: add data */}
      <CategoryAthleteForm athCat={resAth.data} feeCats={resFees.data} />
    </FormBox>
  );
}
