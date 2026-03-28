import { Link } from '@tanstack/react-router';


export function ErrorComp() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[70vh] w-full cursor-pointer overflow-hidden relative"
    >
      <h1 className="text-[12rem] font-black text-gray-100 select-none absolute z-0">Error</h1>

      <div className="z-10 text-center mt-12 space-y-4">
        <h2 className="text-3xl font-bold text-gray-800">Ha ocurrido un error inesperado</h2>
        <p className="text-gray-600 max-w-md mx-auto px-4">
          Haz click para volver al inicio.
        </p>

        <div className="pt-4">
            <Link
                to="/"
                className="inline-block px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all hover:scale-105 font-medium shadow-lg hover:shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
              Volver al inicio
            </Link>
        </div>
      </div>

    </div>
  )
}
