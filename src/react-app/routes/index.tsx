import { createFileRoute, Link } from '@tanstack/react-router'
import { CalendarIcon, MapPinIcon } from 'lucide-react'
import unprotectedCheck from '@/lib/beforeLoadGenericCheck'


export const Route = createFileRoute('/')({
  component: Index,
  beforeLoad: unprotectedCheck(),
  loader: () => fetch('/api/runningEvents', { cache: 'no-store' }).then((res) => res.json() as Promise<{
    comingSoon: any[];
    open: any[];
    closed: any[];
    past: any[];
  }>),
  staleTime: 1000 * 60 * 5,
})


function Index() {
  const events = Route.useLoaderData();

  return (
    <div>
      <div className="relative py-16 bg-primary/5 mb-12 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6">
            {localStorage.getItem('USER_NAME') ? 'Hola,' : 'Eventos'} <span className="text-primary relative inline-block">
              {localStorage.getItem('USER_NAME') ? localStorage.getItem('USER_NAME') : 'Deportivos'}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Descubre y participa en las mejores carreras y eventos deportivos.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16 space-y-16">
        {events.open.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="w-2 h-8 bg-green-500 rounded-full mr-3"></span>
              Inscripciones Abiertas
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {events.open.map(event => (
                <Link key={event.id} to="/runningEvents/$eventId" params={{ eventId: event.id.toString() }} className="block h-full group">
                  <EventCard event={event} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {events.comingSoon.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
              Próximamente
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {events.comingSoon.map(event => (
                <Link key={event.id} to="/runningEvents/$eventId" params={{ eventId: event.id.toString() }} className="block h-full group">
                  <EventCard event={event} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {events.closed.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="w-2 h-8 bg-orange-500 rounded-full mr-3"></span>
              Inscripciones Cerradas
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {events.closed.map(event => (
                <Link key={event.id} to="/runningEvents/$eventId" params={{ eventId: event.id.toString() }} className="block h-full group">
                  <EventCard event={event} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {events.past.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <span className="w-2 h-8 bg-gray-500 rounded-full mr-3"></span>
              Eventos Pasados
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {events.past.map(event => (
                <Link key={event.id} to="/runningEvents/$eventId" params={{ eventId: event.id.toString() }} className="block h-full group">
                  <EventCard event={event} />
                </Link>
              ))}
            </div>
          </section>
        )}

        {events.open.length === 0 && events.comingSoon.length === 0 && events.closed.length === 0 && events.past.length === 0 && (
          <section className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Próximamente nuevos eventos
              </h2>
              <p className="text-gray-600">
                Estamos preparando eventos increíbles para ti. ¡Vuelve pronto!
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function EventCard({ event }: { event: any }) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 border border-gray-200 group-hover:shadow-lg transition-all duration-300 flex flex-col h-full group-hover:-translate-y-1'>
      <div className='flex items-start mb-4'>
        <div className="bg-primary/10 p-3 rounded-lg mr-4 group-hover:bg-primary/20 transition-colors">
          <CalendarIcon className='h-6 w-6 text-primary' />
        </div>
        <div>
          <h3 className='text-xl font-bold text-gray-900 leading-tight mb-1 group-hover:text-primary transition-colors'>{event.title}</h3>
          <p className="text-sm font-medium text-primary">
            {new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      
      <p className='text-gray-600 mb-6 grow line-clamp-3'>{event.description}</p>
      
      <div className="pt-4 border-t border-gray-100 mt-auto">
        {event.location_text && (
          <div className="flex items-center text-gray-500 text-sm">
            <MapPinIcon className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">{event.location_text}</span>
          </div>
        )}
      </div>
    </div>
  )
}
