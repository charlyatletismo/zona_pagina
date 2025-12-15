import { createFileRoute } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { User2 } from 'lucide-react'
import React from 'react'


export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [phone, setPhone] = React.useState('');
  const [countryCode, setCountryCode] = React.useState('54');
  const [userId, setUserId] = React.useState('');
  const [code, setCode] = React.useState('');
  const [codeSent, setCodeSent] = React.useState(false);
  const [resendAvailable, setResendAvailable] = React.useState(false);
  const [register, setRegister] = React.useState(false);
  const [error, setError] = React.useState('');
  const [waiting, setWaiting] = React.useState(false);

  const reset = () => {
    setCodeSent(false);
    setPhone('');
    setCode('');
    setRegister(false);
    setResendAvailable(false);
    setError('');
  }

  const scheduleResend = (s: number) => {
    setResendAvailable(false);
    const timer = setTimeout(() => {
      setResendAvailable(true);
    }, s * 1000);
    return () => clearTimeout(timer);
  }

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      
      <div className='w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8'>
      {register
        ? <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-primary/10 rounded-full mb-4">
              <User2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
            <p className="text-sm text-gray-500 mt-2 text-center">Ingresa tus datos para registrarte</p>
          </div>
        : <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-primary/10 rounded-full mb-4">
              <User2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bienvenido</h1>
            <p className="text-sm text-gray-500 mt-2 text-center">Ingresa tu teléfono para continuar</p>
          </div>
      }
      {error && <div className="mb-4 text-red-500">{error}</div>}
      {waiting && <div className='flex gap-2 my-4'><Spinner className='my-auto' /><div className="text-gray-500">Por favor, espere...</div></div>}
      <form method='POST' onSubmit={(event) => {
        setWaiting(true);
        setError('');
        event.preventDefault();
        if (codeSent) {
          // verify code
          fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ "phone": `${countryCode}9${phone}`, "code": code }),
            headers: {
              'Content-Type': 'application/json'
            }
          }).then((res) => {
            if (res.ok) {
              res.json().then((data) => {
                localStorage.setItem('JWT_TOKEN', data.token);
                localStorage.setItem('USER_ROLES', data.roles);
                localStorage.setItem('USER_ID', data.id);
                localStorage.setItem('USER_NAME', data.name || 'Nuevo Usuario');
                localStorage.setItem('REQUIRE_PROFILE_UPDATE', data.require_profile_update);
                localStorage.setItem('USER_ROLE', data.roles.split(",")[0] || '');
                window.location.href = '/';
              });
            } else {
              setError('Código incorrecto. Por favor, inténtelo de nuevo.');
            }
            setWaiting(false);
          });
          return;
        }
        if (register) {
          // register user
          fetch('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ "phone": `${countryCode}9${phone}`, "user_id": userId }),
            headers: {
              'Content-Type': 'application/json'
            }
          }).then((res) => {
            if (res.ok) {
              setError('');
              setRegister(false);
              setCodeSent(true);
            } else {
              res.json().then((data) => {
                setUserId('');
                setError(`Error al registrar el usuario. Por favor, inténtelo de nuevo. ${data.error}`);
              });
            }
            setWaiting(false);
          });
          return;
        }
        // send code
        fetch('/api/auth/sendCode', {
          method: 'POST',
          body: JSON.stringify({ "phone": `${countryCode}9${phone}` }),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then((res) => {
          if (res.ok) {
            setError('');
            setCodeSent(true);
          } else if (res.status === 400) {
            setRegister(true);
          } else {
            setError('Error al enviar el código. Por favor, inténtelo de nuevo.');
          }
          setWaiting(false);
        });
        scheduleResend(60);
      }}>
        {codeSent &&
          <div className="mb-2 text-sm text-gray-500">Hemos enviado un código de verificación a su número de teléfono mediante WhatsApp.</div>
        }

        <label htmlFor='phone' className="mb-1 block text-sm font-light text-gray-700">Número de teléfono (con WhatsApp)</label>
        <div className="flex mb-2">
          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
            +
          </span>
          <Input
            id='country_code'
            name='country_code'
            placeholder="54"
            maxLength={3}
            value={countryCode}
            onChange={e => {
              // ignore if there is there at most 3 digits or if it is not a number
              if (e.target.value.length > 3) {return;}
              if (!e.target.value.match(/^[0-9]*$/)) {return;}
              setCountryCode(e.target.value);
            }}
            className="w-16 rounded-none"
            disabled={codeSent || register} />
          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300">
            9
          </span>
          <Input
            id='phone'
            name='phone'
            placeholder="celular"
            className='rounded-l-none'
            minLength={10}
            maxLength={10}
            value={phone}
            onChange={e => {
              // ignore if there is there at most 10 digits or if it is not a number
              // console.log(e.target.value, phone);
              if (e.target.value.length > 10) { return; }
              if (!e.target.value.match(/^[0-9]*$/)) { return; }

              // console.log('setPhone', e.target.value);
              setPhone(e.target.value);
            }}
            disabled={codeSent || register} />
        </div>
        

        {register && !codeSent &&
          <div>
            <div className="mb-1 block text-sm font-medium text-gray-700">Parece que no tienes una cuenta.</div>
            <label htmlFor='user_id' className="mb-1 block text-sm font-light text-gray-700">Por favor, regístrate proporcionando tu número de DNI</label>
            <Input
              id='user_id'
              name='user_id'
              placeholder='dni sin puntos'
              value={userId}
              onChange={e => {
                if (e.target.value.length > 9) { return; }
                if (!e.target.value.match(/^[0-9]*$/)) { return; }
                setUserId(e.target.value);
              }}
              maxLength={9}
              className="mb-2 noSpinInputNumber"
              required={register} />
          </div>
        }
        {codeSent &&
          <div>
            <label htmlFor='code' className="mb-1 block text-sm font-light text-gray-700">Código de verificación</label>
            <Input
              id='code'
              name='code'
              placeholder="XXXXXX"
              minLength={6}
              maxLength={6}
              className="mb-2"
              value={code}
              onChange={e => {
                if (e.target.value.length > 6) { return; }
                if (!e.target.value.match(/^[0-9]*$/)) { return; }
                setCode(e.target.value);
              }}
              required={codeSent} />
          </div>
        }
        <Button type="submit" className='mt-3'>{codeSent ? "Verificar código" : register ? "Registrarse" : "Iniciar sesión"}</Button>
        {(codeSent || register) &&
          <Button variant="outline" className="ml-2" onClick={() => {
            reset();
          }}>Cancelar</Button>
        }
        {codeSent && resendAvailable &&
          <div className="mt-2 text-sm text-gray-500">¿No has recibido el código? <a href="#" onClick={(e) => {
            e.preventDefault();
            // resend code
            fetch('/api/auth/sendCode', {
              method: 'POST',
              body: JSON.stringify({ "phone": `+${countryCode}9${phone}` }),
              headers: {
                'Content-Type': 'application/json'
              }
            }).then((res) => {
              if (res.ok) {

              } else {
                setError('Error al enviar un código nuevo. Por favor, inténtelo de nuevo.');
              }
            });
            scheduleResend(60);
          }} className="text-blue-500 underline">Enviar otro código</a></div>
        }
      </form>
    </div>
    </div>
  )
}
