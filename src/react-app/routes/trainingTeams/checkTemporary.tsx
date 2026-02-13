import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';


export const Route = createFileRoute('/trainingTeams/checkTemporary')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    
    return {  };
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  return <div>Hello "/trainingTeams/checkTemporary"!</div>
}
