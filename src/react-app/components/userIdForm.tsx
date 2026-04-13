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
import { ARUserSchema } from '@shared/apiRespTypes';


const UserIdFormSchema = ARUserSchema.pick({ 'id': true });


export const UserIdForm = ({
  userId,
  apiUrl,
}: {
  userId: string;
  apiUrl: string;
}) => {
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const form = useAppForm({
    defaultValues: { id: userId },
    validators: {
      onBlur: UserIdFormSchema,
    },
    onSubmit: async ({ value }) => {
      setError('');
      setSuccess('');
      // Scroll to top of the page when form is submitted
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const res = await postAuthenticated(apiUrl, {
        oldId: userId,
        newId: value.id,
      }, navigate);
      if (res.status !== 200) {
        setError(getMessage(res.body?.message, 'Error al actualizar el perfil'));
        setTimeout(() => {
          setError('');
        }, 1500);
        return;
      }
      setSuccess(getMessage(res.body?.message, 'Perfil actualizado correctamente'));
      setTimeout(() => {
        setSuccess('');
        navigate({ to: '/users/$userId', params: { userId: value.id }, reloadDocument: true });
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
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <form.Subscribe
          selector={(state) => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <div>
              {isSubmitting ? (
                <div className="flex gap-4 items-center space-x-2 mb-4 text-sm bg-gray-50 text-gray-600 p-3 rounded-md">
                  <Spinner /><div>Guardando...</div>
                </div>) : null
              }
            </div>
          )}
        />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-2">
          <form.AppField
            name="id"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>DNI</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
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
              <Save className="mr-2 h-4 w-4" />
              Guardar
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
              <ListRestartIcon className="mr-2 h-4 w-4" />
              Reset
            </form.Button>
          </form.AppForm>
        )}
      />
    </form>
  )
};
