import { createFileRoute, Link } from '@tanstack/react-router';
import unprotectedCheck from '@/lib/beforeLoadGenericCheck';
import {
  CalendarIcon,
  MapPinIcon,
  InfoIcon,
  FileTextIcon,
  TrophyIcon,
  ImageIcon,
  ArrowLeft,
  Edit,
  AlertCircle,
  Check,
  FileUserIcon,
  FilePlus2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ADMIN_ROLE,
  ATHLETES_MANAGER_ROLE,
  ORGANIZER_ROLE,
} from '@shared/roles';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls';
import { getLang } from "@/lib/utils";
import { SportingEventSchema } from '@shared/types';
import { SportingEventApiResponseReadSchema } from '@shared/apiRespTypes';
import { RegistrationStatusDescriptions } from '@shared/lang';
import { getMessage } from '@/lib/utils';
import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { ButtonPing } from '@/components/pingingButton';
import z from 'zod';


const getRegistrationStatusDescription = (status: string | null) => {
  if (!status) return "Desconocido";
  return RegistrationStatusDescriptions[status][getLang()]
    || "Desconocido";
}


export const Route = createFileRoute('/sportingEvents/$eventId/')({
  component: RouteComponent,
  beforeLoad: unprotectedCheck(),
  loader: async ({ params }) => {
    const res = await getAuthenticatedThrow<
      z.infer<typeof SportingEventSchema
      >>(`/api/sportingEvents/${params.eventId}`);
    return {
      res,
      data: res.body
        ? SportingEventApiResponseReadSchema.parse(res.body?.data)
        : null
      };
  },
  staleTime: 1000 * 60 * 5,
})


