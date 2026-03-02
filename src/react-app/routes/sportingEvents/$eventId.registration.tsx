import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ALL_ROLES } from '@shared/roles';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls';
import { MercadoPagoLogo } from '@/components/icons/mercadoPago';
import { Button } from '@/components/ui/button';
import { getMessage } from '@/lib/utils';
import { trainingTeamsData } from '@/lib/queryCache'
import z from 'zod';
import {
  ARSportingEventRegistrationSchema,
} from '@shared/apiRespTypes';
import { Whatsapp } from '@/components/icons/whatsapp';
import { DeleteButton } from '@/components/deleteButton';
import { GoBackButton } from '@/components/goBackButton';
import {
  CalendarIcon,
  CheckCircle,
  ShirtIcon,
  // MapPin,
  Users2,
  Ruler,
  AlertCircle,
  CircleXIcon,
  PercentCircle,
  BadgeDollarSignIcon,
  Copy,
  Check,
  Cpu,
  SquareChartGanttIcon,
} from 'lucide-react';
import React from 'react';


export const Route = createFileRoute('/sportingEvents/$eventId/registration')({
  component: RouteComponent,
  beforeLoad: authCheck(ALL_ROLES),
  loader: async ({ params }) => {
    const res = await getAuthenticatedThrow<
      z.infer<typeof ARSportingEventRegistrationSchema>
      >(`/api/sportingEvents/${params.eventId}/registration`);
    return {
      res,
      eventId: params.eventId,
      trainingTeam: trainingTeamsData.data.find(
        team => team.id === res.body?.data.registration.training_team_id
      ) || null,
    };
  },
  staleTime: 1000 * 60 * 5,
});


