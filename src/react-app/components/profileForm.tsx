import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import z from 'zod';
import { useAppForm } from '@/lib/genForm';
import { getMessage } from '@/lib/utils';
import { SettingsSchema, TrainingTeamsApiResponseSchema } from '@shared/apiRespTypes';
import { authorizedOrg, authorizedAthMan } from '@shared/roles';
import { postAuthenticated } from '@/lib/apiCalls';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertCircle,
  Save,
  ListRestartIcon,
  ChevronDown,
} from 'lucide-react';
import { TEMPORARY_LOCATION_ID } from '@shared/types';


const SETTINGS_API_PATH = '/api/settings';


export const ProfileForm = ({
  profile,
  locations,
  trainingTeams,
  postUrl
} : {
  profile: z.infer<typeof SettingsSchema>,
  locations: string[],
  trainingTeams: z.infer<typeof TrainingTeamsApiResponseSchema>,
  postUrl: string
}) => {
  const navigate = useNavigate();

  const now = new Date();
  const minAgeRequired = 13;
  const maxDateOfBirth = new Date(
    now.getFullYear() - minAgeRequired,
    now.getMonth(),
    now.getDate()
  );
  if (profile.date_of_birth) {
    profile.date_of_birth = SettingsSchema
      .shape
      .date_of_birth
      .parse(profile.date_of_birth);
  }
  if (locations) {
    locations.sort((a, b) => {
      // const coA = a.split(", ")[2];
      // const coB = b.split(", ")[2];
      // if (coA !== coB) {
      //   return coA.localeCompare(coB);
      // }
      const provA = a.split(", ")[1];
      const provB = b.split(", ")[1];
      if (provA !== provB) {
        return provA.localeCompare(provB);
      }
      return a.localeCompare(b);
    });
  }

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [openDOB, setOpenDOB] = useState(false);

  const specialFieldsShow = (
    postUrl !== SETTINGS_API_PATH
    && (
      authorizedOrg(localStorage.getItem('USER_ROLE'))
      || (
        authorizedAthMan(localStorage.getItem('USER_ROLE'))
        && profile.special_needs
      )
    )
  );
  const specialFieldsEditable = !authorizedOrg(localStorage.getItem('USER_ROLE'));

  const capitalize = (s: string) => {
    if (s.length === 0) return s;
    return s.split(" ")
      .map(word =>
        word.charAt(0).toUpperCase()
        + word.slice(1).toLowerCase()
      )
      .join(" ");
  }

  const form = useAppForm({
    defaultValues: profile,
    validators: {
      onBlur: SettingsSchema.required().extend({
        date_of_birth: z.date({
          error: "Debes indicar tu fecha de nacimiento"
        }).max(
          maxDateOfBirth, `Debes tener al menos ${minAgeRequired} años`
        ),
      })
    },
    onSubmit: async ({ value }) => {
      setError('');
      setSuccess('');
      // Scroll to top of the page when form is submitted
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const res = await postAuthenticated(postUrl, value, navigate);
      if (res.status !== 200) {
        setError(getMessage(res.body?.message, 'Error al actualizar el perfil'));
        return;
      }
      setSuccess('Perfil actualizado correctamente');
      let req = '';
      if (postUrl === SETTINGS_API_PATH) {
        // only for profile settings update
        req = localStorage.getItem('REQUIRE_PROFILE_UPDATE') || '';
        localStorage.setItem('REQUIRE_PROFILE_UPDATE', '');
      }
      setTimeout(() => {
        setSuccess('');
        if (req === 'true') {
          navigate({ to: '/', reloadDocument: true });
        } else {
          navigate({ to: '..', reloadDocument: true });
        }
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
              <div className='flex gap-4 items-center space-x-2 mb-4 text-sm text-gray-600'>
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
                  disabled={true}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
          <p className="text-xs text-gray-400">El DNI no se puede cambiar. Contactar al administrador si necesita cambiarlo.</p>
        </div>

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
                required={true}
                error={!field.state.meta.isValid ? field.state.meta.errors[0]?.message : undefined}
              />
            </div>
          )}
        />

        <form.AppField
          name="name"
          children={(field) => (
            <div className="space-y-2">
              <field.Label htmlFor={field.name}>Nombre</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(capitalize(e.target.value))}
                onBlur={() => field.handleBlur()}
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
                placeholder="Tu nombre"
                required
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="surname"
          children={(field) => (
            <div className="space-y-2">
              <field.Label htmlFor={field.name}>Apellido</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(capitalize(e.target.value))}
                onBlur={() => field.handleBlur()}
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
                placeholder="Tu apellido"
                required
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="email"
          children={(field) => (
            <div className="space-y-2">
              <field.Label htmlFor={field.name}>Email</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={() => field.handleBlur()}
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
                placeholder="ejemplo@correo.com"
                required
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="sex"
          children={(field) => (
            <div className='space-y-2'>
              <field.Label htmlFor={field.name}>Sexo</field.Label>
              <div className='flex items-center'>
                <field.Select
                  name={field.name}
                  value={field.state.value || ""}
                  onValueChange={(e: string) => {
                    field.handleChange(e);
                    field.handleBlur();
                  }}
                  onOpenChange={(o) => {
                    if (!o) {
                      field.handleBlur();
                    }
                  }}
                >
                  <field.SelectTrigger className={"w-full " + (!field.state.meta.isValid ? 'border-destructive' : '')}>
                    <field.SelectValue placeholder="..." />
                  </field.SelectTrigger>
                  <field.SelectContent>
                    <field.SelectGroup>
                      <field.SelectLabel>Sexo</field.SelectLabel>
                      <field.SelectItem value="M">Hombre</field.SelectItem>
                      <field.SelectItem value="F">Mujer</field.SelectItem>
                    </field.SelectGroup>
                  </field.SelectContent>
                </field.Select>
              </div>
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* Debe seleccionar uno</div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="location"
          children={(field) => (
            <div className="space-y-2">
              <field.ComboBoxIdName
                data={locations.map(loc => ({id: loc, name: loc}))}
                label="Localidad"
                name={field.name}
                value={field.state.value || ""}
                onChange={(value) => {
                  field.handleChange(value);
                  if (value !== TEMPORARY_LOCATION_ID) {
                    field.form.setFieldValue('location_temp', '');
                  }
                }}
                onBlur={field.handleBlur}
                placeholder="Seleccionar o escribir localidad"
                borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                valKey={TEMPORARY_LOCATION_ID}
                valKeyDesc="Otra (especificar debajo)"
                valKeySetter={(val) => {
                  field.form.setFieldValue('location_temp', capitalize(val));
                }}
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* Debe indicar una</div>
              )}
              {field.state.value === TEMPORARY_LOCATION_ID && (
                <form.AppField
                  name="location_temp"
                  children={(subField) => (
                    <div className="mt-2">
                      <subField.Input
                        id={subField.name}
                        name={subField.name}
                        placeholder="Especificar localidad"
                        value={subField.state.value || ''}
                        onChange={(e) => subField.handleChange(capitalize(e.target.value))}
                        onBlur={() => subField.handleBlur()}
                        className={!subField.state.meta.isValid ? 'border-destructive' : ''}
                        required={field.state.value === TEMPORARY_LOCATION_ID}
                      />
                      {!subField.state.meta.isValid && (
                        <div className='ml-auto text-xs text-destructive'>* Debe indicar una</div>
                      )}
                    </div>
                  )}
                />
              )}
            </div>
          )}
        />

        <form.AppField
          name="location_address"
          children={(field) => (
            <div className="space-y-2">
              <field.Label htmlFor={field.name}>Dirección</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={() => field.handleBlur()}
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
                placeholder="Calle, altura, piso, departamento, etc."
                required
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

      {/* ******* TODO ******* */}
      {/* Imagen de perfil: NO por ahora */}
      {/* Fecha de nacimiento */}
      {/* Contacto de emergencia: Nombre */}
      {/* Contacto de emergencia: Celular */}
      {/* Talle de remera */}
      {/* Special needs */}
      {/* Porcentaje de descuento */}
      {/* Equipo de entrenamiento */}
      {/* Idioma */}

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
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
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
