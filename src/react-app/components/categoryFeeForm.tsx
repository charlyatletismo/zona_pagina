import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from './ui/spinner';
import { FeeCategory } from '@/lib/types';
import { postAuthenticated } from '@/lib/apiCalls';
import { useNavigate } from '@tanstack/react-router';


const { fieldContext, formContext } = createFormHookContexts()


const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
    Label,
  },
  formComponents: {
    Button,
  },
  fieldContext,
  formContext,
});


export const CategoryFeeForm = ({ feeCat }: { feeCat: FeeCategory | null }) => {
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: feeCat?.name ?? '',
      description: feeCat?.description ?? null,
    },
    validators: {
      // Pass a schema or function to validate
      onBlur: z.object({
        name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
        description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres').nullable(),
      }),
      // onChangeAsyncDebounceMs: 1000,
    },
    onSubmit: async ({ value }) => {
      alert('Enviando datos...');
      const res = await postAuthenticated(
        `/api/categories/fee${feeCat ? `/${feeCat.id}` : '/create'}`,
        value,
        navigate)
      alert(res.status !== 200 ? `Error al guardar la categoría de tarifa: ${res.data.error}` : 'Categoría de tarifa guardada con éxito');
      if (res.status === 200) {
        navigate({ to: '/categories', reloadDocument: true });
      }
    },
  })

  return (
    <form
      className="p-6 space-y-6"
      onSubmit={(e) => {
        console.log('Submitting form')
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Subscribe
        selector={(state) => [state.isSubmitting]}
        children={([isSubmitting]) => (
          <div>
            {isSubmitting ? (
              <div className='flex gap-4 items-center space-x-2 mb-4 text-sm text-gray-600'>
                <Spinner /><div>Guardando...</div>
              </div>) : null
            }
          </div>
        )}
      />

      <form.AppField
        name="name"
        children={(field) => (
          <div className='space-y-2'>
            <field.Label htmlFor={field.name}>Nombre</field.Label>
            <field.Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={() => field.handleBlur()}
              className={!field.state.meta.isValid ? 'border-destructive' : ''}
            />
            {!field.state.meta.isValid && (
              <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
            )}
          </div>
        )}
      />
      <form.AppField
        name="description"
        children={(field) => (
          <div className='space-y-2'>
            <field.Label htmlFor={field.name}>Descripción</field.Label>
            <field.Input
              id={field.name}
              name={field.name}
              value={field.state.value || ''}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={() => field.handleBlur()}
              className={!field.state.meta.isValid ? 'border-destructive' : ''}
            />
            {!field.state.meta.isValid && (
              <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
            )}
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
        children={([canSubmit, isSubmitting, isPristine]) => (
          <form.AppForm>
            <form.Button type="submit" disabled={!canSubmit || isPristine || isSubmitting} className='mr-2'>
              {isSubmitting ? '...' : 'Guardar'}
            </form.Button>
            <form.Button
              type="reset"
              variant="outline"
              disabled={isPristine || isSubmitting}
              onClick={(event) => {
                event.preventDefault()
                form.reset()
              }}
            >
              Reset
            </form.Button>
          </form.AppForm>
        )}
      />
    </form>
  )

}