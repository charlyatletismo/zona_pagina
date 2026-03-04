import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppForm } from '@/lib/genForm';
import { getMessage } from '@/lib/utils';
import { postAuthenticated } from '@/lib/apiCalls';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertCircle,
  Save,
  ListRestartIcon,
} from 'lucide-react';
import { ChipSchema } from '@shared/types';
import z from 'zod';
import { removeDiacritics } from '@/lib/utils';


export const ChipsForm = ({
  chipsData,
}: {
  chipsData: z.infer<typeof ChipSchema> | null;
}) => {
  const navigate = useNavigate();

  const postApiUrl = (chipsData && chipsData.id) ? `/api/chips/${chipsData.id}` : '/api/chips';

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const form = useAppForm({
    defaultValues: chipsData || undefined,
    validators: {
      onBlur: ChipSchema,
    },
    onSubmit: async ({ value }) => {
      setError('');
      setSuccess('');

      const res = await postAuthenticated(postApiUrl, value, navigate);
      if (res.status !== 200) {
        setError(getMessage(res.body?.message, 'Error al actualizar los chips'));
        setTimeout(() => {
          setError('');
        }, 1500);
        return;
      }
      setSuccess(getMessage(res.body?.message, 'Chips actualizados correctamente'));
      setTimeout(() => {
        setSuccess('');
        navigate({ to: '.', reloadDocument: true });
      }, 1000);
    }
  });

  return (
    <form
      className="p-6 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
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

        <form.Subscribe
          selector={(state) => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <div>
              {isSubmitting ? (
                <div className="flex gap-4 items-center space-x-2 mb-4 text-sm bg-muted text-muted-foreground p-3 rounded-md">
                  <Spinner /><div>Guardando...</div>
                </div>) : null
              }
            </div>
          )}
        />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        <div className="space-y-2">
          <form.AppField
            name="prefix"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Prefijo</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(
                    removeDiacritics(e.target.value)
                    .toUpperCase()
                    .replace(/[0-9]/g, '')
                  )}
                  onBlur={field.handleBlur}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <form.AppField
            name="padding_n"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Relleno numérico</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => {
                    if (isNaN(Number(e.target.value))) return;
                    field.handleChange(Number(e.target.value))
                  }}
                  onBlur={field.handleBlur}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <form.AppField
            name="start"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Inicio numeración</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => {
                    if (isNaN(Number(e.target.value))) return;
                    field.handleChange(Number(e.target.value))
                  }}
                  onBlur={field.handleBlur}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <form.AppField
            name="end"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Fin numeración</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => {
                    if (isNaN(Number(e.target.value))) return;
                    field.handleChange(Number(e.target.value))
                  }}
                  onBlur={field.handleBlur}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        </div>


      <form.Subscribe
        selector={(state) => [state.values.prefix, state.values.padding_n, state.values.start, state.values.end]}
        children={([prefix, padding_n, start, end]) => (
          <div className="space-y-2 col-span-2 md:col-span-4">
            <div>Ejemplos</div>
            <div className='text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='flex flex-col'>
                  <div>Prefijo: CH | Relleno: 5 | Inicio: 1 | Fin: 5</div>
                  <div>CH00001, ..., CH00003, ..., CH00005</div>
                </div>
                <div className='flex flex-col'>
                  <div>Con los datos del formulario</div>
                  <div>
                    {`${prefix}${String(Number(start)).padStart(Number(padding_n), '0')}`}
                    , ..., {`${prefix}${String(Number(start) + Math.floor((Number(end) - Number(start)) / 2)).padStart(Number(padding_n), '0')}`}
                    , ..., {`${prefix}${String(Number(end)).padStart(Number(padding_n), '0')}`}
                  </div>
                </div>
            </div>
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
              className={
                'mr-2 mt-2' +
                ((!chipsData || !chipsData.id)
                  ? ' bg-green-500 hover:bg-green-600'
                  : '')}
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  ...
                </>
              ) : (chipsData && chipsData.id) ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Crear
                </>
              )}
            </form.Button>
            <form.Button
              type="reset"
              variant="outline"
              disabled={isPristine || isSubmitting}
              onClick={(event) => {
                event.preventDefault();
                form.reset();
              }}
            >
              <>
                <ListRestartIcon className="mr-2 h-4 w-4" />
                Reset
              </>
            </form.Button>
          </form.AppForm>
        )}
      />
    </form>
  )
};
