import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sportingEvents/chips')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sportingEvents/chips"!</div>
}
