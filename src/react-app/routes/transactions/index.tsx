import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
// import { getAuthenticatedThrow } from '@/lib/apiCalls';

export const Route = createFileRoute('/transactions/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {

    return {};
  },
})

function RouteComponent() {
  return <div>Hello "/transactions/"!</div>
}
