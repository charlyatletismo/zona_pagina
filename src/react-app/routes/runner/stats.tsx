import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { RUNNERS_MANAGER_ROLE, RUNNER_ROLE } from '@/lib/roles';

export const Route = createFileRoute('/runner/stats')({
  component: RouteComponent,
  beforeLoad: authCheck([RUNNERS_MANAGER_ROLE, RUNNER_ROLE]),
})

function RouteComponent() {
  return <div>Hello "/stats"!</div>
}
