import { createFileRoute, Link } from '@tanstack/react-router';
import {
  CalendarIcon,
  History,
} from 'lucide-react';
import unprotectedCheck from '@/lib/beforeLoadGenericCheck';
import { getAuthenticated } from '@/lib/apiCalls';
import z from 'zod';
import { ARAllSportingEventSchema } from '@shared/apiRespTypes';
import { SportingEventCard } from '@/components/sportingEventCard';
import { checkUpdates } from '@/lib/checks';


export const Route = createFileRoute('/')({
  component: Index,
  beforeLoad: unprotectedCheck(),
  loader: async () => {
    const res = await getAuthenticated<
      z.infer<typeof ARAllSportingEventSchema>
      >('/api/sportingEvents', ARAllSportingEventSchema);
    await checkUpdates();
    return { res }
  },
  staleTime: 1000 * 60 * 5,
})


function Index() {
  const { res } = Route.useLoaderData();
  const events = res.body.data
  const sections = [
    {
      title: "Inscripciones Abiertas",
      color: "bg-green-500",
      items: events.open,
    },
    {
      title: "Próximamente",
      color: "bg-blue-500",
      items: events.comingSoon,
    },
    {
      title: "Inscripciones Cerradas",
      color: "bg-orange-500",
      items: events.closed,
    },
    {
      title: "Eventos Pasados",
      color: "bg-gray-500",
      items: events.past,
    }
  ];

  return (
    <div>
      <div className="relative py-16 bg-primary/5 mb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-primary rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            {localStorage.getItem('USER_NAME') ? 'Hola,' : 'Eventos'} <span className="text-primary relative inline-block">
              {localStorage.getItem('USER_NAME') ? localStorage.getItem('USER_NAME') : 'Deportivos'}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {localStorage.getItem('USER_ROLE') === 'organizer'
              ? 'Gestiona y crea eventos deportivos para tu organización de manera fácil y eficiente.'
              : localStorage.getItem('USER_ROLE') !== 'admin'
                ? 'Descubre y participa en las mejores carreras y eventos deportivos.'
                : 'Modo administrador activo.'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {sections.map((section) => (
          section.items.length > 0 && (
            <section key={section.title}>
              <h2 className="text-3xl font-bold mb-8 flex items-center">
                <span className={`w-2 h-8 ${section.color} rounded-full mr-3`}></span>
                {section.title}
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {section.items.map((event) => (
                  <Link key={event.id} to="/sportingEvents/$eventId" params={{ eventId: event.id.toString() }} className="block h-full group">
                    <SportingEventCard event={event} />
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}

        {events.open.length === 0 && events.comingSoon.length === 0 && events.closed.length === 0 && events.past.length === 0 && (
          <section className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Próximamente nuevos eventos
              </h2>
              <p className="text-muted-foreground">
                Estamos preparando eventos increíbles para ti. ¡Vuelve pronto!
              </p>
            </div>
          </section>
        )}

        {(events.open.length || events.comingSoon.length || events.closed.length || events.past.length) ? (
          <section className='text-center'>
            <Link to="/sportingEvents/history"
              className='max-w-md mx-auto py-5
                flex gap-2 items-center justify-center
                text-lg font-medium text-muted-foreground shadow-lg
                border border-muted rounded-lg
                hover:animate-tremor transition-all duration-150 group'
            >
              <History className='h-6 w-6 p-1 group-hover:text-white bg-muted group-hover:bg-primary rounded-full' />
              Ver todos los eventos
            </Link>
          </section>
        ) : null}
      </div>
    </div>
  )
}
