import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import { CategoryAthleteForm } from '@/components/categoryAthleteForm';
import { FormBox } from '@/components/formBox';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { AthleteCategory } from '@/lib/types';


export const Route = createFileRoute('/categories/athlete/$athleteId/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
    loader: async ({ params }) => {
      const res: {
        data: AthleteCategory;
        status: number;
      } = await getAuthenticatedThrow(`/api/categories/athlete/${params.athleteId}`);
      return res;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
})


function RouteComponent() {
  const res = Route.useLoaderData();
  return (
    <FormBox
      title="Editar Categoría de Atleta"
      description="Actualiza la información de la categoría de atleta."
      returnText="Volver al listado de categorías"
      returnPath="/categories"
      error={res.status !== 200 ? "Error al cargar los datos de la categoría." : null}
    >
      {/* TODO: add data */}
      <CategoryAthleteForm />
      <div>
        {JSON.stringify(res.data)}
      </div>
    </FormBox>
  );
}
