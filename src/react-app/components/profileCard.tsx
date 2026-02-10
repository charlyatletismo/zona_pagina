import z from 'zod';
import { ARUserSchema } from '@shared/apiRespTypes';
import {
  User,
  Users,
  UserCog,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Mars,
  Venus,
  VenusAndMars,
  AccessibilityIcon,
  ShirtIcon,
  PercentIcon,
  AmbulanceIcon,
  IdCardIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getNonOrgManagersData, updateTrainingTeamsData } from '@/lib/queryCache';



const GridCell = ({
  icon: Icon,
  label,
  value,
  link,
} : {
  icon: React.ComponentType<{ className?: string }>,
  label: string,
  value: string | null | undefined,
  link?: string | null,
}) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-gray-500 mt-1" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      {
        link
        ? <a href={link} className='text-md underline text-primary/70 hover:text-primary' target='_blank'>{value || 'No especificado'}</a>
        : <p className="text-md">{value || 'No especificado'}</p>
      }
    </div>
  </div>
);


export const ProfileCard = ({
  profile,
} : {
  profile: z.infer<typeof ARUserSchema>,
}) => {

  const [trainingTeams, setTrainingTeams] = useState(profile.training_team_id ? [{
    id: profile.training_team_id,
    name: 'Cargando...'
  }] : []);
  const [manager, setManager] = useState<{id: string, name: string, surname: string} | null>( profile.manager_id ? {
    "id": profile.manager_id,
    "name": 'Cargando...',
    "surname": '',
  } : null);

  useEffect(() => {
    async function fetchData() {
      if (profile.manager_id) {
        const managers = await getNonOrgManagersData(profile.manager_id);
        const found = managers.find(manager => manager.id === profile.manager_id)
        if (found) {
          setManager(found);
        } else {
          setManager({
            "id": profile.manager_id,
            "name": 'Manager no encontrado',
            "surname": '',
          })
        }
      }
      await updateTrainingTeamsData(setTrainingTeams);
    }
    fetchData();
  }, []);


  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <GridCell
        icon={IdCardIcon}
        label="DNI"
        value={profile.id}
      />

      <GridCell
        icon={User}
        label="Nombre Completo"
        value={`${profile.name || ''} ${profile.surname || ''}`.trim()}
      />

      <GridCell
        icon={Mail}
        label="Email"
        value={profile.email}
        link={
          profile.email
          ? "mailto:" + profile.email
          : null
        }
      />

      <GridCell
        icon={Phone}
        label="Celular"
        value={
          profile.phone
          ? "+" + profile.phone.split("_").join(" ")
          : null
        }
        link={
          profile.phone
          ? `https://wa.me/${profile.phone.split("_").join("")}`
          : null
        }
      />

      <GridCell
        icon={
          profile.sex === 'M'
          ? Mars
          : profile.sex === 'F'
            ? Venus
            : VenusAndMars
        }
        label='Sexo'
        value={
          profile.sex === 'M'
          ? 'Hombre'
          : profile.sex === 'F'
            ? 'Mujer'
            : null
        }
      />

      <GridCell
        icon={Calendar}
        label="Fecha de Nacimiento"
        value={profile.date_of_birth?.toISOString().split('T')[0]}
      />

      <GridCell
        icon={MapPin}
        label="Dirección"
        value={profile.location_address + ", " + profile.location}
        link={
          (profile.location_address && profile.location)
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.location_address + ", " + profile.location)}`
            : null
        }
      />

      <GridCell
        icon={ShirtIcon}
        label="Talla de Prenda"
        value={profile.clothing_shirt_size}
      />

      <GridCell
        icon={AmbulanceIcon}
        label="Contacto de Emergencia (nombre)"
        value={profile.emergency_contact_name}
      />

      <GridCell
        icon={Phone}
        label="Contacto de Emergencia (teléfono)"
        value={
          profile.emergency_contact_phone
          ? "+" + profile.emergency_contact_phone.split("_").join(" ")
          : null
        }
        link={
          profile.emergency_contact_phone
          ? `https://wa.me/${profile.emergency_contact_phone.split("_").join("")}`
          : null
        }
      />

      <GridCell
        icon={Users}
        label="Equipo de Entrenamiento"
        value={trainingTeams.find(team => team.id === profile.training_team_id)?.name}
      />

      {manager && (
        <GridCell
          icon={UserCog}
          label="Manager"
          value={`${manager.name || ''} ${manager.surname || ''}`.trim()}
          link={`/users/${manager.id}`}
        />
      )}

      {profile.special_needs && (
        <GridCell
          icon={AccessibilityIcon}
          label="Necesidades Especiales"
          value={profile.special_needs}
        />
      )}

      {profile.discount_percentage > 0 && (
        <GridCell
          icon={PercentIcon}
          label="Descuento Aplicado"
          value={`${profile.discount_percentage}%`}
        />
      )}
    </div>
  )
};
