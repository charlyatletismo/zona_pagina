import { useState } from 'react'
import { Link } from '@tanstack/react-router'

export function NotFound() {
  const [isJumping, setIsJumping] = useState(false)

  const jump = () => {
    if (!isJumping) {
      setIsJumping(true)
      setTimeout(() => setIsJumping(false), 500)
    }
  }

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-[70vh] w-full cursor-pointer overflow-hidden relative"
      onClick={jump}
    >
      <h1 className="text-[12rem] font-black text-gray-100 select-none absolute z-0">404</h1>
      
      <div className="relative z-10 flex flex-col items-center">
        <div 
            className={`text-8xl transition-all duration-300 ease-out ${isJumping ? '-translate-y-40 rotate-12 scale-110' : ''}`}
            style={{
                animation: isJumping ? 'none' : 'run 0.6s infinite ease-in-out alternate'
            }}
        >
            🏃
        </div>
        
        {/* Shadow */}
        <div 
            className={`h-4 bg-black/10 rounded-[100%] transition-all duration-300 mt-2 ${isJumping ? 'w-10 opacity-30 translate-y-10' : 'w-24 opacity-60'}`}
        ></div>
      </div>
      
      <div className="z-10 text-center mt-12 space-y-4">
        <h2 className="text-3xl font-bold text-gray-800">¡Te has desviado del recorrido!</h2>
        <p className="text-gray-600 max-w-md mx-auto px-4">
          Parece que esta página no ha cruzado la línea de meta. Haz click para saltar o vuelve al inicio.
        </p>

        <div className="pt-4">
            <Link 
                to="/" 
                className="inline-block px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all hover:scale-105 font-medium shadow-lg hover:shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                Volver a la pista
            </Link>
        </div>
      </div>

      <style>{`
        @keyframes run {
          from { transform: translateY(0) rotate(-10deg); }
          to { transform: translateY(-10px) rotate(10deg); }
        }
      `}</style>
    </div>
  )
}
