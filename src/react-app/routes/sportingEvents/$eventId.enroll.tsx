import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { RUNNER_ROLE, RUNNERS_MANAGER_ROLE } from '@/lib/roles';


export const Route = createFileRoute('/sportingEvents/$eventId/enroll')({
  component: RouteComponent,
  beforeLoad: authCheck([RUNNER_ROLE, RUNNERS_MANAGER_ROLE]),
})


function RouteComponent() {
  return <div>Hello "/sportingEvents/$eventId/enroll"!</div>
}
