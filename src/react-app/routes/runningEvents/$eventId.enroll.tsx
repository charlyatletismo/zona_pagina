import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { RUNNER_ROLE, RUNNERS_MANAGER_ROLE } from '@/lib/roles';


export const Route = createFileRoute('/runningEvents/$eventId/enroll')({
  component: RouteComponent,
  beforeLoad: authCheck([RUNNER_ROLE, RUNNERS_MANAGER_ROLE]),
})


function RouteComponent() {
  return <div>Hello "/runningEvents/$eventId/enroll"!</div>
}
