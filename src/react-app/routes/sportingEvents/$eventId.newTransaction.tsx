import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import {
  SpEvTransactionGeneralForm
} from '@/components/spEvTransactionGeneralForm';
import { FormBox } from '@/components/formBox';


export const Route = createFileRoute('/sportingEvents/$eventId/newTransaction')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  // loader: async ({ params }) => {
    
  // },
  // staleTime: 1000 * 60 * 5,
  // gcTime: 0 // force reload every time
})


function RouteComponent() {
  const { eventId } = Route.useParams();
  return (
    <FormBox
      title="Nueva Transacción del Evento Deportivo"
      description="Crea una nueva transacción asociada al evento deportivo."
      returnText="Volver al Evento"
      returnPath="/sportingEvents/$eventId"
      returnParams={{ eventId: eventId }}
    >
      <SpEvTransactionGeneralForm
        eventId={Number(eventId)}
      />
    </FormBox>
  )
}
