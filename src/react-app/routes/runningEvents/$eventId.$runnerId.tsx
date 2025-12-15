import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/runningEvents/$eventId/$runnerId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/runningEvents/$eventId/$runnerId"!</div>
}
