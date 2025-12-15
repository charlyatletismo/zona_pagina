import { createFileRoute } from '@tanstack/react-router'
import unprotectedCheck from '@/lib/beforeLoadGenericCheck'


export const Route = createFileRoute('/runningEvents/$eventId')({
  component: RouteComponent,
  beforeLoad: unprotectedCheck(),
})


function RouteComponent() {
  const { eventId } = Route.useParams()
  return <div>Hello "/runningEvents/{eventId}"!</div>
}
