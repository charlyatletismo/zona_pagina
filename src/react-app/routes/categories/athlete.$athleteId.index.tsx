import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/categories/athlete/$athleteId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/categories/athlete/$athleteId"!</div>
}
