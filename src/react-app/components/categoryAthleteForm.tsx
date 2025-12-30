import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from './ui/spinner';
import { AthleteCategory, FeeCategory } from '@/lib/types';
import { postAuthenticated } from '@/lib/apiCalls';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from '@tanstack/react-router';


const { fieldContext, formContext } = createFormHookContexts()


const { useAppForm } = createFormHook({
  fieldComponents: {
    Input,
    Label,
    Select,
  },
  formComponents: {
    Button,
  },
  fieldContext,
  formContext,
});


export const CategoryAthleteForm = ({athCat, feeCats}: {athCat: AthleteCategory | null, feeCats: FeeCategory[]}) => {
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: athCat?.name ?? '',
      description: athCat?.description ?? null,
      fee_category_id: athCat?.fee_category_id ?? 0,
      sex: athCat?.sex ?? null,
      min_age: athCat?.min_age ?? null,
      max_age: athCat?.max_age ?? null,
      condition: athCat?.condition ?? null,
    },
    validators: {
      // Pass a schema or function to validate
      onBlur: z.object({
        name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
        description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres').nullable(),
        fee_category_id: z.number().min(1, 'Debe seleccionar una categoría de tarifa'),
        sex: z.string().nullable(),
        min_age: z.number().nullable(),
        max_age: z.number().nullable(),
        condition: z.string().nullable(),
      }),
      // onChangeAsyncDebounceMs: 1000,
    },
    onSubmit: async ({ value }) => {
      alert('Enviando datos...');
      const res = await postAuthenticated(
        `/api/categories/athlete${athCat ? `/${athCat.id}` : '/create'}`,
        value,
        navigate)
      alert(res.status !== 200 ? `Error al guardar la categoría de atleta: ${res.data.error}` : 'Categoría de atleta guardada con éxito');
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
      {/* Components are bound to `form` and `field` to ensure extreme type safety */}
      {/* Use `form.AppField` to render a component bound to a single field */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
          name="fee_category_id"
          children={(field) => (
            <div className='space-y-2'>
              <field.Label htmlFor={field.name}>Categoría de tarifa</field.Label>
              <div className='flex items-center'>
                <field.Select
                  name={field.name}
                  value={field.state.value.toString()}
                  onValueChange={(e: string) => field.handleChange(Number(e))}
                >
                  <SelectTrigger
                    onBlur={() => field.handleBlur()}
                    className={!field.state.meta.isValid ? 'w-full border-destructive' : 'w-full'}
                  >
                    <SelectValue placeholder="Tarifa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tarifa</SelectLabel>
                      {feeCats.map((fc) => (
                        <SelectItem key={fc.id} value={fc.id.toString()}>{fc.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </field.Select>
              </div>

              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />
      </div>

      <form.AppField
        name="description"
        children={(field) => (
          <div className='space-y-2'>
            <field.Label htmlFor={field.name}>Descripción</field.Label>
            <field.Input
              id={field.name}
              name={field.name}
              value={field.state.value || ''}
              onChange={(e) => field.handleChange(e.target.value || null)}
              onBlur={() => field.handleBlur()}
              className={!field.state.meta.isValid ? 'border-destructive' : ''}
            />
            {!field.state.meta.isValid && (
              <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
            )}
          </div>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <form.AppField
          name="sex"
          children={(field) => (
            <div className='space-y-2'>
              <field.Label htmlFor={field.name}>Sexo</field.Label>
              <div className='flex items-center'>
                <field.Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(e: string) => field.handleChange(e)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Unisex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sexo</SelectLabel>
                      <SelectItem value={null}>Unisex</SelectItem>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </field.Select>
              </div>
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="min_age"
          children={(field) => (
            <div className='space-y-2'>
              <field.Label htmlFor={field.name}>Edad mínima</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(Number(e.target.value) || null)}
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
          name="max_age"
          children={(field) => (
            <div className='space-y-2'>
              <field.Label htmlFor={field.name}>Edad máxima</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(Number(e.target.value) || null)}
                onBlur={() => field.handleBlur()}
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

      </div>


      <form.AppField
        name="condition"
        children={(field) => (
          <div className='space-y-2'>
            <field.Label htmlFor={field.name}>Condición</field.Label>
            <field.Input
              id={field.name}
              name={field.name}
              value={field.state.value || ''}
              onChange={(e) => field.handleChange(e.target.value || null)}
              onBlur={() => field.handleBlur()}
              className={!field.state.meta.isValid ? 'border-destructive' : ''}
            />
            {!field.state.meta.isValid && (
              <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
            )}
          </div>
        )}
      />

      {/* Components in `form.AppForm` have access to the form context */}
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