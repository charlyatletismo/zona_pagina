import { createFileRoute } from '@tanstack/react-router'
import unprotectedCheck from '@/lib/beforeLoadGenericCheck'
import React from 'react'
import { type InferSelectModel } from 'drizzle-orm'
import { events } from '../../../worker/db/schema'


export const Route = createFileRoute('/runningEvents/$eventId')({
  component: RouteComponent,
  beforeLoad: unprotectedCheck(),
})


function RouteComponent() {
  const { eventId } = Route.useParams()
  const [evData, setEvData] = React.useState<InferSelectModel<typeof events> | null>(null);
  React.useEffect(() => {
    fetch(`/api/runningEvents/${eventId}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setEvData(data));
  }, [eventId]);

  return <div>Hello "/runningEvents/{eventId}"!</div>
}
