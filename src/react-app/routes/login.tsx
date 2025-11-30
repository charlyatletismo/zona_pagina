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
            alert('Login successful. Token: ' + data.token);
            localStorage.setItem('JWT_TOKEN', data.token);
            localStorage.setItem('USER_ROLES', data.roles);
            localStorage.setItem('USER_ID', data.id);
            localStorage.setItem('USER_ROLE', data.roles.split(",")[0] || '');
            window.location.href = '/';
          });
        } else {
          alert('Login failed');
        }
      });
      return;
    }
    // send code
    fetch('/api/auth/sendCode', {
      method: 'POST',
      body: JSON.stringify({"phone": (event.target as any)[0].value}),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => {
      if (res.ok) {
        setCodeSent(true);
      } else {
        alert('Login failed');
      }
    });
    setResendTimer(60);
  }}>
    {codeSent &&
      <div className="mb-2 text-sm text-gray-500">Hemos enviado un código de verificación a su número de teléfono mediante WhatsApp.</div>
    }
    {codeSent
      ? <Input placeholder="3400123456" className="mb-2" value={phone} onChange={e => setPhone(e.target.value)} disabled />
      : <Input placeholder="3400123456" className="mb-2" value={phone} onChange={e => setPhone(e.target.value)} />
    }
    {codeSent &&
      <Input placeholder="123456" className="mb-2" value={code} onChange={e => setCode(e.target.value)} required={codeSent} minLength={6} maxLength={6} />
    }
    <Button type="submit">{codeSent ? "Verificar código" : "Iniciar sesión"}</Button>
    {codeSent &&
      <Button variant="outline" className="ml-2" onClick={() => {
        setCodeSent(false);
        setPhone('');
        setCode('');
      }}>Cancelar</Button>
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
