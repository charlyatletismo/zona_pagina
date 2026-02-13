import { createFileRoute, Link } from '@tanstack/react-router';
import { ORGANIZER_ROLE } from '@shared/roles';
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { Button } from '@/components/ui/button';
import { ArrowLeft, EditIcon, Mail, MapPin, PersonStanding, Phone } from 'lucide-react';
import { getMessage } from '@/lib/utils';
import { TrainingTeamSchema } from '@shared/types';
import { ARTrainingTeamAllSchema } from '@shared/apiRespTypes';
import z from 'zod';


export const Route = createFileRoute('/trainingTeams/$trainingTeamId/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const { trainingTeamId } = params;
    const res = await getAuthenticatedThrow<
      z.infer<typeof ARTrainingTeamAllSchema>
      >(`/api/trainingTeams/${trainingTeamId}`,
        ARTrainingTeamAllSchema);
    return { res };
  },
})


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


const TrainingTeamCard = ({ data }: { data: z.infer<typeof TrainingTeamSchema> }) => {
  return (
    <div className="rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{data.name}</h1>
        <Link to="/trainingTeams/$trainingTeamId/edit" params={{ trainingTeamId: data.id!.toString() }}>
          <Button variant="outline" className="flex items-center gap-2">
            <EditIcon className="w-4 h-4" />
            Editar
          </Button>
        </Link>
      </div>

    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <GridCell
        icon={MapPin}
        label="Ubicación"
        value={data.location}
      />

      <GridCell
        icon={PersonStanding}
        label="Entrenador"
        value={data.coach_name}
        link={data.coach_user_id ? `/users/${data.coach_user_id}` : null}
      />

      <GridCell
        icon={Mail}
        label="Correo electrónico"
        value={data.contact_email}
        link={data.contact_email ? `mailto:${data.contact_email}` : null}
      />

      <GridCell
        icon={Phone}
        label="Teléfono"
        value={data.contact_phone}
        link={data.contact_phone ? `tel:${data.contact_phone}` : null}
      />

      <GridCell
        icon={Phone}
        label="Fecha de creación"
        value={data.created_at?.toLocaleString()}
      />

      <GridCell
        icon={Phone}
        label="Fecha de últ. actualización"
        value={data.updated_at?.toLocaleString()}
      />
    </div>
  </div>
  )
}


function RouteComponent() {
  const { res } = Route.useLoaderData();

  return (
    <div className="p-4 w-full md:max-w-4xl mx-auto">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary cursor-pointer"
        onClick={() => window.history.back()}
        asChild
      >
        <div>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver atrás
        </div>
      </Button>
      {res.status === 200
        ? <TrainingTeamCard data={res.body.data} />
        : <div className="p-6 bg-red-100 text-red-700 rounded">
            Error al cargar los detalles del equipo de entrenamiento.{" "}
            {getMessage(res.body.message, "Error desconocido.")}
          </div>
      }
    </div>
  )
}
