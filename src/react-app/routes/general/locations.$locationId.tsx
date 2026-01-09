import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { FormBox } from '@/components/formBox';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import z from 'zod';
import { LocationSchema } from '@shared/types';
import { LocationForm } from '@/components/locationForm';
import { getMessage } from '@/lib/utils';


export const Route = createFileRoute('/general/locations/$locationId')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const locApi = await getAuthenticatedThrow<z.infer<typeof LocationSchema>>(`/api/locations/${params.locationId}`);
    const locationsApi = await getAuthenticatedThrow<string[]>('/api/locations');
    return { locApi, locationsApi };
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  const { locApi, locationsApi } = Route.useLoaderData();
  return (
    <FormBox
      title="Editar Ubicación"
      description="Modificar los detalles de la ubicación."
      returnText="Volver a Ubicaciones"
      returnPath='..'
      error={
        locApi.status !== 200
        ? getMessage(locApi.body?.message, 'Error al cargar la ubicación.')
        : locationsApi.status !== 200
          ? getMessage(locationsApi.body?.message, 'Error al cargar las ubicaciones.')
          : null}
    >
      <LocationForm
        location={locApi.body.data}
        dbLocations={locationsApi.body.data}
      />
    </FormBox>
  )
}
