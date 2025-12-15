import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/runningEvents/$eventId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { eventId } = Route.useParams()
  return <div>Hello "/runningEvents/{eventId}"!</div>
}
