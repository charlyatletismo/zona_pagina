import z from 'zod';
import { useState } from "react";
import { useAppForm } from '@/lib/genForm';
import { getMessage } from '@/lib/utils';
import { postAuthenticated } from '@/lib/apiCalls';
import { UserSchema } from '@shared/types';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, ArrowLeftIcon, User2Icon } from 'lucide-react';
import { setUserInfo } from '@/lib/utils'
import { Button } from './ui/button';


const LoginFormSchema = z.object({
  phone: UserSchema.shape.phone,
  user_id: UserSchema.shape.id,
  code: z.string().length(6, 'El código debe tener 6 dígitos'),
});


export const LoginDynamicForm = () => {
  const [statusMode, setStatusMode] = useState<'initial' | 'codeSent' | 'register'>('initial');

  const [error, _setError] = useState('');
  const [success, _setSuccess] = useState('');
  const setError = (msg: string) => {
    _setError(msg)
    setTimeout(() => {
      _setError('');
    }, 2000);
  };
  const setSuccess = (msg: string) => {
    _setSuccess(msg)
    setTimeout(() => {
      _setSuccess('');
    }, 3000);
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

  const form = useAppForm({
    defaultValues: {
      phone: '54_9_',
      user_id: '1234567',
      code: '123456',
    },
    validators: {
      onBlur: LoginFormSchema,
    },
    onSubmit: async ({ value }) => {
      // Scroll to top of the page when form is submitted
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (value.phone === '54_9_' || !value.phone) {
        setError('Por favor, ingrese un número de teléfono antes de enviar el formulario.')
        return;
      }
      if (statusMode === 'initial') {
        const res = await postAuthenticated('/api/auth/sendCode', {
          phone: value.phone,
        });
        if (res.status === 404) {
          setStatusMode('register');
          form.setFieldValue('user_id', '');
          return;
        }
        if (res.status !== 200) {
          setError(getMessage(res.body?.message, 'Error al enviar el código. Por favor, inténtelo de nuevo.'));
          return;
        }
        setSuccess(getMessage(res.body?.message, 'Código enviado con éxito'));
        setStatusMode('codeSent');
        if (res.body?.data?.tempCode) {
          form.setFieldValue('code', res.body.data.tempCode as string);
        } else {
          form.setFieldValue('code', '');
        }
      } else if (statusMode === 'codeSent') {
        if (!value.code) {
          setError('Por favor, ingrese el código de verificación antes de enviar el formulario.');
          return;
        }
        const res = await postAuthenticated('/api/auth/login', {
          phone: value.phone,
          code: value.code,
        });
        if (res.status !== 200) {
          setError(getMessage(
            res.body?.message,
            'Código incorrecto. Por favor, inténtelo de nuevo.'));
          return;
        }
        setSuccess(getMessage(res.body?.message, 'Inicio de sesión exitoso'));
        setUserInfo(res.body?.data);
        setTimeout(() => {
          window.location.href = '/';
          window.location.reload();
        }, 300);
      } else if (statusMode === 'register') {
        if (!value.user_id) {
          setError('Por favor, ingrese su DNI antes de enviar el formulario.');
          return;
        }
        const res = await postAuthenticated('/api/auth/register', {
          phone: value.phone,
          user_id: value.user_id,
        });
        if (res.status !== 200) {
          setError(getMessage(
            res.body?.message,
            'Error. Por favor, inténtelo de nuevo.'));
          return;
        }
        setSuccess(getMessage(res.body?.message, 'Registro exitoso'));
        setStatusMode('codeSent');
      } else {
        setError('Estado desconocido. Por favor, refresque la página.');
      }
    }
  });

  return (
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
                  const phone = form.state.values.phone;
                  form.reset();
                  form.setFieldValue('phone', phone);
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

        {error && (
          <div className="bg-red-500/10 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-600 p-3 rounded-md text-sm">
            {success}
          </div>
        )}

        {statusMode === 'register' && (
          <div className='space-y-1 text-center text-muted-foreground text-sm'>
            <div>Parece que no tienes una cuenta.</div>
            <div>Por favor, regístrate proporcionando tu número de DNI</div>
          </div>
        )}

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
            children={([isSubmitting]) => (
              <div>
                {isSubmitting ? (
                  <div className='flex gap-4 items-center space-x-2 mb-4 text-sm text-gray-600'>
                    <Spinner /><div>Enviando...</div>
                  </div>) : null
                }
              </div>
            )}
          />

          <div className="grid grid-cols-1 gap-2">

            <form.AppField
              name="phone"
              children={(field) => (
                <div className="space-y-2">
                  <field.PhoneInput
                    label="Celular (con WhatsApp)"
                    name={field.name}
                    value={field.state.value || ''}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                    showError={!field.state.meta.isValid}
                    required={true}
                    disabled={statusMode !== 'initial'}
                  />
                  {!field.state.meta.isValid && (
                    <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                  )}
                </div>
              )}
            />

            {statusMode === 'register' && (<form.AppField
              name="user_id"
              children={(field) => (
                <div className="space-y-2">
                  <field.Label htmlFor={field.name}>DNI</field.Label>
                  <field.Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={!field.state.meta.isValid ? 'border-destructive' : ''}
                  />
                  {!field.state.meta.isValid && (
                    <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                  )}
                </div>
              )}
            />)}

            {statusMode === 'codeSent' && (<form.AppField
              name="code"
              children={(field) => (
                <div className="space-y-2">
                  <field.Label htmlFor={field.name}>Código de verificación</field.Label>
                  <field.Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={!field.state.meta.isValid ? 'border-destructive' : ''}
                    required={true}
                    maxLength={6}
                    placeholder='código de 6 dígitos'
                  />
                  {!field.state.meta.isValid && (
                    <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                  )}
                </div>
              )}
            />)}

          </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
          children={([canSubmit, isSubmitting, isPristine]) => (
            <form.AppForm>
              <form.Button
                type="submit"
                disabled={!canSubmit || isPristine || isSubmitting}
                className='mr-2 mt-2'
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    ...
                  </>
                ) : (
                  <>
                    Enviar
                  </>
                )}
              </form.Button>
            </form.AppForm>
          )}
        />

        </form>
      </div>
    </div>
  );
}
