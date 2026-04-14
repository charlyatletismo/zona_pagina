import { createFileRoute } from '@tanstack/react-router'
import React from 'react';

export const Route = createFileRoute('/test4')({
  component: RouteComponent,
})

function RouteComponent() {
  const [success, _setSuccess] = React.useState("");
  const setSuccess = (message: string) => {
    _setSuccess(message);
    setTimeout(() => {
      _setSuccess("");
    }, 3000);
  };

  return <div className='mx-auto mt-10'>
    <div>
      <h1 className="text-2xl font-bold mb-4">Prueba 4</h1>
      <p className="text-lg">Esta es una página de prueba</p>
    </div>

    <div className={"bg-green-50 text-green-600 p-3 rounded-md text-sm mt-2 " + (success ? '' : 'hidden')}>
      {success}
    </div>

    <button
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
      onClick={() => setSuccess("¡Éxito! Cerrando automáticamente en 3 segundos...")}
    >
      Mostrar mensaje de éxito
    </button>
  </div>
}
