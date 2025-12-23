import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls'
import { SportingEvent, SportingEventType } from '@/lib/types'
import SportingEventForm from '@/components/sportingEventForm';

export const Route = createFileRoute('/sportingEvents/$eventId/edit')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const spEvApi = await getAuthenticatedThrow(`/api/sportingEvents/${params.eventId}`);
    const ev: SportingEvent = spEvApi.data;
    const spEvType = await getAuthenticatedThrow('/api/sportingEventTypes');
    const evTypes: SportingEventType[] = spEvType.data;
    return { ev, evTypes, statusEv: spEvApi.status, statusEvType: spEvType.status};
  },
  staleTime: 1000 * 60 * 5,
  gcTime: 0 // force reload every time
})

function RouteComponent() {
  const { ev, evTypes, statusEv, statusEvType } = Route.useLoaderData();
  return <SportingEventForm ev={ev} evTypes={evTypes} statusEv={statusEv} statusEvType={statusEvType} />;
}
