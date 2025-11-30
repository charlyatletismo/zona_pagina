import { createFileRoute } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import React from 'react'


export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [codeSent, setCodeSent] = React.useState(false);
  const [resendTimer, setResendTimer] = React.useState(0);
  const [register, setRegister] = React.useState(false);
  const [error, setError] = React.useState('');

  const reset = () => {
    setCodeSent(false);
    setPhone('');
    setCode('');
    setRegister(false);
    setError('');
  }

  React.useEffect(() => {
    let timer: any;
    if (resendTimer > 0) {
      timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  return <form method='POST' onSubmit={(event) => {
    event.preventDefault();
    if (codeSent) {
      // verify code
      fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({"phone": phone, "code": code}),
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
      const user_id = (event.target as any)[1].value;
      fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({"phone": phone, "user_id": user_id}),
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
            setError(`Error al registrar el usuario. Por favor, inténtelo de nuevo. ${data.error}`);
          });
        }
      });
      return;
    }
    // send code
    fetch('/api/auth/sendCode', {
      method: 'POST',
      body: JSON.stringify({ phone }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => {
      if (res.ok) {
        setError('');
        setCodeSent(true);
      } else {
        setRegister(true);
      }
    });
    setResendTimer(60);
  }}>
    {codeSent &&
      <div className="mb-2 text-sm text-gray-500">Hemos enviado un código de verificación a su número de teléfono mediante WhatsApp.</div>
    }
    {(codeSent || register)
      ? <Input placeholder="3400123456" type='tel' className="mb-2" value={phone} onChange={e => setPhone(e.target.value)} disabled />
      : <Input placeholder="3400123456" type='tel' className="mb-2" value={phone} onChange={e => setPhone(e.target.value)} />
    }
    {register && !codeSent &&
      <label className="mb-1 block text-sm font-medium text-gray-700">Parece que no tienes una cuenta. Por favor, regístrate proporcionando tu número de identificación (DNI).
        <Input placeholder='30123456' className="mb-2" required={register} />
      </label>
    }
    {codeSent &&
      <Input placeholder="123456" className="mb-2" value={code} onChange={e => setCode(e.target.value)} required={codeSent} minLength={6} maxLength={6} />
    }
    <Button type="submit">{codeSent ? "Verificar código" : "Iniciar sesión"}</Button>
    {(codeSent || register) &&
      <Button variant="outline" className="ml-2" onClick={() => {
        reset();
      }}>Cancelar</Button>
    }
    {error &&
      <div className="mt-2 text-sm text-red-500">{error}</div>
    }
    {codeSent && resendTimer === 0 &&
      <div className="mt-2 text-sm text-gray-500">¿No has recibido el código? <a href="#" onClick={(e) => {
        e.preventDefault();
        // resend code
        fetch('/api/auth/sendCode', {
          method: 'POST',
          body: JSON.stringify({ "phone": phone }),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then((res) => {
          if (res.ok) {

          } else {
            alert('Error al reenviar el código');
          }
        });
        setResendTimer(60);
      }} className="text-blue-500 underline">Reenviar código</a></div>
    }
  </form>
}
