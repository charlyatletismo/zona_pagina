import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { UserProfile } from '@/lib/types';
import { ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE } from '@/lib/roles';


export const Route = createFileRoute('/users/$userId/edit')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
  loader: async ({ params }) => {
    console.log('Loading edit route for userId:', params.userId);
    const profileApi = await getAuthenticatedThrow(`/api/users/${params.userId}`);
    const profile: UserProfile = profileApi.data;
    return { profile, status: profileApi.status};
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  return <div>Hello "/users/$userId/edit"!</div>
}
