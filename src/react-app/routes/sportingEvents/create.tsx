import { createFileRoute } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import SportingEventForm from '@/components/sportingEventForm';
import { getAuthenticated } from '@/lib/apiCalls'
import { SportingEventType } from '@/lib/types'


export const Route = createFileRoute('/sportingEvents/create')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const spEvType = await getAuthenticated('/api/sportingEventTypes');
    const evTypes: SportingEventType[] = spEvType.data;
    return { evTypes, statusEvType: spEvType.status};
  },
})


function RouteComponent() {
  const { evTypes, statusEvType } = Route.useLoaderData();
  return <SportingEventForm ev={null} evTypes={evTypes} statusEv={200} statusEvType={statusEvType} />
}
