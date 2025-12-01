import { createFileRoute, Link } from '@tanstack/react-router'
import { AlarmClockIcon, CameraIcon, PenToolIcon, Car, Accessibility, ChartArea, BikeIcon, BadgeCheckIcon } from 'lucide-react'
import { CardGrid } from '../components/cardGrid'

export const Route = createFileRoute('/services')({
  component: RouteComponent,
})


function RouteComponent() {
  return <div>
    <div className="relative py-16 bg-primary/5 mb-12 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6">
          Nuestros <span className="text-primary relative inline-block">
            Servicios
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
            </svg>
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Soluciones profesionales para la organización y gestión de eventos deportivos.
        </p>
      </div>
    </div>
    <div className='grid gap-2 justify-center'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl lg:max-w-7xl mx-auto px-4'>
        <CardGrid
          icon={<AlarmClockIcon />}
          title="Cronometraje"
          description="Medimos de manera precisa el tiempo de cada corredor en cada carrera con chips electrónicos."
        />

        <CardGrid
          icon={<ChartArea />}
          title="Estadísticas"
          description="Cada corredor puede acceder a sus estadísticas personales y evaluar su rendimiento."
        />

        <CardGrid
          icon={<CameraIcon />}
          title="Cobertura y difusión"
          description="Documentación fotográfica y videográfica profesional de eventos deportivos para redes sociales y medios."
        />

        <CardGrid
          icon={<Car />}
          title="Logística y apoyo"
          description="Coordinamos aspectos logísticos como señalización, puntos de hidratación y seguridad para garantizar el éxito del evento."
        />

        <CardGrid
          icon={<PenToolIcon />}
          title="Diseño e imagen"
          description="Creamos materiales visuales atractivos como carteles, camisetas y medallas personalizadas."
        />

        <CardGrid
          icon={<Accessibility />}
          title="Inclusión y accesibilidad"
          description="Nos aseguramos de que todos los participantes, independientemente de sus capacidades, puedan disfrutar del evento."
        />

        <CardGrid
          icon={<BikeIcon />}
          title="Eventos multideportivos"
          description="Organizamos y gestionamos eventos que combinan varias disciplinas deportivas, como los duatlones."
        />

        <CardGrid
          icon={<BadgeCheckIcon />}
          title="Infraestructura y equipamiento"
          description="Proveemos y gestionamos el equipamiento necesario, como sistemas de cronometraje y relojes, carpas y señalización."
        />

      </div>
    </div>

    <div className='flex justify-center my-12'>
      <div className="relative inline-flex group">
        <Link to="/services">
          <div className="bg-white text-gray-900 group-hover:text-primary rounded-lg shadow-md border border-gray-200 group-hover:shadow-lg group-hover:border-primary transition-all duration-300 px-16 py-4 text-xl font-bold text-center">
            Solicitar presupuesto
          </div>
        </Link>
        <div className="absolute top-0 right-0 -mt-1 -mr-1 flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex size-3 rounded-full bg-primary"></span>
        </div>
      </div>
    </div>
  </div>
}
