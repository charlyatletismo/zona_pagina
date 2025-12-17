import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ATHLETES_MANAGER_ROLE, ATHLETE_ROLE } from '@/lib/roles';

export const Route = createFileRoute('/athlete/stats')({
  component: RouteComponent,
  beforeLoad: authCheck([ATHLETES_MANAGER_ROLE, ATHLETE_ROLE]),
})

function RouteComponent() {
  return <div>Hello "/stats"!</div>
}
