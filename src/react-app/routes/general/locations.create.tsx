import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { FormBox } from '@/components/formBox';
import { LocationForm } from '@/components/locationForm';


export const Route = createFileRoute('/general/locations/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const locationsApi = await getAuthenticatedThrow<string[]>('/api/locations');
    return { locationsApi };
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  const { locationsApi } = Route.useLoaderData();
  return (
    <FormBox
      title="Crear Nueva Ubicación"
      description="Agregar una nueva ubicación a la base de datos."
      returnText="Volver a Ubicaciones"
      returnPath='..'
      error={locationsApi.status !== 200 ? "Error al cargar las ubicaciones. Por favor intenta recargar la página." : null}
    >
      <LocationForm location={null} dbLocations={locationsApi.body.data} />
    </FormBox>
  )
}
