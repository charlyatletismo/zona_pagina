import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';


export const Route = createFileRoute('/sportingEvents/$eventId/balance')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
})


function RouteComponent() {
  return <div>Hello "/sportingEvents/$eventId/balance"!</div>
}
