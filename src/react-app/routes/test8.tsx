import { createFileRoute } from '@tanstack/react-router';
import { useState } from "react";
import { useAppForm } from '@/lib/genForm';
import { AlertCircle, ArrowLeftIcon, User2Icon } from 'lucide-react';
import z from 'zod';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';


const LoginFormSchema = z.object({
  phone: z.string(),
  user_id: z.string(),
  code: z.string().length(6, 'El código debe tener 6 dígitos'),
});


export const Route = createFileRoute('/test8')({
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
  const [error, _setError] = useState('');
  const setError = (msg: string) => {
    _setError(msg)
    setTimeout(() => {
      _setError('');
    }, 5000);
  };

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
      if (value.phone === '54_9_' || !value.phone) {
        setError('Por favor, ingrese un número de teléfono antes de enviar el formulario.')
        return;
      }
      // delay artificial para probar el spinner
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (statusMode === 'initial') {
        const res = {
          status: value.phone === '54_9_1234567890' ? 200 : 404,
        }
        if (res.status === 404) {
          setStatusMode('register');
          setSuccess('Para verificar código use 1234567890.');
          form.setFieldValue('user_id', '');
          return;
        }
        setSuccess('Modo código enviado.');
        setStatusMode('codeSent');
        form.setFieldValue('code', '');
      } else if (statusMode === 'codeSent') {
        if (!value.code) {
          setError('Por favor, ingrese el código de verificación antes de enviar el formulario.');
          return;
        }
        const res = {
          status: value.code === '123456' ? 200 : 401,
        }
        if (res.status !== 200) {
          setError('Código incorrecto. Por favor, inténtelo de nuevo. (123456)');
          return;
        }
        setSuccess('Código correcto');
      } else if (statusMode === 'register') {
        if (!value.user_id) {
          setError('Por favor, ingrese su DNI antes de enviar el formulario.');
          return;
        }
        const res = {
          status: value.user_id === '1234567' ? 200 : 400,
        }
        if (res.status !== 200) {
          setError('Error. Por favor, inténtelo de nuevo. (DNI correcto: 1234567)');
          return;
        }
        setSuccess('Registro exitoso');
        setStatusMode('codeSent');
        form.setFieldValue('code', '');
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
          <h1 className="text-2xl font-bold">Título</h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">Subtítulo</p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-600 p-3 rounded-md text-sm mb-2">
            {success}
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

            <form.AppField
              name="user_id"
              children={(field) => (
                <div className={"space-y-2 " + (statusMode === 'register' ? '' : 'hidden')}>
                  <field.Label htmlFor={field.name}>DNI</field.Label>
                  <field.Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className={!field.state.meta.isValid ? 'border-destructive' : ''}
                    disabled={statusMode !== 'register'}
                  />
                  {!field.state.meta.isValid && (
                    <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                  )}
                </div>
              )}
            />

            <form.AppField
              name="code"
              children={(field) => (
                <div className={"space-y-2 " + (statusMode === 'codeSent' ? '' : 'hidden')}>
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
                    disabled={statusMode !== 'codeSent'}
                  />
                  {!field.state.meta.isValid && (
                    <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                  )}
                </div>
              )}
            />

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
  )
}
