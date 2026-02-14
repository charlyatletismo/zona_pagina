import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/sportingEvents/$eventId/allRegistrations',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sportingEvents/$eventId/allRegistrations"!</div>
}
