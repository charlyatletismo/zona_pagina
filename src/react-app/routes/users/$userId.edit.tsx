import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users/$userId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/users/edit"!</div>
}
