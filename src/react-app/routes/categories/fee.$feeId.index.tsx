import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/categories/fee/$feeId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/categories/fee/$feeId"!</div>
}
