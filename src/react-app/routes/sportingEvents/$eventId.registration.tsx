import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ALL_ROLES } from '@/lib/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { MercadoPagoLogo } from '@/components/icons/mercadoPago';
import { Button } from '@/components/ui/button';
import { getMessage } from '@/lib/utils';
import { SportingEventRegistrationApiResponseSchema } from '@/lib/types';
import { Whatsapp } from '@/components/icons/whatsapp';
import {
  ArrowLeft,
  CalendarIcon,
  CheckCircle,
  BadgeQuestionMarkIcon,
  Shirt,
  MapPin,
  Users2,
  Ruler,
  AlertCircle,
  CircleXIcon,
  PercentCircle,
  BadgeDollarSignIcon,
  Copy,
  Check
} from 'lucide-react';


export const Route = createFileRoute('/sportingEvents/$eventId/registration')({
  component: RouteComponent,
  beforeLoad: authCheck(ALL_ROLES),
  loader: async ({ params }) => {
    const { status, body } = await getAuthenticatedThrow(`/api/sportingEvents/${params.eventId}/registration`);
    let finalData = null;
    let message = body?.message;
    if (status === 200 && body && body.data) {
      try {
        finalData = SportingEventRegistrationApiResponseSchema.parse(body.data);
      } catch (e) {
        console.log(body.data);
        console.error("Error parsing sporting event registration data:", e);
        message = {
          en: "Error parsing sporting event registration data",
          es: "Error al interpretar los datos de registro del evento deportivo"
        }
      }
    }
    return {
      status,
      data: finalData,
      message
    };
  },
  staleTime: 1000 * 60 * 5,
})


