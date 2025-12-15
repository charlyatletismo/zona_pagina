import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';


export const Route = createFileRoute('/runningEvents/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
})

function RouteComponent() {
  return <div>Hello "/runningEvents/"!</div>
}
