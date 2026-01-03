import { createFileRoute, Link } from '@tanstack/react-router'
import unprotectedCheck from '@/lib/beforeLoadGenericCheck'
import { CalendarIcon, MapPinIcon, InfoIcon, FileTextIcon, TrophyIcon, ImageIcon, ArrowLeft, Edit, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ADMIN_ROLE, ORGANIZER_ROLE } from '@/lib/roles'
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls'
import { SportingEventSchema, SportingEventType, SportingEventCircuitSchema } from '@/lib/types'
import React from 'react'
import { Spinner } from '@/components/ui/spinner'


export const Route = createFileRoute('/sportingEvents/$eventId/')({
  component: RouteComponent,
  beforeLoad: unprotectedCheck(),
  loader: async ({ params }) => {
    const { status, data, message }: {
      status: number,
      data?: SportingEventType,
      message?: Record<string, string>} = await getAuthenticatedThrow(`/api/sportingEvents/${params.eventId}`);
    return { status, data: SportingEventSchema.parse(data), message };
  },
  staleTime: 1000 * 60 * 5,
})


function RouteComponent() {
  const { eventId } = Route.useParams();
  const {data, status, message} = Route.useLoaderData();
  if (status !== 200 || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Error al cargar el evento</h2>
        <div className='text-center text-gray-600' >{message ? message[localStorage.getItem('LANG') || 'es'] : 'Error desconocido'}</div>
        <Button asChild variant="outline">
            <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    )
  }
  const currentRole: string = localStorage.getItem('USER_ROLE') || '';
  const canEdit = [ADMIN_ROLE, ORGANIZER_ROLE].includes(currentRole);
  const openToRegister =
    data.registration_start && data.registration_end
    ? (new Date() >= new Date(data.registration_start) && new Date() <= new Date(data.registration_end))
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
      setError(res.data.error || 'Error al inscribirse. Por favor, intente nuevamente más tarde.');
      setTimeout(() => {
        setError('');
      }, 3000);
    } else {
      setSuccess('Inscripción exitosa!');
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      data.user_registration_status = {
        registration_status: res.data.registration_status,
        category_name: res.data.category_name,
        circuit_id: res.data.circuit_id,
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
  // return (
  //     <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
  //       <h2 className="text-2xl font-bold">Error al cargar el evento</h2>
  //       <Button asChild variant="outline">
  //           <Link to="/">Volver al inicio</Link>
  //       </Button>
  //     </div>
  //   )

  if (evStatus !== 200) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Error al cargar el evento</h2>
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

            {canEdit && (
                <Button asChild variant="outline">
                  <Link to="/sportingEvents/$eventId/edit" params={{ eventId }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                    </Link>
                </Button>
            )}
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{evData.title}</h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <CalendarIcon className="w-5 h-5" />
                <span>{new Date(evData.date).toLocaleDateString()}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content - Left Column */}
            <div className="md:col-span-2 space-y-8">
                {/* Image */}
                {evData.image_url ? (
                    <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img 
                            src={evData.image_url} 
                            alt={evData.title} 
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
                        {evData.description || "No hay descripción disponible."}
                    </div>
                </section>

                {/* Rules */}
                {evData.rules && (
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            <FileTextIcon className="w-6 h-6 text-primary" />
                            Reglamento
                        </h2>
                        <div className="bg-gray-50 p-6 rounded-lg text-sm text-gray-600 whitespace-pre-wrap border">
                            {evData.rules}
                        </div>
                    </section>
                )}
                 {/* Prizes */}
                 {evData.award_prizes && (
                    <section>
                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            <TrophyIcon className="w-6 h-6 text-primary" />
                            Premios
                        </h2>
                        <div className="bg-yellow-50 p-6 rounded-lg text-sm text-gray-700 whitespace-pre-wrap border border-yellow-100">
                            {evData.award_prizes}
                        </div>
                    </section>
                )}
                {evData.schedules && evData.schedules.length > 0 && (
                  <section>
                      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                          <CalendarIcon className="w-6 h-6 text-primary" />
                          Cronograma
                      </h2>
                      <div className="space-y-4">
                        {evData.schedules.map((schedule) => (
                          <div key={schedule.id} className="mb-2 border-l-4 border-primary pl-4">
                              <h3 className="text-lg font-medium mb-1">{schedule.title}</h3>
                              <div className="text-sm text-gray-500 mb-2">{new Date(schedule.date).toLocaleString()}</div>
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
                        {evData.location_lat && evData.location_long ? (
                            <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${evData.location_lat},${evData.location_long}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-2 text-gray-600 hover:text-primary transition-colors group"
                            >
                                <MapPinIcon className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="group-hover:underline">{evData.location_text || "Ubicación por definir"}</p>
                                    {evData.location_hint && (
                                        <p className="text-sm text-gray-500 mt-1">{evData.location_hint}</p>
                                    )}
                                </div>
                            </a>
                        ) : (
                            <div className="flex items-start gap-2 text-gray-600">
                                <MapPinIcon className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <p>{evData.location_text || "Ubicación por definir"}</p>
                                    {evData.location_hint && (
                                        <p className="text-sm text-gray-500 mt-1">{evData.location_hint}</p>
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
                                <span>{evData.registration_start ? new Date(evData.registration_start).toLocaleDateString() : 'TBA'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Cierre:</span>
                                <span>{evData.registration_end ? new Date(evData.registration_end).toLocaleDateString() : 'TBA'}</span>
                            </div>
                        </div>
                    </div>
                  {evData.circuits && evData.circuits.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Circuitos</h3>
                      <div className="space-y-4">
                        {evData.circuits.map((circuit: SportingEventCircuit) => (
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
                                      userRegistered={evData.user_registered_to_circuit || -1} />
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
