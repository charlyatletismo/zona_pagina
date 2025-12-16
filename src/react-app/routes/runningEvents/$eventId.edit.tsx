import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';


export const Route = createFileRoute('/runningEvents/$eventId/edit')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
})


function RouteComponent() {
  console.log("Hello from /runningEvents/$eventId/edit route");
  return <div>Hello "/runningEvents/$eventId/edit"!</div>
}
