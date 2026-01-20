import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/locations/checkTemporary')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/locations/checkTemporary"!</div>
}
