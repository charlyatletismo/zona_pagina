import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';


export const Route = createFileRoute('/locations/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
})


function RouteComponent() {
  return <div>Hello "/general/locations/"!</div>
}
