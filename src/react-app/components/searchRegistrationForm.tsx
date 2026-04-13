import { useState } from 'react';
import { useAppForm } from '@/lib/genForm';
import { getMessage } from '@/lib/utils';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertCircle,
  ListRestartIcon,
  SearchIcon,
} from 'lucide-react';
import { ARSportingEventRegistrationMinSchema } from '@shared/apiRespTypes';
import z from 'zod';


const SearchSchema = z.object({
  user_id: z.string().min(3, 'Ingrese al menos 3 dígitos del DNI').optional(),
  bib_number: z.number().positive('El número de dorsal debe ser positivo').optional(),
}).refine((data) => data.user_id || data.bib_number, {
  message: 'Ingrese al menos un criterio de búsqueda (DNI o número de dorsal)',
});


export const SearchRegistrationForm = ({
  eventId,
  setData,
}: {
  eventId: number;
  setData: (data: z.infer<typeof ARSportingEventRegistrationMinSchema>[]) => void;
}) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const form = useAppForm({
    validators: {
      onBlur: SearchSchema,
    },
    onSubmit: async ({ value }: { value: z.infer<typeof SearchSchema> }) => {
      setError('');
      setSuccess('');

      const res = await getAuthenticatedThrow<
        z.infer<typeof ARSportingEventRegistrationMinSchema>[]
      >(
        `/api/sportingEvents/${eventId}/paidRegistrations`
        + `?partialUserId=${value.user_id || ''}`
        + `&bib=${value.bib_number || ''}`,
        z.array(ARSportingEventRegistrationMinSchema),
      );
      if (res.status !== 200) {
        setError(getMessage(res.body?.message, 'Error al buscar la inscripción'));
        setTimeout(() => {
          setError('');
        }, 1500);
        return;
      }
      if (res.body?.data?.length === 0) {
        setError('No se encontraron inscripciones');
        setTimeout(() => {
          setError('');
        }, 1500);
        setData([]);
        return;
      }
      setSuccess(getMessage(res.body?.message, 'Inscripciones encontradas'));
      setTimeout(() => {
        setSuccess('');
      }, 1000);
      setData(res.body.data || []);
    }
  });

  return (
    <form
      className="p-6 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {error && (
        <div className="mb-4 bg-red-500/10 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-500/10 text-green-600 p-3 rounded-md text-sm">
          {success}
        </div>
      )}

      <form.Subscribe
        selector={(state) => [state.isSubmitting]}
        children={([isSubmitting]) => (
          <div>
            {isSubmitting ? (
              <div className="flex gap-4 items-center space-x-2 mb-4 text-sm bg-muted text-muted-foreground p-3 rounded-md">
                <Spinner /><div>Buscando...</div>
              </div>) : null
            }
          </div>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <form.AppField
          name="user_id"
          children={(field) => (
            <div className="space-y-2">
              <field.Label htmlFor={field.name}>DNI (últimos 3 dígitos)</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value || undefined)}
                onBlur={field.handleBlur}
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="bib_number"
          children={(field) => (
            <div className="space-y-2">
              <field.Label htmlFor={field.name}>Número de dorsal</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : undefined)}
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
        selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
        children={([canSubmit, isSubmitting, isPristine]) => (
          <form.AppForm>
            <form.Button
              type="submit"
              disabled={!canSubmit || isPristine || isSubmitting}
              className='mr-2 mt-5'
            >
              <SearchIcon className="mr-2 h-4 w-4" />
              Buscar
            </form.Button>
            <form.Button
              type="reset"
              variant="outline"
              disabled={isPristine || isSubmitting}
              onClick={(event) => {
                event.preventDefault();
                form.reset();
                setData([]);
              }}
            >
              <ListRestartIcon className="mr-2 h-4 w-4" />
              Reset
            </form.Button>
          </form.AppForm>
        )}
      />
    </form>
  )
};
