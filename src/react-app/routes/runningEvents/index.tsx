import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/runningEvents/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/runningEvents/"!</div>
}