function RouteComponent() {
  const { eventId } = Route.useParams();
  const { res, data } = Route.useLoaderData();
  if (res.status !== 200 || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Error al cargar el evento</h2>
        <div className='text-center text-gray-600' >{getMessage(res.body?.message, 'Error desconocido')}</div>
        <Button asChild variant="outline">
            <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    )
  }
  const currentRole: string = localStorage.getItem('USER_ROLE') || '';
  const now = new Date();
  const openToRegister =
    data.registration_start && data.registration_end
    ? (now >= data.registration_start && now <= data.registration_end)
    : false;
  const [registering, setRegistering] = React.useState(-1);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = Route.useNavigate();
  const handleRegister = async (circuitId: number) => {
    // Scroll to top of the page when form is submitted
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!localStorage.getItem('JWT_TOKEN')) {
      navigate({
        to: '/login'
      });
      return;
    }
    setRegistering(circuitId);
    const res = await postAuthenticated(
      `/api/sportingEvents/${eventId}/register`,
      {
        "circuitId": circuitId,
        "userId": localStorage.getItem('USER_ID')
      },
      navigate);
    if (res.status !== 200) {
      setError(
        getMessage(
          res.body.message,
          'Error al inscribirse. Por favor, intente nuevamente más tarde.'
        )
      );
      setTimeout(() => {
        setError('');
      }, 3000);
    } else {
      setSuccess('Inscripción exitosa!');
      setTimeout(() => {
        setSuccess('');
        navigate({
          to: "/sportingEvents/$eventId/registration",
          params: { eventId }
        })
      }, 1000);
      data.user_registration_status = {
        registration_status: res.body.data.registration_status,
        category_name: res.body.data.category_name,
        circuit_id: res.body.data.circuit_id,
        pending_to_pay: res.body.data.pending_to_pay,
      }
    }
    setRegistering(-1);
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Evento no encontrado</h2>
        <Button asChild variant="outline">
            <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">

      {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4" />
              {error}
          </div>
      )}

      {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm mb-3">
              {success}
          </div>
      )}

      {
        data.user_registration_status
        && data.user_registration_status.registration_status !== 'not_registered'
        &&
        <div className="text-white text-center rounded-md mb-3 flex justify-center md:justify-start flex-wrap">
          <div className='px-1 py-2 my-auto'>
            <Badge
              className='py-1 px-2 bg-green-500 dark:bg-green-700'
            >
              <Check className="h-1 w-1 my-auto" /> <b>Inscripto</b>
            </Badge>
          </div>
          <div className='px-1 py-1 my-auto'>
            <Badge
              className='py-1 px-2 bg-blue-500 dark:bg-blue-600'
            >
              <b>Circuito</b> {data.circuits?.find(c => c.id === data.user_registration_status?.circuit_id)?.name || ''}
            </Badge>
          </div>
          <div className='px-1 py-1 my-auto'>
            <Badge
              className='py-1 px-2 bg-blue-500 dark:bg-blue-600'
            >
              <b>Categoría</b> {data.user_registration_status.category_name}
            </Badge>
          </div>
          <div className='px-1 py-1 my-auto'>
            <Badge
              className={
                'py-1 px-2 '
                + {
                  'paid': 'bg-green-500 dark:bg-green-600',
                  'cancelled': 'bg-red-500 dark:bg-red-600',
                  'pending': 'bg-yellow-500 dark:bg-yellow-600',
                  'partially_paid': 'bg-orange-500 dark:bg-orange-600',
                  '': 'bg-gray-500 dark:bg-gray-600',
                }[data.user_registration_status.registration_status || '']
              }
            >
              <b>Estado</b> {getRegistrationStatusDescription(data.user_registration_status?.registration_status || null)}
            </Badge>
          </div>

          <div className='px-1 py-2 my-auto'>
              <ButtonPing
                size='sm'
                padding='px-0 py-1'
                pingType={
                  ['pending', 'partially_paid'].includes(
                    data.user_registration_status.registration_status || '')
                    ? 1
                    : 2}
              >
              <Link className='px-5' to='/sportingEvents/$eventId/registration' params={{ eventId }}>
                <FileUserIcon className="inline-block w-4 h-4 mr-2" />
                Detalles de inscripción
              </Link>
            </ButtonPing>
          </div>
        </div>
      }

      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="ghost" 
          className="pl-0 hover:bg-transparent hover:text-primary" 
          asChild
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Inicio
          </Link>
        </Button>

        <div className='flex gap-2'>
          {[ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE].includes(currentRole) && (
            <Button asChild variant="outline">
              <Link to="/sportingEvents/$eventId/register" params={{ eventId }}>
                <FilePlus2 className="w-4 h-4" />
                Registrar Atletas
              </Link>
            </Button>
          )}

          {[ADMIN_ROLE, ORGANIZER_ROLE].includes(currentRole) && (
            <Button asChild variant="outline">
              <Link to="/sportingEvents/$eventId/edit" params={{ eventId }}>
                <Edit className="w-4 h-4" />
                Editar
              </Link>
            </Button>
          )}
        </div>

      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.title}</h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <CalendarIcon className="w-5 h-5" />
          <span>{new Date(data.date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Image */}
          {data.image_url ? (
              <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img 
                      src={data.image_url} 
                      alt={data.title} 
                      className="w-full h-full object-cover"
                  />
              </div>
          ) : (
              <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p>Imagen del Evento</p>
                  </div>
              </div>
          )}

          {/* Description */}
          <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <InfoIcon className="w-6 h-6 text-primary" />
                  Descripción
              </h2>
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                  {data.description || "No hay descripción disponible."}
              </div>
          </section>

          {/* Rules */}
          {data.rules && (
              <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                      <FileTextIcon className="w-6 h-6 text-primary" />
                      Reglamento
                  </h2>
                  <div className="bg-gray-50 p-6 rounded-lg text-sm text-gray-600 whitespace-pre-wrap border">
                      {data.rules}
                  </div>
              </section>
          )}
          {/* Prizes */}
          {data.award_prizes && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <TrophyIcon className="w-6 h-6 text-primary" />
                Premios
              </h2>
              <div className="bg-yellow-50 p-6 rounded-lg text-sm text-gray-700 whitespace-pre-wrap border border-yellow-100">
                {data.award_prizes}
              </div>
            </section>
          )}
          {data.schedules && data.schedules.length > 0 && (
            <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                    Cronograma
                </h2>
                <div className="space-y-4">
                  {data.schedules.map((schedule) => (
                    <div key={schedule.id} className="mb-2 border-l-4 border-primary pl-4">
                        <h3 className="text-lg font-medium mb-1">{schedule.title}</h3>
                        <div className="text-sm text-gray-500 mb-2">{schedule.date?.toLocaleString()}</div>
                        {schedule.description && (
                          <p className="text-gray-600 whitespace-pre-wrap">{schedule.description}</p>
                        )}
                    </div>
                  ))}
                </div>
            </section>
          )}
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Key Details Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Ubicación</h3>
              {data.location_lat && data.location_long ? (
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${data.location_lat},${data.location_long}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-gray-600 hover:text-primary transition-colors group"
                >
                  <MapPinIcon className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="group-hover:underline">{data.location || "Ubicación por definir"}</p>
                    {data.location_address && (
                      <p className="text-sm text-gray-500 mt-1">{data.location_address}</p>
                    )}
                  </div>
                </a>
              ) : (
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPinIcon className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p>{data.location || "Ubicación por definir"}</p>
                    {data.location_address && (
                      <p className="text-sm text-gray-500 mt-1">{data.location_address}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Inscripciones</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Inicio:</span>
                  <span>{data.registration_start ? data.registration_start.toLocaleDateString() : 'TBA'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cierre:</span>
                  <span>{data.registration_end ? data.registration_end.toLocaleDateString() : 'TBA'}</span>
                </div>
              </div>
            </div>
            {data.circuits && data.circuits.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-4">Circuitos</h3>
                <div className="space-y-4">
                  {data.circuits.map((circuit) => (
                    <div key={circuit.id} className="p-1">
                      <h4 className="mb-2 border-l-2 border-primary pl-4">{circuit.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{circuit.description || 'Sin descripción'}</p>
                      <p className="text-sm text-gray-500 mt-1">Distancia: {circuit.distance_km} km</p>
                      {circuit.map_url && (
                        <a 
                          href={circuit.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-2 inline-block"
                        >
                          Ver Mapa del Circuito
                        </a>
                      )}
                      {openToRegister && (
                        <div className="text-center">
                          <RegisterButton
                            handleRegister={handleRegister}
                            circuitId={circuit.id || -1}
                            registering={registering}
                            openToRegister={openToRegister}
                            userRegistered={data.user_registration_status?.circuit_id || -1} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


const RegisterButton = (
  { handleRegister,
    circuitId,
    registering,
    openToRegister,
    userRegistered }: {
      handleRegister: (circuitId: number) => void;
      circuitId: number;
      registering: number;
      openToRegister: boolean;
      userRegistered: number}
    ) => {
  const classDisabled = "w-full mt-2 bg-gray-300 text-gray-600 cursor-not-allowed";
  if (userRegistered === circuitId) {
    return (
      <Button
        className="w-full mt-2 bg-green-400"
        size="sm"
        disabled
      >
        <Check className="inline-block w-5 h-5 ml-2" /> Inscripto
      </Button>
    )
  }
  if (userRegistered > 0) {
    return (
      <Button
        className={classDisabled}
        variant={'outline'}
        size="sm"
        disabled
      >
        Inscripto en otro circuito
      </Button>
    );
  }
  if (openToRegister) {
    return (
      <Button
        className={
          registering > 0 ?
          registering !== circuitId
            ? classDisabled
            : 'w-full mt-2'
          : 'w-full mt-2'
          }
        size="sm"
        onClick={() => handleRegister(circuitId)}
        disabled={registering > 0}
      >
        {registering === circuitId && (
          <Spinner />
        )}
        {
          registering > 0 ?
          registering === circuitId
            ? 'Inscribiendo...'
            : '...'
          : 'Inscribirse'}
      </Button>
    )
  }
  return (
    <Button
      className={classDisabled}
      size="sm"
      disabled
    >
      Inscripciones Cerradas
    </Button>
  );
}
