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
import { CalendarIcon } from 'lucide-react';
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

  React.useEffect(() => {
    setResolvedTheme(theme)
  }, [theme]);
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col min-h-screen">
      <div className="relative z-10 flex flex-wrap justify-center sm:justify-between items-center border-b border-dotted border-primary/20 bg-linear-to-r from-primary/10 via-background to-primary/10">
        <div>
          <img 
            src={
              resolvedTheme === 'light'
              ? logo_zona
              : logo_zona_dark
            }
            alt="Zona Atletismo Logo"
            className="max-w-xs h-20 mr-2 py-3 mx-3"
            />
        </div>
        <div className="text-center bg-background rounded-lg p-4">
          <h1 className="text-4xl font-bold mb-2">{eventData.title}</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <CalendarIcon className="w-5 h-5" />
            <span>{new Date(eventData.date).toLocaleDateString()}</span>
          </div>
        </div>
        {eventData.photo_id ? (
            <div className="overflow-hidden">
              <img
                  src={`https://imagedelivery.net/x1piYdlDlmNQ_iTYafCcEQ/${eventData.photo_id}/public`}
                  alt={eventData.title || ''}
                  className="max-w-xs h-30 object-cover"
              />
            </div>
            ) : <div></div>
          }
      </div>
      <div className='mx-auto w-full max-w-4xl p-4'>
        <div className='mx-auto w-fit min-w-sm'>
          <SearchRegistrationForm
            eventId={eventData.id!}
            setData={setData}
            partialUserIdEnabled={false}
            showButtons={false}
            autoReset={true}
            />
        </div>
        {data.length > 0 && (
          <div className="mt-6">
            <div className="flex gap-4 justify-center flex-wrap">
              {data.map((registration) => (
                <div key={registration.id} className="bg-card min-w-sm rounded-xl p-6 shadow-lg border border-primary/20 hover:shadow-xl transition-shadow">
                  <div className="space-y-3">
                    <div className="text-xl font-bold text-primary">{registration.full_name}</div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">Circuito:</span>
                      <span className="text-foreground">{registration.circuit_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">Dorsal:</span>
                      <span className="text-foreground font-mono">{registration.bib_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">Chip:</span>
                      <span className="text-foreground font-mono">{registration.chip_id || 'No asignado'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
