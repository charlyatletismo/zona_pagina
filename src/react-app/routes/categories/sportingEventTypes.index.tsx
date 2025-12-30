import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/categories/sportingEventTypes/')({
  component: RouteComponent,
  beforeLoad: () => { 
    throw redirect({ to: '/categories' });
  },
})

function RouteComponent() {
  return <div>Redirigiendo al listado de categorías...</div>
}
