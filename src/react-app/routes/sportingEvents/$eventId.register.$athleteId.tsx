import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE } from '@shared/roles';


export const Route = createFileRoute(
  '/sportingEvents/$eventId/register/$athleteId',
)({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
})


function RouteComponent() {
  return <div>Hello "/sportingEvents/$eventId/register/$athleteId"!</div>
}
