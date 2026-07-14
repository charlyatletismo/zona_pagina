import { useNavigate } from "@tanstack/react-router";
import z from "zod";
import { LocationSchema } from "@shared/types";
import { useAppForm } from '@/lib/genForm';
import { useState } from "react";
import {
  AlertCircle,
  Save,
  ListRestartIcon,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { postAuthenticated } from "@/lib/apiCalls";
import { getMessage, capitalizeStr } from "@/lib/utils";


export const LocationForm = ({
  location,
  dbLocations,
  onSuccess,
} : {
  location: z.infer<typeof LocationSchema> | null,
  dbLocations: string[],
  onSuccess?: (locationId?: string) => Promise<void>,
}) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const path = (location && location.id)
    ? `/api/locations/update/${location.id}`
    : "/api/locations/create";

  const ExtendedLocationSchema = LocationSchema.extend({
    id: LocationSchema.shape.id.refine(
      (val) => !dbLocations.includes(val),
      {error: "La ubicación ya existe en la base de datos."}),
  })


  const form = useAppForm({
    defaultValues: location || {
      id: "",
      locality: "",
      province: "",
      country: "Argentina",
      latitude: null,
      longitude: null,
    },
    validators: {
      onBlur: ExtendedLocationSchema,
    },
    onSubmit: async ({ value }) => {
      setError('');
      setSuccess('');
      // Scroll to top of the page when form is submitted
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const res = await postAuthenticated(path, value, navigate)
      if (res.status !== 200) {
        setError(getMessage(res.body?.message, 'Error al guardar'));
        setTimeout(() => {
          setError('');
        }, 1500);
        return;
      }
      setSuccess(getMessage(res.body?.message, 'Guardado con éxito'));
      setTimeout(async () => {
        setSuccess('');
        if (onSuccess !== undefined) {
          await onSuccess(value.id);
        } else {
          navigate({ to: '..', reloadDocument: true });
        }
      }, 1000);
    },
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
                <div className="flex gap-4 items-center space-x-2 mb-4 text-sm bg-gray-50 text-gray-600 p-3 rounded-md">
                  <Spinner /><div>Guardando...</div>
                </div>) : null
              }
            </div>
          )}
        />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <form.AppField
          name="id"
          children={(field) => (
            <div className="space-y-2 col-span-2">
              <field.Label htmlFor={field.name}>Ubicación completa final</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                disabled={true}
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="locality"
          children={(field) => (
            <div className="space-y-2">
              <field.Label htmlFor={field.name}>Localidad</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onChange={(e) => {
                  const val = capitalizeStr(e.target.value);
                  field.handleChange(val);
                  field.form.setFieldValue('id', [
                    val,
                    field.form.state.values.province || '',
                    field.form.state.values.country || ''
                  ].join(", "))
                }}
                onBlur={field.handleBlur}
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
                placeholder="Villa Constitución"
                required
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="province"
          children={(field) => (
            <div className="space-y-2">
              <field.Label htmlFor={field.name}>Provincia</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onChange={(e) => {
                  const val = capitalizeStr(e.target.value);
                  field.handleChange(val);
                  field.form.setFieldValue('id', [
                    field.form.state.values.locality || '',
                    val,
                    field.form.state.values.country || ''
                  ].join(", "))
                }}
                onBlur={field.handleBlur}
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
                placeholder="Santa Fe"
                required
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="country"
          children={(field) => (
            <div className="space-y-2">
              <field.Label htmlFor={field.name}>País</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onChange={(e) => {
                  const val = capitalizeStr(e.target.value);
                  field.handleChange(val);
                  field.form.setFieldValue('id', [
                    field.form.state.values.locality || '',
                    field.form.state.values.province || '',
                    val,
                  ].join(", "))
                }}
                onBlur={field.handleBlur}
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
                placeholder="Argentina"
                required
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <div className="col-span-2 flex md:flex-row flex-col md:space-x-6 space-y-4 md:space-y-0 mx-auto mt-3 pt-3">
          <form.AppField
            name="latitude"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Latitud (opcional)</field.Label>
                  <field.Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value?.toString() || ''}
                    onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : null)}
                    onBlur={field.handleBlur}
                    className={!field.state.meta.isValid ? 'border-destructive' : ''}
                    placeholder="-62.1523"
                  />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
          <form.AppField
            name="longitude"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Longitud (opcional)</field.Label>
                  <field.Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value?.toString() || ''}
                    onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : null)}
                    onBlur={() => field.handleBlur()}
                    className={!field.state.meta.isValid ? 'border-destructive' : ''}
                    placeholder="-32.1523"
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
  );
}
