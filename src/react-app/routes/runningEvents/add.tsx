import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/runningEvents/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/runningEvents/add"!</div>
}