function RouteComponent() {
  const { res, eventId, trainingTeam } = Route.useLoaderData();
  const data = res.body.data;
  const navigate = useNavigate();
  
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  if (res.status !== 200 || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">{
          (res.status === 404 || !data)
          ? 'Datos no disponibles'
          : res.status !== 200
            ? 'Error al traer los detalles de su registro'
            : 'Error al cargar los detalles de su registro'
          }</h2>
        <div className='text-center text-gray-600' >{getMessage(res.body.message, 'Error desconocido')}</div>
        <Button asChild variant="outline">
          <Link to="..">Volver atrás</Link>
        </Button>
      </div>
    )
  }

  const statusLabels = {
    "pending": {
      icon: <AlertCircle className="w-5 h-5 inline-block mr-2 text-white bg-yellow-500 rounded-full" />,
      text: 'Pendiente de pago',
    },
    "partially_paid": {
      icon: <AlertCircle className="w-5 h-5 inline-block mr-2 text-yellow-500" />,
      text: 'Pago parcial recibido',
    },
    "paid": {
      icon: <CheckCircle className="w-5 h-5 inline-block mr-2 text-green-500" />,
      text: 'Pagado',
    },
    "cancelled": {
      icon: <CircleXIcon className="w-5 h-5 inline-block mr-2 text-white bg-red-500 rounded-full" />,
      text: 'Cancelado',
    },
    "expired": {
      icon: <AlertCircle className="w-5 h-5 inline-block mr-2 text-gray-500" />,
      text: 'Expirado',
    },
    "not_registered": {
      icon: <AlertCircle className="w-5 h-5 inline-block mr-2 text-yellow-500" />,
      text: 'No registrado',
    }
  }
  const statusLabelReg = statusLabels[data.registration.status] || {
    icon: <AlertCircle className="w-5 h-5 inline-block mr-2 text-gray-500" />,
    text: 'Desconocido',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <GoBackButton />

      {error && (
        <div className="my-5 bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="my-5 bg-green-50 text-green-600 p-3 rounded-md text-sm">
          {success}
        </div>
      )}


      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Detalles de Inscripción</h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <CalendarIcon className="w-5 h-5" />
          <span>Registrado el {new Date(data.registration.registration_date).toLocaleDateString()}</span>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              Categoría
            </h2>
            <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
              {data.category}
            </div>
            {/* <p className="text-gray-600">Circuito ID: {data.category.circuit_id}</p> */}
          </section>

          {/* Team */}
          {trainingTeam && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Users2 className="w-6 h-6 text-primary" />
                Equipo de Entrenamiento
              </h2>
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                {trainingTeam.name || "No hay descripción disponible."}
              </div>
              {/* <div>
                <MapPin className="w-5 h-5 inline-block mr-2 text-gray-500" />
                <span className="text-gray-600">{trainingTeam.location || "Ubicación no disponible."}</span>
              </div> */}
            </section>
          )}

          {/* Clothing */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <ShirtIcon className="w-6 h-6 text-primary" />
              {
                data.demanded_clothing?.clothing_type === 'tshirt'
                ? 'Remera'
                : data.demanded_clothing?.clothing_type === 'tanktop'
                  ? 'Musculosa'
                  : 'Indumentaria'
              }
            </h2>
            <div className="space-y-4">
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                <Ruler className="w-5 h-5 inline-block mr-2 text-gray-500" />
                <b>Tu talle</b>: {data.demanded_clothing?.size || 'No seleccionado'}
              </div>
              <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                {data.reserved_clothing ? (
                  <div className='flex justify-start items-center'>
                    <CheckCircle className="w-5 h-5 inline-block mr-2 text-green-500" />
                    <b>Talle Reservado</b>: {data.reserved_clothing.size}
                  </div>
                ) : (
                  <div className='flex justify-start items-center'>
                    <AlertCircle className="w-5 h-5 inline-block mr-2 text-white bg-yellow-500 rounded-full" />
                    {
                      data.registration.reserved_clothing_id === 0 ? (
                        "Declinaste la indumentaria"
                      ) : data.registration.status === "paid" ? (
                        "No se pudo reservar un talle. El organizador ya fue informado y se pondrá en contacto contigo."
                      ) : (
                        <div className='flex flex-col gap-0'>
                          <p>Una vez que completes el pago, se intentará reservar tu talle</p>
                          <p className="inline-block text-sm text-red-500">
                            {(data.demanded_clothing?.remaining_quantity || 0) > 0
                              ? `(Quedan ${data.demanded_clothing?.remaining_quantity} unidades disponibles)`
                              : '(No quedan unidades disponibles)'}
                          </p>
                        </div>
                      )
                    }

                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Chip */}
          {(data.category !== 'General' || data.registration.chip_id !== null) && (<section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Cpu className="w-6 h-6 text-primary" />
              Chip de Cronometraje
            </h2>
            <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
              {data.registration.chip_id
                ? `Tiene asignado el chip con ID: ${data.registration.chip_id}`
                : 'Una vez pagada la inscripción, se te asignará un chip.'}
            </div>
          </section>)}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <SquareChartGanttIcon className="w-6 h-6 text-primary" />
              Dorsal
            </h2>
            <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
              {data.registration.bib_number
                ? `Tiene asignado el número de dorsal con ID: ${data.registration.bib_number}`
                : 'Una vez pagada la inscripción, se te asignará un dorsal.'}
            </div>
          </section>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Payment details */}
          <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Estado</h3>
              <div>
                {statusLabelReg.icon}
                {statusLabelReg.text}
              </div>
            </div>
            {data.registration.status === 'paid' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Inscripción completada el</h3>
                <div>
                  {data.registration.full_payment_date
                    ? new Date(data.registration.full_payment_date).toLocaleDateString()
                    : 'Fecha de pago no disponible'}
                </div>
              </div>
            )}
            {data.registration.status !== 'paid' && (<div>
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
                <div>${data.payment.current_fee_amount}</div>
              </div>
              {data.registration.discount_percentage > 0 && (
                <div className='flex justify-between'>
                  <div>
                    <span className='w-5 h-5 inline-block mr-2'></span>
                    Descuento:
                  </div>
                  <div>-${(data.payment.discount_amount).toFixed(0)}</div>
                </div>
                )}
              <div className='flex justify-between'>
                <div>
                  <span className='w-5 h-5 inline-block mr-2'></span>
                  Pagado:
                </div>
                <div>-${data.payment.paid_amount.toFixed(0)}</div>
              </div>
              <div className='flex justify-between'>
                <div>
                  <span className='w-5 h-5 inline-block mr-2'></span>
                  Saldo:
                </div>
                <div className='border-t-2'>${data.payment.pending_to_pay.toFixed(0)}</div>
              </div>

              {!data.payment.current_fee_is_promotional
                && data.payment.fee_payment_due_date
                && (new Date(data.payment.fee_payment_due_date).getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000 && (
                  <div className='mt-4 text-sm font-bold text-destructive'>
                    Quedan {
                      Math.ceil((new Date(data.payment.fee_payment_due_date).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))
                    } días antes del vencimiento de pago.
                    Completá el pago para evitar que expire tu inscripción y
                    no puedas participar.
                  </div>
              )}

              {data.payment.current_fee_is_promotional
                && data.payment.promotional_fee_payment_due_date
                && (new Date(data.payment.promotional_fee_payment_due_date).getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000 && (
                  <div className='mt-4 text-sm font-bold text-yellow-600'>
                    Quedan {
                      Math.ceil((new Date(data.payment.promotional_fee_payment_due_date).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))
                    } días antes del vencimiento de pago de la promoción.
                    Completá el pago para evitar que se te aplique la tarifa
                    estándar.
                  </div>
              )}

              {data.payment.current_fee_is_promotional && (
                <div className='mt-4 text-sm text-green-600 flex gap-1'>
                  Tarifa promocional aplicada.
                  Válida hasta el {new Date(data.payment.promotional_fee_payment_due_date || '').toLocaleDateString()}.
                  Luego de esa fecha, se aplicará la tarifa estándar de ${data.payment.fee_amount}.
                </div>
              )}
            </div>)}
          </div>
          {data.payment.pending_to_pay > 0 && (
            <div className='text-center bg-white p-6 rounded-xl shadow-sm border space-y-6'>
              <h3 className="font-semibold text-gray-900 mb-2 decoration-2 decoration-dotted decoration-primary underline">Acción requerida</h3>
              <div className='mb-2'>
                Para completar tu inscripción, debés abonar el saldo pendiente.
              </div>
              <Button
                onClick={async () => {
                  const res = await postAuthenticated(`/api/sportingEvents/${eventId}/pay`);
                  if (res.status === 200) {
                    const mpLink = res.body.data.init_point;
                    console.log("response", res);
                    console.log("Redirigiendo a MercadoPago con link:", mpLink);
                    if (mpLink) {
                      // redirect to MP
                      window.location.href = mpLink;
                    } else {
                      alert('No se recibió un link de pago válido. Por favor, intenta nuevamente o contacta al organizador.');
                    }
                  } else {
                    alert(`Error al iniciar el proceso de pago: ${getMessage(res.body?.message, 'Error desconocido')}`);
                  }
                }}
                variant={'outline'}
                className='h-auto py-2 mb-3 cursor-pointer mx-auto
                  flex items-center gap-2
                  bg-sky-50 hover:bg-sky-100
                  border-sky-200 hover:border-sky-300
                  text-sky-900 hover:text-sky-700'
              >
                <MercadoPagoLogo className='size-8' />
                Pagar con Mercado Pago
              </Button>
              <div className='mb-2'>También se aceptan transferencias al siguiente alias (click para copiar)</div>
              <Button
                className='mb-3 cursor-pointer'
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
              <div className='mb-2'>Enviar comprobante de transferencia por WhatsApp</div>
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
            {data.registration.status === 'pending' && (
              <div className='text-center p-6 rounded-xl shadow-sm border border-dotted border-primary/50 bg-primary/10 space-y-6'>
                <div className=''>
                  Si te equivocaste de circuito o te inscribiste por error, podés eliminar tu inscripción.
                </div>
                <DeleteButton
                  btnText="Eliminar"
                  btnIcon={null}
                  dgTitle="¿Estás seguro que querés eliminar tu inscripción?"
                  onConfirm={async () => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 500);
                    const res = await postAuthenticated(
                      `/api/sportingEvents/${eventId}/unregister`,
                      { userId: data.registration.user_id }
                    );
                    if (res.status === 200) {
                      setSuccess('Inscripción eliminada correctamente');
                      setTimeout(() => {
                        setSuccess('');
                        navigate({to: `/sportingEvents/${eventId}`, reloadDocument: true});
                      }, 1500);
                    } else {
                      setError(`Error al eliminar la inscripción: ${getMessage(res.body?.message, 'Error desconocido')}`);
                    }
                  }}
                />
                {/* <div className='text-sm text-gray-600'>
                  Esta opción solo está disponible mientras tu inscripción esté en estado pendiente.
                </div> */}
              </div>
            )}

        </div>
      </div>
    </div>
  )
}
