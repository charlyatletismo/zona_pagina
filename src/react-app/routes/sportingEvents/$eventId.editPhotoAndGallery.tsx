import { createFileRoute, useNavigate } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls';
import { ARSportingEventGallerySchema } from '@shared/apiRespTypes';
import { UploadImageForm } from '@/components/uploadImageForm';
import { AlertCircle, ImageIcon, Trash2Icon } from 'lucide-react';
import z from 'zod';
import { useState } from 'react';
import { FormBox } from '@/components/formBox';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { getMessage } from '@/lib/utils';


export const Route = createFileRoute(
  '/sportingEvents/$eventId/editPhotoAndGallery',
)({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const res = await getAuthenticatedThrow<
      z.infer<typeof ARSportingEventGallerySchema>
      >(`/api/sportingEvents/${params.eventId}/gallery`,
        ARSportingEventGallerySchema);
    return { res };
  },
  staleTime: 1000 * 60 * 5,
  gcTime: 0 // force reload every time
})


function RouteComponent() {
  const { eventId } = Route.useParams();
  const { res } = Route.useLoaderData();
  const navigate = useNavigate();


  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);


  if (!res.body.data) {
    return <div className="p-6">Evento no encontrado</div>
  }

  return (
    <FormBox
      title={`Editar fotos del evento: ${res.body.data.title}`}
      description="Desde esta sección puedes cambiar la foto principal del evento y gestionar las fotos de la galería."
    >
      <div className="p-6 space-y-2">

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
            {success}
          </div>
        )}

        {loading ? (
          <div className="bg-gray-50 text-gray-600 p-3 rounded-md text-sm flex gap-4 items-center space-x-2">
            <Spinner /><div>Actualizando...</div>
          </div>) : null
        }


        <h1 className='text-xl font-bold text-gray-800'>Foto del evento</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className='flex flex-col gap-2'>
            <p>Ahora</p>
            {res.body.data.photo_id ? (
              <div className='flex flex-col gap-2'>
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                      src={`https://imagedelivery.net/x1piYdlDlmNQ_iTYafCcEQ/${res.body.data.photo_id}/public`}
                      alt={res.body.data.title}
                      className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={loading}
                  className='cursor-pointer'
                  onClick={async () => {
                    setError('');
                    setSuccess('');
                    setLoading(true);
                    // Scroll to top of the page when form is submitted
                    window.scrollTo({ top: 0, behavior: 'smooth' });

                    const res = await postAuthenticated(
                      `/api/sportingEvents/${eventId}/deletePhoto`,
                      {},
                      navigate)
                    if (res.status !== 200) {
                      setLoading(false);
                      setError(getMessage(res.body?.message, 'Error al eliminar la foto'));
                      setTimeout(() => {
                        setError('');
                      }, 1500);
                      return;
                    }
                    setLoading(false);
                    setSuccess(getMessage(res.body?.message, 'Foto eliminada correctamente'));
                    setTimeout(() => {
                      setSuccess('');
                      navigate({ to: '.', reloadDocument: true });
                    }, 1000);
                  }}
                >
                  {loading ? <Spinner /> : null}
                  {loading ? null : <Trash2Icon className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>No hay imagen para el evento</p>
                </div>
              </div>
            )}
          </div>
          <div className='flex flex-col gap-2'>
            <p>Después</p>
            <UploadImageForm
              apiUrl={`/api/sportingEvents/${eventId}/updatePhoto`}
              tagId="photo"
              setError={setError}
              setSuccess={setSuccess}
              loading={loading}
              setLoading={setLoading}
              />
          </div>
        </div>

        <h1 className='text-xl font-bold text-gray-800 mt-5'>Galería</h1>
        <p className="text-gray-600 mb-4">Agrega fotos adicionales del evento para mostrar en la galería.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div>
            A charlar
          </div>
        </div>
      </div>
    </FormBox>
  )
}
