import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticated } from '@/lib/apiCalls';
import { SportingEventSchema } from '@shared/types';
import {
  ARAllSportingEventSchema
} from '@shared/apiRespTypes';
import z from 'zod';
import { SportingEventsMinTable } from '@/components/sportingEventsMinTable';


const SpBSchema = SportingEventSchema.pick({
  id: true,
  title: true,
  description: true,
  date: true,
  fee_amount: true,
  // fee_amount_promotional: true,
  registration_start: true,
  registration_end: true,
  location: true,
  location_address: true,
}).required({
  id: true,
}).extend({
  status: z.string(),
})


export const Route = createFileRoute('/sportingEvents/active')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const res = await getAuthenticated<
      z.infer<typeof ARAllSportingEventSchema>
      >('/api/sportingEvents', ARAllSportingEventSchema);
    const data = []
    data.push(...z.array(SpBSchema).parse(res.body.data.open.map(e => ({...e, status: "open"}))))
    data.push(...z.array(SpBSchema).parse(res.body.data.comingSoon.map(e => ({...e, status: "comingSoon"}))))
    data.push(...z.array(SpBSchema).parse(res.body.data.closed.map(e => ({...e, status: "closed"}))))
    console.log(data)
    return { data }
  },
  staleTime: 1000 * 60 * 5,
})

function RouteComponent() {
  const { data } = Route.useLoaderData();

  return (
    <SportingEventsMinTable
      data={data}
      title="Eventos deportivos activos"
      emptyMessage='No hay eventos deportivos activos.'
    />
  )
}
