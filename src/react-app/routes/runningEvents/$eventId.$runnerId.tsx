import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE, RUNNERS_MANAGER_ROLE } from '@/lib/roles';


export const Route = createFileRoute('/runningEvents/$eventId/$runnerId')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, RUNNERS_MANAGER_ROLE]),
})


function RouteComponent() {
  return <div>Hello "/runningEvents/$eventId/$runnerId"!</div>
}
