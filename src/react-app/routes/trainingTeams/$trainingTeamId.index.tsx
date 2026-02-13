import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/trainingTeams/$trainingTeamId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/trainingTeams/$trainingTeamId/"!</div>
}
