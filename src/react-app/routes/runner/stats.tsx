import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/runner/stats')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/stats"!</div>
}
