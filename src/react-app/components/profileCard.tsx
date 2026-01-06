import { User, Users, UserCog, Mail, Phone, MapPin, Calendar, Mars, Venus, VenusAndMars } from 'lucide-react'
import { UserProfile } from '@shared/types'


export const Profile = ({ profile }: { profile: UserProfile }) => {
  return (
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
  )
};
