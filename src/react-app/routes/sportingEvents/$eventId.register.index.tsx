import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls';
import { SportingEventSchema, SportingEventRegistration } from '@shared/types';


export const Route = createFileRoute('/sportingEvents/$eventId/register/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
  loader: async ({ params }) => {
    const resRegManaged = await getAuthenticatedThrow(`/api/sportingEvents/${params.eventId}/managedRegistrations`);
    const resUsersManaged = await getAuthenticatedThrow('/api/users');
    let resReg = null;
    if (localStorage.getItem('USER_ROLE') !== ATHLETES_MANAGER_ROLE) {
      resReg = await getAuthenticatedThrow<SportingEventRegistration[]>(`/api/sportingEvents/${params.eventId}/allRegistrations`);
    }

    return { resRegManaged, resUsersManaged, resReg };
  },
  staleTime: 1000 * 60 * 5,
})


function RouteComponent() {
  const { resReg, resRegManaged, resUsersManaged } = Route.useLoaderData();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestión de inscripciones de atletas</h1>
      {JSON.stringify(resReg)}
      <br />
      {JSON.stringify(resRegManaged)}
      <br />
      {JSON.stringify(resUsersManaged)}
      <br />
    </div>
  )
}
