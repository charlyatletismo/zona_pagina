import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE, RUNNERS_MANAGER_ROLE } from '@/lib/roles';


export const Route = createFileRoute('/sportingEvents/$eventId/$runnerId')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, RUNNERS_MANAGER_ROLE]),
})


function RouteComponent() {
  return <div>Hello "/sportingEvents/$eventId/$runnerId"!</div>
}
