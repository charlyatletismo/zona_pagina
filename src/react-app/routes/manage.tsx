import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import {
  CalendarPlus,
  ClipboardList,
  FileText,
  History,
  // Tag,
  // Download,
  // Upload,
  Users,
  UserCog,
  MapPin,
  MapPinned,
  MapPinPlusIcon,
  Shirt,
  PlusIcon,
  HelpCircle,
  Trophy,
  Dumbbell,
  UserPlus2,
} from 'lucide-react';

export const Route = createFileRoute('/manage')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
})

function RouteComponent() {
  const sections = [
    {
      title: "Eventos Deportivos",
      icon: Trophy,
      items: [
        { to: "/sportingEvents/create", icon: CalendarPlus, label: "Crear Nuevo Evento", description: "Configurar un nuevo evento deportivo." },
        { to: "/sportingEvents/registrations", icon: ClipboardList, label: "Inscripciones", description: "Gestionar inscripciones de usuarios." },
        { to: "/sportingEvents/history", icon: History, label: "Historial de Eventos", description: "Ver todos los eventos deportivos pasados y actuales." },
        { to: "/sportingEvents/reports", icon: FileText, label: "Reportes Financieros", description: "Ver reportes y estados financieros de eventos finalizados en su totalidad." },
        // { to: "/sportingEvents/downloadRufus", icon: Download, label: "Datos para Rufus", description: "Descargar inscripciones consolidadas." },
        // { to: "/sportingEvents/uploadResults", icon: Upload, label: "Subir Resultados", description: "Cargar los resultados del evento finalizado." },
      ]
    },
    {
      title: "Usuarios",
      icon: Users,
      items: [
        { to: "/users", icon: Users, label: "Usuarios", description: "Administrar base de datos de usuarios." },
        { to: "/users/create", icon: UserPlus2, label: "Crear nuevo usuario", description: "Agregar un nuevo usuario al sistema." },
        { to: "/users/managers", icon: UserCog, label: "Managers", description: "Gestionar managers y qué usuarios administran." },
      ]
    },
    {
      title: "Ubicaciones",
      icon: MapPin,
      items: [
        { to: "/locations", icon: MapPin, label: "Ubicaciones", description: "Gestionar lugares y sedes." },
        { to: "/locations/create", icon: MapPinPlusIcon, label: "Crear Ubicación", description: "Agregar una nueva ubicación." },
        { to: "/locations/checkTemporary", icon: MapPinned, label: "Ubicaciones Temporales", description: "Revisar ubicaciones creadas por usuarios." },
      ]
    },
    {
      title: "Equipos de Entrenamiento",
      icon: Dumbbell,
      items: [
        { to: "/trainingTeams", icon: Shirt, label: "Equipos", description: "Gestionar equipos de entrenamiento." },
        { to: "/trainingTeams/create", icon: PlusIcon, label: "Crear Equipo", description: "Agregar un nuevo equipo de entrenamiento." },
        { to: "/trainingTeams/checkTemporary", icon: HelpCircle, label: "Equipos Temporales", description: "Revisar equipos creados por usuarios." },
      ]
    }
  ];

  return (
    <div className="pb-20">
      {/* Header Section */}
      <div className="relative py-16 bg-primary/5 mb-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-primary rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-6">
            Herramientas de <span className="text-primary relative inline-block">
              Gestión
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Panel de control centralizado para la administración de eventos, usuarios y recursos.
          </p>
        </div>
      </div>

      {/* Grid Sections */}
      <div className="container mx-auto px-4 max-w-7xl">
        {sections.map((section) => (
          <div key={section.title} className="mb-12 last:mb-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <section.icon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{section.title}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {section.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group hover:animate-tremor relative bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 flex flex-col h-full"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="p-2.5 rounded-lg bg-gray-50 text-gray-500 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-gray-900">
                      {item.label}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 leading-relaxed pl-13">
                    {item.description}
                  </p>

                  <div className="absolute top-4 right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-primary/40">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
