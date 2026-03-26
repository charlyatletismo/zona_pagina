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
import { TEMPORARY_LOCATION_ID } from '@shared/types';



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
    <Icon className="w-5 h-5 text-muted-foreground mt-1" />
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {
        link
        ? <a href={link} className='text-md underline text-primary hover:text-primary' target='_blank'>{value || 'No especificado'}</a>
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
  let location_full = null;
  if (profile.location_address && profile.location) {
    location_full = profile.location_address + ", " + (
      profile.location === TEMPORARY_LOCATION_ID
        ? profile.location_temp
        : profile.location);
  }

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
        value={`${profile.surname || ''} ${profile.name || ''}`.trim()}
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
        value={location_full}
        link={
          location_full
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location_full)}`
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
        value={
          profile.training_team_id
            ? trainingTeams.find(team => team.id === profile.training_team_id)?.name
            : profile.training_team_temp 
              ? profile.training_team_temp + " (en evaluación)"
              : null
        }
      />

      {manager && (
        <GridCell
          icon={UserCog}
          label="Manager"
          value={`${manager.surname || ''} ${manager.name || ''}`.trim()}
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

      {profile.discount_percentage !== undefined && (profile.discount_percentage > 0) && (
        <GridCell
          icon={PercentIcon}
          label="Descuento Aplicado"
          value={`${profile.discount_percentage}%`}
        />
      )}
    </div>
  )
};
