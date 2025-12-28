import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/categories/fee/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/categories/create/fee"!</div>
}
