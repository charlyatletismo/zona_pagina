import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/sportingEvents/')({
  component: RouteComponent,
  beforeLoad: () => { 
    throw redirect({ to: '/' });
  },
})

function RouteComponent() {
  return <div>Redirigiendo al inicio...</div>
}
