import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/categories/athlete/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/categories/create/athlete"!</div>
}
