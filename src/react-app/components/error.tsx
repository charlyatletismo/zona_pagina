import { Link } from '@tanstack/react-router';

import { Button } from './ui/button';


interface ErrorCompProps {
  error: Error;
  info?: { componentStack?: string };
  reset: () => void;
}


export function ErrorComp({ error, info, reset }: ErrorCompProps) {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[70vh] w-full cursor-pointer overflow-hidden relative"
    >
      <h1 className="text-[12rem] font-black text-muted-foreground/5 select-none absolute z-0">Error</h1>

      <div className="z-10 text-center mt-12 space-y-4">
        <h2 className="text-3xl font-bold">Ha ocurrido un error inesperado</h2>
        <p className="max-w-md mx-auto px-4">
          {error.message || 'Algo salió mal. Haz click para intentar de nuevo o vuelve al inicio.'}
        </p>

        <div className="max-w-md mx-auto px-4 mt-4 p-4 bg-muted/50 border border-muted rounded-md">
          <p className="text-sm text-muted-foreground text-center">
            💡 Si experimentas problemas en dispositivos móviles, te recomendamos usar una computadora por ahora. La aplicación está en versión beta con mejoras continuas. ¡Gracias por tu paciencia!
          </p>
        </div>

        {info?.componentStack && (
          <details className="text-left max-w-md mx-auto px-4">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-muted-foreground/70">
              Detalles técnicos
            </summary>
            <pre className="text-xs text-muted-foreground/70 mt-2 whitespace-pre-wrap">
              {info.componentStack}
            </pre>
          </details>
        )}

        <div className="pt-4 space-x-4">
          <Button onClick={reset} className='cursor-pointer'>
            Intentar de nuevo
          </Button>
          <Link
            to="/"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              className='cursor-pointer'
            >
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>

    </div>
  )
}
