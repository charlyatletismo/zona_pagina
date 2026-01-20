import { createFileRoute, Link } from '@tanstack/react-router';
import {
  CalendarIcon,
  MapPinIcon,
  CalendarPlus,
  FileUserIcon,
  UsersRoundIcon,
  UserCog2,
  UserCircle2,
} from 'lucide-react';
import unprotectedCheck from '@/lib/beforeLoadGenericCheck';
import { getAuthenticated } from '@/lib/apiCalls';
import z from 'zod';
import {
  SportingEventBasicInfoSchema,
  ARAllSportingEventSchema
} from '@shared/apiRespTypes';
import { Button } from '@/components/ui/button';


export const Route = createFileRoute('/')({
  component: Index,
  beforeLoad: unprotectedCheck(),
  loader: async () => {
    const res = await getAuthenticated<
      z.infer<typeof ARAllSportingEventSchema>
      >('/api/sportingEvents', ARAllSportingEventSchema);
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
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6">
            {localStorage.getItem('USER_NAME') ? 'Hola,' : 'Eventos'} <span className="text-primary relative inline-block">
              {localStorage.getItem('USER_NAME') ? localStorage.getItem('USER_NAME') : 'Deportivos'}
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {localStorage.getItem('USER_ROLE') === 'organizer'
              ? 'Gestiona y crea eventos deportivos para tu organización de manera fácil y eficiente.'
              : localStorage.getItem('USER_ROLE') !== 'admin'
                ? 'Descubre y participa en las mejores carreras y eventos deportivos.'
                : 'Modo administrador activo.'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16 space-y-16">
        {localStorage.getItem('USER_ROLE') === 'organizer' && (
          <div className="flex flex-wrap gap-2 mb-8 w-full border-b-2 pb-5">
            {/* <div className='my-auto relative p-px rounded-lg overflow-hidden'>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-full h-[500%] bg-radial-[at_15%_75%] from-pink-500 via-blue-400 to-indigo-900 to-75% animate-[spin_3s_linear_infinite]" />
              <div className='bg-primary/50 text-white px-3 py-1 rounded-[7px] text-sm font-medium relative z-10'>
                Modo organizador
              </div>
            </div> */}
            <div className='my-auto px-3 py-1 bg-gray-600 rounded-lg text-sm text-white animate-badge-color-cycle repeat-1'>
              Atajos
            </div>
            <Button variant="outline">
              <CalendarPlus className="w-4 h-4" />
              <Link
                to="/sportingEvents/create"
              >
                Nuevo Evento Deportivo
              </Link>
            </Button>
            <Button variant="outline">
              <FileUserIcon className="w-4 h-4" />
              <Link
                to="/sportingEvents/registrations"
              >
                Inscripciones
              </Link>
            </Button>
            <Button variant="outline">
              <MapPinIcon className="w-4 h-4" />
              <Link
                to="/locations"
              >
                Ubicaciones
              </Link>
            </Button>
            <Button variant="outline">
              <UsersRoundIcon className="w-4 h-4" />
              <Link
                to="/trainingTeams"
              >
                Equipos de Entrenamiento
              </Link>
            </Button>
            <Button variant="outline">
              <UserCog2 className="w-4 h-4" />
              <Link
                to="/users/managers"
              >
                Managers
              </Link>
            </Button>
            <Button variant="outline">
              <UserCircle2 className="w-4 h-4" />
              <Link
                to="/users"
              >
                Usuarios
              </Link>
            </Button>
          </div>
        )}

        {sections.map((section) => (
          section.items.length > 0 && (
            <section key={section.title}>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <span className={`w-2 h-8 ${section.color} rounded-full mr-3`}></span>
                {section.title}
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {section.items.map((event) => (
                  <Link key={event.id} to="/sportingEvents/$eventId" params={{ eventId: event.id.toString() }} className="block h-full group">
                    <EventCard event={event} />
                  </Link>
                ))}
              </div>
            </section>
          ))
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

function EventCard({ event }: { event: z.infer<typeof SportingEventBasicInfoSchema> }) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 flex flex-col h-full group-hover:animate-tremor'>
      <div className='flex gap-4 items-start mb-4'>
        <div className="p-2.5 rounded-lg bg-primary/10 text-gray-500 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
          <CalendarIcon className='h-6 w-6' />
        </div>
        <div>
          <h3 className='text-xl font-bold text-gray-900 leading-tight mb-1'>{event.title}</h3>
          <p className="text-sm font-medium text-primary">
            {event.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <p className='text-gray-600 mb-6 grow line-clamp-3'>{event.description}</p>

      <div className="pt-4 border-t border-gray-100 mt-auto">
      {event.location && (
        <div className="flex items-center text-gray-500 text-sm">
          <MapPinIcon className="h-4 w-4 mr-2 shrink-0" />
          <span className="truncate">
            {event.location_address
              ? event.location_address + " "
              : ""}{event.location}</span>
        </div>
      )}
      </div>
    </div>
  )
}
