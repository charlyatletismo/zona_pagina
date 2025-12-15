import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/users/add"!</div>
}
