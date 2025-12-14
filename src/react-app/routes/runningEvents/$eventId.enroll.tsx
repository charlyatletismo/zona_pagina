import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/runningEvents/$eventId/enroll')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/runningEvents/$eventId/enroll"!</div>
}
