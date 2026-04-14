import { createFileRoute } from '@tanstack/react-router'
import React from 'react';

export const Route = createFileRoute('/test2')({
  component: RouteComponent,
})

function RouteComponent() {
  const [myVar, setMyVar] = React.useState(false);
  
  return <div className='mx-auto mt-10'>
    <div>
      <h1 className="text-2xl font-bold mb-4">Prueba 2</h1>
      <p className="text-lg">Esta es una página de prueba</p>
    </div>

    <div className={"mt-4 p-4 bg-green-100 text-green-700 rounded " + (myVar ? '' : 'hidden')}>¡La variable es verdadera!</div>

    <button
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
      onClick={() => setMyVar(!myVar)}
    >
      {myVar ? 'Ocultar mensaje' : 'Mostrar mensaje'}
    </button>
  </div>
}
