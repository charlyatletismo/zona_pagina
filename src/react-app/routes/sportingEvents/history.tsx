import authCheck from '@/lib/authCheck';
import { createFileRoute } from '@tanstack/react-router';


export const Route = createFileRoute('/sportingEvents/history')({
  component: RouteComponent,
  beforeLoad: authCheck(),
})


function RouteComponent() {
  return <div>Hello "/sportingEvents/history"!</div>
}
