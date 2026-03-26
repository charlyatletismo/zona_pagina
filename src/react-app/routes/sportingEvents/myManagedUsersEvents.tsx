import { createFileRoute } from '@tanstack/react-router';
import { ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE } from '@shared/roles';
import authCheck from '@/lib/authCheck';
import { getAuthenticated } from '@/lib/apiCalls';
import {
  SportingEventBasicInfoSchema
} from '@shared/apiRespTypes';
import z from 'zod';
import { SpBSchema, SportingEventsMinTable } from '@/components/sportingEventsMinTable';


export const Route = createFileRoute('/sportingEvents/myManagedUsersEvents')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE]),
  loader: async () => {
    const res = await getAuthenticated<
      z.infer<typeof SportingEventBasicInfoSchema>[]
      >('/api/sportingEvents/myManagedUsersEvents',
        z.array(SportingEventBasicInfoSchema));
    const now = new Date();
    if (!res.body.data) {
      return { data: [] }
    }
    const data = res.body.data.map(event => {
      let status: string;
      if (event.registration_start && event.registration_end) {
        const start = new Date(event.registration_start);
        const end = new Date(event.registration_end);
        if (now >= start && now <= end) {
          status = "open";
        } else if (now >= end) {
          status = "closed";
        } else {
          status = "comingSoon";
        }
      } else {
        status = "comingSoon";
      }
      return SpBSchema.safeParse({ ...event, status });
    }).filter(e => e.success).map(e => e.data);
    return { data }
  },
  staleTime: 1000 * 60 * 30,
})

function RouteComponent() {
  const { data } = Route.useLoaderData();

  return (
    <SportingEventsMinTable
      data={data}
      title="Eventos de los usuarios gestionados"
    />
  )
}
