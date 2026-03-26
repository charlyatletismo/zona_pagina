import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import z from 'zod';
import { useAppForm } from '@/lib/genForm';
import { getMessage, capitalizeStr } from '@/lib/utils';
import {
  ARSettingsSchema,
  ARTrainingTeamIndexSchema
} from '@shared/apiRespTypes';
import { authorizedOrg, authorizedAthMan } from '@shared/roles';
import { postAuthenticated } from '@/lib/apiCalls';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertCircle,
  Save,
  ListRestartIcon,
} from 'lucide-react';
import { UserSchema, TEMPORARY_LOCATION_ID, SHIRT_SIZES } from '@shared/types';
import { getNonOrgManagersData, managersData } from '@/lib/queryCache';


const SETTINGS_API_PATH = '/api/settings';


export const ProfileForm = ({
  profile,
  defaultManagerId,
  locations,
  trainingTeams,
  postUrl,
} : {
  profile: z.infer<typeof ARSettingsSchema> | null,
  defaultManagerId?: string | null,
  locations: string[],
  trainingTeams: z.infer<typeof ARTrainingTeamIndexSchema>[],
  postUrl: string
}) => {
  const navigate = useNavigate();

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
  const [managers, setManagers] = useState<{id: string, name: string, surname: string}[]>(
    (profile?.manager_id || defaultManagerId) ? managersData.data : []
  );
  const [showTrainingTeamTemp, setShowTrainingTeamTemp] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const mid = profile?.manager_id || defaultManagerId;
      if (mid) {
        const managers = await getNonOrgManagersData(mid);
        setManagers(managers);
      }
    }
    fetchData();
  }, [profile?.manager_id, defaultManagerId]);

  const specialFieldsShow = (
    postUrl !== SETTINGS_API_PATH
    && (
      authorizedOrg(localStorage.getItem('USER_ROLE'))
      || (
        authorizedAthMan(localStorage.getItem('USER_ROLE'))
        && profile?.special_needs
      )
    )
  );
  const specialFieldsEditable = !authorizedOrg(localStorage.getItem('USER_ROLE'));

  const form = useAppForm({
    defaultValues: profile || {
      id: '',
      name: '',
      surname: '',
      phone: '',
      email: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      manager_id: defaultManagerId || '',
    },
    validators: {
      onBlur: UserSchema,
    },
    onSubmit: async ({ value }) => {
      setError('');
      setSuccess('');
      // Scroll to top of the page when form is submitted
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const res = await postAuthenticated(postUrl, value, navigate);
      if (res.status !== 200) {
        setError(getMessage(res.body?.message, 'Error al actualizar el perfil'));
        setTimeout(() => {
          setError('');
        }, 1500);
        return;
      }
      setSuccess(getMessage(res.body?.message, 'Perfil actualizado correctamente'));
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
                  disabled={!!profile}
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
          {!!profile && ( 
            <p className="text-xs text-gray-400">El DNI no se puede cambiar. Contactar al organizador si necesita cambiarlo.</p>
          )}
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
                showError={!field.state.meta.isValid}
                required={true}
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
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
                onChange={(e) => field.handleChange(capitalizeStr(e.target.value))}
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
                onChange={(e) => field.handleChange(capitalizeStr(e.target.value))}
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
                  field.form.setFieldValue('location_temp', capitalizeStr(val));
                }}
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* Debe indicar una localidad</div>
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
                        onChange={(e) => subField.handleChange(capitalizeStr(e.target.value))}
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

        <form.AppField
          name="date_of_birth"
          children={(field) => (
            <div className="space-y-2">
              <field.Label htmlFor={field.name}>Fecha de Nacimiento</field.Label>
              <field.DatePicker
                value={field.state.value || null}
                onChange={(date) => {
                  if (date) {
                    field.handleChange(date);
                  }
                }}
                borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                onBlur={field.handleBlur}
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="clothing_shirt_size"
          children={(field) => (
            <div className='space-y-2'>
              <field.Label htmlFor={field.name}>Talle de remera</field.Label>
              <div className='flex items-center'>
                <field.Select
                  name={field.name}
                  value={field.state.value || ""}
                  onValueChange={(e) => {
                    field.handleChange(e as typeof SHIRT_SIZES[number]);
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
                      <field.SelectLabel>Talle de remera</field.SelectLabel>
                      {UserSchema.shape.clothing_shirt_size.options.map((size) => (
                        <field.SelectItem key={size} value={size}>{size}</field.SelectItem>
                      ))}
                    </field.SelectGroup>
                  </field.SelectContent>
                </field.Select>
              </div>
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        { specialFieldsShow && (
            <form.AppField
              name="special_needs"
              children={(field) => (
                <div className="space-y-2 md:col-span-2">
                  <field.Label htmlFor={field.name}>Necesidades especiales</field.Label>
                  <field.Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value || null)}
                    onBlur={() => field.handleBlur()}
                    className={!field.state.meta.isValid ? 'border-destructive' : ''}
                    placeholder="Indicar si tiene alguna necesidad especial (alergias, discapacidades, etc.)"
                    rows={3}
                    disabled={specialFieldsEditable}
                  />
                  {!field.state.meta.isValid && (
                    <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                  )}
                </div>
              )}
            />
        )}

        <form.AppField
          name="emergency_contact_name"
          children={(field) => (
            <div className="space-y-2">
              <field.Label htmlFor={field.name}>Contacto de emergencia</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(capitalizeStr(e.target.value))}
                onBlur={() => field.handleBlur()}
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
                placeholder="Nombre completo del contacto de emergencia"
                required
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="emergency_contact_phone"
          children={(field) => (
            <div className="space-y-2">
              <field.PhoneInput
                label="Celular de contacto de emergencia"
                name={field.name}
                value={field.state.value || ''}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                required={true}
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        {specialFieldsShow && (
            <form.AppField
              name="discount_percentage"
              children={(field) => (
                <div className="space-y-2 md:col-span-2">
                  <field.Label htmlFor={field.name}>Descuento en tarifas</field.Label>
                  <div className='relative'>
                    <field.Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      onBlur={() => field.handleBlur()}
                      className={
                        "w-32 "
                        + (!field.state.meta.isValid ? 'border-destructive' : '')
                      }
                      placeholder="descuento en porcentaje %"
                      disabled={specialFieldsEditable}
                    />
                    <div className='absolute left-24 top-1 text-gray-500'>
                      %
                    </div>
                  </div>
                  {!field.state.meta.isValid && (
                    <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                  )}
                </div>
              )}
            />
        )}

        <form.AppField
          name="training_team_id"
          children={(field) => (
            <div className='space-y-2'>
              <field.ComboBoxIdName
                data={trainingTeams.map(
                  team => ({
                    id: team.id!.toString(),
                    name: team.name
                  }))}
                label="Equipo de entrenamiento"
                name={field.name}
                value={field.state.value?.toString() || ""}
                onChange={(value) => {
                  if (value === "-1") {
                    return;
                  }
                  field.handleChange(value ? Number(value) : null);
                  if (value !== null) {
                    field.form.setFieldValue('training_team_temp', null);
                    setShowTrainingTeamTemp(false);
                  }
                }}
                onBlur={field.handleBlur}
                valKey={"-1"}
                valKeyDesc="Otro (especificar debajo)"
                valKeySetter={(val) => {
                  field.form.setFieldValue('training_team_temp', val);
                  setShowTrainingTeamTemp(true);
                }}
                placeholder="Seleccionar o escribir equipo de entrenamiento"
                borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* Debe indicar un equipo de entrenamiento</div>
              )}

              {showTrainingTeamTemp && (
                <form.AppField
                  name="training_team_temp"
                  children={(field) => (
                    <div className="mt-2">
                      <field.Input
                        id={field.name}
                        name={field.name}
                        placeholder="Especificar equipo de entrenamiento"
                        value={field.state.value || ''}
                        onChange={(e) => field.handleChange(e.target.value || null)}
                        onBlur={field.handleBlur}
                        className={!field.state.meta.isValid ? 'border-destructive' : ''}
                      />
                      {!field.state.meta.isValid && (
                        <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message}</div>
                      )}
                    </div>
                  )}
                />
              )}
            </div>
          )}
        />


        <form.AppField
          name="manager_id"
          children={(field) => (
            <div className='space-y-2'>
              <field.ComboBoxIdName
                data={managers.map(
                  manager => ({
                    id: manager.id,
                    name: `${manager.surname} ${manager.name}`
                  }))}
                label="Manager"
                name={field.name}
                value={field.state.value?.toString() || ""}
                onChange={(value) => {
                  field.handleChange(value || null);
                }}
                onChangeSearch={async (value) => {
                  if (value.length >= 3) {
                    const res = await getNonOrgManagersData(value)
                    setManagers(res);
                  }
                }}
                onBlur={field.handleBlur}
                placeholder="DNI o últimos 3 dígitos"
                borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
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
                setShowTrainingTeamTemp(false);
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
