import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE } from '@/lib/roles';


export const Route = createFileRoute('/users/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE ]),
})


function RouteComponent() {
  return <div>Hello "/users/add"!</div>
}
