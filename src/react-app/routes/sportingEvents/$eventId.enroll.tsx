import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ATHLETE_ROLE, ATHLETES_MANAGER_ROLE } from '@/lib/roles';


export const Route = createFileRoute('/sportingEvents/$eventId/enroll')({
  component: RouteComponent,
  beforeLoad: authCheck([ATHLETE_ROLE, ATHLETES_MANAGER_ROLE]),
})


function RouteComponent() {
  return <div>Hello "/sportingEvents/$eventId/enroll"!</div>
}
