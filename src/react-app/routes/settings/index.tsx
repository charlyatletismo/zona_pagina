import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { User, Users, UserCog, Mail, Phone, MapPin, Calendar, Edit, Mars, Venus, VenusAndMars } from 'lucide-react'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls'


export const Route = createFileRoute('/settings/')({
  component: RouteComponent,
  beforeLoad: authCheck(),
  loader: async () => {
    const profileApi = await getAuthenticatedThrow('/api/settings');
    const profile: UserProfile = profileApi.data;
    return { profile, status: profileApi.status};
  },
  staleTime: 1000 * 60 * 5,
})


interface UserProfile {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  sex: string;
  date_of_birth: string;
  country: string;
  city: string;
  full_location: string;
  training_team: string;
  manager_id: string;
}

function RouteComponent() {
  const res = Route.useLoaderData();

  if (res.status !== 200) {
    return <div className="text-red-500 p-8 text-center">Error al cargar la información del perfil</div>;
  }

  if (!res.profile) {
    return <div className="p-8 text-center">No se encontró información del perfil</div>;
  }

  const profile = res.profile;

  return (
    <div className="p-4 w-full md:max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Mi Perfil</h2>
          <Link to="/settings/profile">
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </Link>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Nombre Completo</p>
                <p className="font-medium">{profile.name} {profile.surname}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email || 'No especificado'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              {profile.sex === 'M' ? <Mars className="w-5 h-5 text-gray-500 mt-1" /> :
               profile.sex === 'F' ? <Venus className="w-5 h-5 text-gray-500 mt-1" /> :
               <VenusAndMars className="w-5 h-5 text-gray-500 mt-1" />}
              <div>
                <p className="text-sm text-gray-500">Sexo</p>
                <p className="font-medium">{
                  profile.sex === 'M' ? 'Hombre' :
                  profile.sex === 'F' ? 'Mujer' :
                  'No especificado'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                <p className="font-medium">{profile.date_of_birth || 'No especificada'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Ubicación</p>
                <p className="font-medium">
                  {[profile.city, profile.country].filter(Boolean).join(', ') || 'No especificada'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Equipo de Entrenamiento</p>
                <p className="font-medium">{profile.training_team || 'No especificado'}</p>
              </div>
            </div>

            {profile.manager_id && (
              <div className="flex items-start gap-3">
                <UserCog className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">ID del Manager</p>
                  <p className="font-medium">{profile.manager_id || '-'}</p>
                </div>
              </div>)
            }
          </div>
        </div>
      </div>
    </div>
  )
}