function RouteComponent() {
  const { status, data, message } = Route.useLoaderData();

  if (status !== 200 || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">{
          (status === 404 || !data)
          ? 'Datos no disponibles'
          : status !== 200
            ? 'Error al traer los detalles de su registro'
            : 'Error al cargar los detalles de su registro'
          }</h2>
        <div className='text-center text-gray-600' >{getMessage(message, 'Error desconocido')}</div>
        <Button asChild variant="outline">
          <Link to="..">Volver atrás</Link>
        </Button>
      </div>
    )
  }

  const linkMp = "https://www.mercadopago.com.ar/money-out/transfer/discovery";

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">

      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-primary"
          asChild
        >
          <Link to="..">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al evento
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Detalles de registro</h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <CalendarIcon className="w-5 h-5" />
          <span>Registrado el {new Date(data.registration.registration_date).toLocaleDateString()}</span>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="md:col-span-2 space-y-8">
          {data.category ? (
            <section>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    Categoría
                </h2>
                <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                    {data.category.name || "No hay descripción disponible."}
                </div>
                {/* <p className="text-gray-600">Circuito ID: {data.category.circuit_id}</p> */}
            </section>
          ) : (
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <BadgeQuestionMarkIcon className="w-6 h-6 text-primary" />
                Categoría
              </h2>
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                Por definir. Aún se te ha asignado una categoría. Se le ha solicitado al organizador que la asigne.
              </div>
              {/* <p className="text-gray-600">Circuito ID: {data.category.circuit_id}</p> */}
            </section>
          )}

          {/* Team */}
          {data.training_team && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Users2 className="w-6 h-6 text-primary" />
                Equipo de Entrenamiento
              </h2>
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                {data.training_team.name || "No hay descripción disponible."}
              </div>
              <div>
                <MapPin className="w-5 h-5 inline-block mr-2 text-gray-500" />
                <span className="text-gray-600">{data.training_team.location || "Ubicación no disponible."}</span>
              </div>
            </section>
          )}

          {/* Clothing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shirt className="w-6 h-6 text-primary" />
              {
                data.registration.demanded_clothing?.clothing_type === 'tshirt'
                ? 'Remera'
                : data.registration.demanded_clothing?.clothing_type === 'tanktop'
                  ? 'Musculosa'
                  : 'Indumentaria'
              }
            </h2>
            <div className="space-y-4">
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                <Ruler className="w-5 h-5 inline-block mr-2 text-gray-500" />
                <b>Talle</b>: {data.registration.demanded_clothing?.size || 'No seleccionado'}
              </div>
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                {data.registration.reserved_clothing_id === 0
                 || data.registration.reserved_clothing ? (
                  <CheckCircle className="w-5 h-5 inline-block mr-2 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 inline-block mr-2 text-white bg-yellow-500 rounded-full" />
                )}
                <b>Reservado</b>: {
                  data.registration.reserved_clothing_id !== 0
                  ? data.registration.reserved_clothing?.size || 'No reservado aún '
                  : 'Declinaste la indumentaria'
                }
                {data.registration.reserved_clothing_id !== 0
                  && !data.registration.reserved_clothing && (
                  <p className="inline-block ml-2 text-sm text-red-500">{
                    ((data.registration.demanded_clothing?.available_quantity || 0)
                      - (data.registration.demanded_clothing?.reserved_quantity || 0)) > 0
                      ? `(Quedan ${(data.registration.demanded_clothing?.available_quantity || 0)
                      - (data.registration.demanded_clothing?.reserved_quantity || 0)
                      } unidades disponibles)`
                      : '(No quedan unidades disponibles)'
                  }</p>
                )}
              </div>
            </div>
          </section>

          {/* Special Needs */}
          {data.registration.special_needs && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-primary" />
                Necesidades Especiales
              </h2>
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                {data.registration.special_needs}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Payment details */}
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Estado</h3>
              {['pending', 'partially_paid'].includes(data.registration.status) ? (
                <div>
                  <AlertCircle className="w-5 h-5 inline-block mr-2 text-white bg-yellow-500 rounded-full" />
                  {
                    data.registration.status === 'pending'
                    ? 'Pendiente de pago'
                    : 'Pago parcial recibido'
                  }
                </div>
              ) : data.registration.status === 'paid' ? (
                <div>
                  <CheckCircle className="w-5 h-5 inline-block mr-2 text-green-500" />
                  Pagado
                </div>
              ) : data.registration.status === 'cancelled' ? (
                <div>
                  <CircleXIcon className="w-5 h-5 inline-block mr-2 text-white bg-red-500 rounded-full" />
                  Cancelado
                </div>
              ) : (
                <div>
                  <AlertCircle className="w-5 h-5 inline-block mr-2 text-gray-500" />
                  Desconocido
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Importe</h3>
              { data.registration.discount_percentage > 0 && (
                <div className="mb-2">
                  <PercentCircle className="w-5 h-5 inline-block mr-2 text-gray-500" />
                  Descuento aplicado: {data.registration.discount_percentage}% {data.registration.discount_reason ? `(${data.registration.discount_reason})` : ''}
                </div>
              )}
              <div className='flex justify-between'>
                <div>
                  <BadgeDollarSignIcon className="w-5 h-5 inline-block mr-2 text-gray-500" />
                  Tarifa:
                </div>
                <div>${data.registration.fee_amount_original.toFixed(0)}</div>
              </div>
              {data.registration.discount_percentage > 0 && (
                <div className='flex justify-between'>
                  <div>
                    <span className='w-5 h-5 inline-block mr-2'></span>
                    Descuento:
                  </div>
                  <div>${(
                    data.registration.fee_amount_original
                    - data.registration.fee_amount_after_discount
                    ).toFixed(0)}</div>
                </div>
                )}
              <div className='flex justify-between'>
                <div>
                  <span className='w-5 h-5 inline-block mr-2'></span>
                  Pagado:
                </div>
                <div>${data.registration.paid_amount.toFixed(0)}</div>
              </div>
              <div className='flex justify-between'>
                <div>
                  <span className='w-5 h-5 inline-block mr-2'></span>
                  Saldo:
                </div>
                <div className='border-t-2'>${
                  (data.registration.fee_amount_after_discount
                    - data.registration.paid_amount
                    ).toFixed(0)}</div>
              </div>
            </div>
            {data.registration.fee_amount_after_discount - data.registration.paid_amount > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 decoration-2 decoration-dotted decoration-primary underline">Acción requerida</h3>
                <div className='mb-2'>Pagar mediante transferencia al siguiente alias (apretar para copiar)</div>
                <Button
                  className='mb-3'
                  variant={'outline'}
                  onClick={() => {
                    navigator.clipboard.writeText('mi.alias.mp');
                    const copyIcon = document.getElementById('clipboard-copy');
                    const copiedIcon = document.getElementById('clipboard-copied');
                    if (copyIcon && copiedIcon) {
                      copyIcon.style.display = 'none';
                      copiedIcon.style.display = 'inline-block';
                      setTimeout(() => {
                        copyIcon.style.display = 'inline-block';
                        copiedIcon.style.display = 'none';
                      }, 2000);
                    }
                  }}
                >
                  <div className='border-r-2'>
                    <div id="clipboard-copy" style={{display: 'inline-block' }}>
                      <Copy className="w-5 h-5 inline-block mr-2 text-gray-500" />
                    </div>
                    <div id="clipboard-copied" style={{display: 'none'}}>
                      <Check className="w-5 h-5 inline-block mr-2 text-gray-500" />
                    </div>
                  </div>
                  mi.alias.mp
                </Button>
                <div className='mb-2'>
                  Accesos directos a aplicaciones de pago
                </div>
                <Button
                  onClick={() => {
                    // open new tab to mercado pago transfer page
                    window.open(linkMp, '_blank');
                  }}
                  variant={'outline'}
                  className='h-auto py-0 mb-3'
                >
                  <MercadoPagoLogo className='size-8' />
                </Button>
                <div className='mb-2'>Enviar comprobante por WhatsApp</div>
                <Button
                  variant={'outline'}
                  asChild
                >
                  <a
                    href="https://wa.me/5493400660640?text=Hola,%20quiero%20enviar%20el%20comprobante%20de%20pago%20para%20mi%20inscripción%20al%20evento."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Whatsapp />
                    Enviar
                  </a>
                </Button>
              </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
