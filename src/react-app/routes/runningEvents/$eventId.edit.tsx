import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/runningEvents/$eventId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/runningEvents/$eventId/edit"!</div>
}
