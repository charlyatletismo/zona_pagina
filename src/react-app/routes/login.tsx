import { createFileRoute } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    <div className='max-w-xl mx-auto my-10 p-10'>
      {register
        ? <h1 className="text-2xl font-bold mb-4">Registrarse</h1>
        : <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>
      }
      {error && <div className="mb-4 text-red-500">{error}</div>}
      <form method='POST' onSubmit={(event) => {
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
                localStorage.setItem('USER_ROLE', data.roles.split(",")[0] || '');
                window.location.href = '/';
              });
            } else {
              setError('Código incorrecto. Por favor, inténtelo de nuevo.');
            }
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
        <Button type="submit" className='mt-3'>{codeSent ? "Verificar código" : "Iniciar sesión"}</Button>
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
                alert('Error al reenviar el código');
              }
            });
            scheduleResend(60);
          }} className="text-blue-500 underline">Enviar otro código</a></div>
        }
      </form>
    </div>
  )
}
