import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import {
  getAuthenticatedThrow,
} from '@/lib/apiCalls';
import {
  ARSportingEventSchema,
  ARSportingEventRegistrationMinSchema,
} from '@shared/apiRespTypes';
import z from 'zod';
import { CalendarIcon, CircleCheckBig, Cpu, Medal, Mountain, Users } from 'lucide-react';
import { Instagram } from '@/components/icons/instagram';
import { Facebook } from '@/components/icons/facebook';
import { SearchRegistrationForm } from '@/components/searchRegistrationForm';
import React from 'react';
import logo_zona from "@/assets/logo.png";
import logo_zona_dark from "@/assets/logo_dark.png";
import { useTheme } from '@/components/themeProvider';


export const Route = createFileRoute('/sportingEvents/$eventId/showRegistrations')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const res = await getAuthenticatedThrow<
      z.infer<typeof ARSportingEventSchema
      >>(`/api/sportingEvents/${params.eventId}`, ARSportingEventSchema);
    return { eventData: res.body.data };
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  const { eventData } = Route.useLoaderData();
  const [data, setData] = React.useState<z.infer<typeof ARSportingEventRegistrationMinSchema>[]>([]);
  const { theme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = React.useState(theme);
  const eventDate = new Date(eventData.date).toLocaleDateString();
  const eventPhoto = eventData.photo_id
    ? `https://imagedelivery.net/x1piYdlDlmNQ_iTYafCcEQ/${eventData.photo_id}/public`
    : undefined;

  React.useEffect(() => {
    setResolvedTheme(theme)
  }, [theme]);

  return (
    <div className="fixed inset-0 z-50 min-h-screen overflow-auto bg-background">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[41%_59%]">
        <div className="relative min-h-[38vh] overflow-hidden lg:min-h-screen">
          {eventPhoto ? (
            <img
              src={eventPhoto}
              alt={eventData.title || ''}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-orange-200 via-amber-100 to-zinc-300" />
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-white/0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.2),transparent_40%),radial-gradient(circle_at_75%_85%,rgba(255,145,77,0.2),transparent_45%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-8 lg:p-9">
            <div className="flex items-start justify-between gap-4">
              <img
                src={resolvedTheme === 'light' ? logo_zona : logo_zona_dark}
                alt="Zona Atletismo Logo"
                className="h-25 w-auto px-4 py-2"
              />
            </div>

            <div className="space-y-4 text-white">
              <h1 className="max-w-xl text-4xl font-black uppercase leading-[0.9] tracking-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.5)] sm:text-6xl lg:text-7xl xl:text-8xl">
                {eventData.title}
              </h1>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-black/45 px-4 py-2 text-base font-semibold shadow-md backdrop-blur-sm">
                <CalendarIcon className="h-5 w-5" />
                <span>{eventDate}</span>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/55 to-transparent" />
        </div>

        <div className="relative flex flex-col">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-8 lg:px-10 xl:px-12">
            <div className="py-2 text-center mt-4">
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <span className="h-1 w-10 rounded-full bg-orange-400 sm:w-16" />
                <h2 className="text-base font-black tracking-wide text-foreground sm:text-2xl">
                  INGRESÁ TU NÚMERO DE DORSAL
                </h2>
                <span className="h-1 w-10 rounded-full bg-orange-400 sm:w-16" />
              </div>
            </div>

            <div className="mb-6">
              <SearchRegistrationForm
                eventId={eventData.id!}
                setData={setData}
                partialUserIdEnabled={false}
                showButtons={false}
                autoReset={true}
                showLabels={false}
                showSearchButton={true}
              />
            </div>

            <div className="flex-1 space-y-5 overflow-auto pb-4">
              {data.map((registration) => (
                <div
                  key={registration.id}
                  className="rounded-3xl border border-neutral-200 p-5 shadow-[0_24px_45px_-24px_rgba(0,0,0,0.35)] sm:p-7"
                >
                  <div className="mb-4 flex items-center gap-2 text-emerald-600">
                    <CircleCheckBig className="h-7 w-7" />
                    <span className="text-lg font-extrabold uppercase tracking-wide">Corredor encontrado</span>
                  </div>

                  <div className="mb-5 text-3xl font-black uppercase italic leading-[0.95] tracking-tight text-accent-foreground sm:text-6xl">
                    {registration.full_name}
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[44%_56%]">
                    <div className="rounded-2xl border border-neutral-200 p-5">
                      <div className="text-center text-sm font-extrabold uppercase tracking-[0.22em] text-orange-500">
                        Dorsal
                      </div>
                      <div className="mt-1 bg-linear-to-b from-orange-400 to-orange-600 bg-clip-text text-center text-8xl font-black leading-none text-transparent sm:text-9xl">
                        {registration.bib_number ?? '-'}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3 border-b border-neutral-200 pb-3">
                        <Medal className="mt-0.5 h-6 w-6 text-orange-500" />
                        <div>
                          <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Circuito</div>
                          <div className="text-2xl font-extrabold">{registration.circuit_name}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 border-b border-neutral-200 pb-3">
                        <Users className="mt-0.5 h-6 w-6 text-orange-500" />
                        <div>
                          <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Categoría</div>
                          <div className="text-2xl font-extrabold">{registration.category}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Cpu className="mt-0.5 h-6 w-6 text-orange-500" />
                        <div>
                          <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Chip</div>
                          <div className="flex items-center gap-2 text-2xl font-extrabold">
                            <span className={registration.chip_id ? 'text-emerald-600' : 'text-muted-foreground'}>
                              {registration.chip_id ? 'Asignado' : 'No asignado'}
                            </span>
                            {registration.chip_id && <CircleCheckBig className="h-6 w-6 text-emerald-600" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {data.length === 0 && (
                <div className="rounded-2xl border border-dashed border-orange-300/80 p-8 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Esperando busqueda de corredor
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-gray-800 px-4 py-3 text-sm font-semibold text-white sm:px-5 w-full">
            <div className="flex items-center gap-2 uppercase tracking-wide text-emerald-100">
              <Mountain className="h-4 w-4" />
              <span>Corré. Disfrutá. Superá tus límites.</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <span className="inline-flex items-center gap-1"><Facebook className="h-4 w-4" />/zona.atletismo</span>
              <span className="inline-flex items-center gap-1"><Instagram className="h-4 w-4" />@zona.atletismo</span>
              <span className="text-orange-300">#{eventData.title.replace(/\s+/g, '')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
