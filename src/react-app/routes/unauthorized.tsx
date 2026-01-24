import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/unauthorized')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Acceso Restringido</h1>
        <p className="text-lg text-muted-foreground max-w-[500px]">
          Lo sentimos, no tienes los permisos necesarios para ver esta página.
          Si crees que esto es un error, por favor contacta al organizador.
        </p>
      </div>

      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link to="..">
            Volver atrás
          </Link>
        </Button>
        <Button asChild>
          <Link to="/">
            Ir al Inicio
          </Link>
        </Button>
      </div>
    </div>
  )
}
