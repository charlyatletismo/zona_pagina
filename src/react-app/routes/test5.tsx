import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, User2Icon } from 'lucide-react';

export const Route = createFileRoute('/test5')({
  component: RouteComponent,
})

function RouteComponent() {
  const [statusMode, setStatusMode] = useState<'initial' | 'codeSent' | 'register'>('initial');

  const [success, _setSuccess] = useState('');
  const setSuccess = (msg: string) => {
    _setSuccess(msg)
    setTimeout(() => {
      _setSuccess('');
    }, 5000);
  };
  const title = {
    initial: 'Bienvenido',
    codeSent: 'Verificar código',
    register: 'Crear cuenta',
  }
  const subtitle = {
    initial: 'Ingresa tu número de celular para continuar',
    codeSent: 'Ingresa el código que te enviamos por WhatsApp',
    register: 'Ingresa tus datos para registrarte',
  }

  return (<div>
    <div className='mx-auto mt-10 text-center'>
      Prueba 5
    </div>
    <div className="relative min-h-[80vh] flex items-center justify-center p-4">
      <div className='w-full max-w-md backdrop-blur-xl rounded-2xl shadow-2xl border border-muted p-8'>
        <div className="flex flex-col items-center mb-8">
          {statusMode !== 'initial' && (
            <div className='mr-auto'>
              <Button
                variant="ghost"
                size="icon"
                className='cursor-pointer'
                onClick={() => {
                setStatusMode('initial');
                setSuccess('Modo inicial');
                }}
              >
                <ArrowLeftIcon className="h-6 w-6 text-muted-foreground cursor-pointer" />
              </Button>
            </div>
          )}
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <User2Icon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{title[statusMode]}</h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">{subtitle[statusMode]}</p>
        </div>

        {success && (
          <div className="bg-green-500/10 text-green-600 p-3 rounded-md text-sm mb-2">
            {success}
          </div>
        )}

        {statusMode === 'register' && (
          <div className='space-y-1 text-center text-muted-foreground text-sm'>
            <div>Parece que no tienes una cuenta.</div>
            <div>Por favor, regístrate proporcionando tu número de DNI</div>
          </div>
        )}

        {statusMode === 'initial' && (
          <div className='mt-5 flex gap-2'>
            <Button onClick={() => {
              setStatusMode('codeSent');
              setSuccess('Modo verificar código');
            }}>
              Login
            </Button>
            <Button onClick={() => {
              setStatusMode('register');
              setSuccess('Modo registro');
            }}>
              Register
            </Button>
          </div>
        )}
      </div>
    </div>
  </div>)
}
