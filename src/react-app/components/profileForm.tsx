import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import z from 'zod';
import { useAppForm } from '@/lib/genForm';
import { cn, getMessage } from '@/lib/utils';
import { SettingsSchema } from '@shared/apiRespTypes';
import { postAuthenticated } from '@/lib/apiCalls';
import { Spinner } from '@/components/ui/spinner';
import {
  AlertCircle,
  Save,
  ListRestartIcon,
  ChevronsUpDown,
  Check,
  ScanFaceIcon,
} from 'lucide-react';


export const ProfileForm = ({ profile, locations, postUrl }: { profile: z.infer<typeof SettingsSchema>, locations: string[], postUrl: string }) => {
  const navigate = useNavigate();

  const now = new Date();
  const minAgeRequired = 13;
  const maxDateOfBirth = new Date(
    now.getFullYear() - minAgeRequired,
    now.getMonth(),
    now.getDate()
  );

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* Combobox open/closed state */
  const [openLocations, setOpenLocations] = useState(false);
  const [otherLocation, setOtherLocation] = useState(false);

  const lowerAndRemoveDiacritics = (s: string) => {
    // Normalize the string to the NFD form, separating base characters from diacritics.
    // The 'g' flag ensures global replacement (all occurrences).
    // The 'u' flag enables Unicode property escapes like \p{Diacritic}.
    return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  }
  const capitalize = (s: string) => {
    if (s.length === 0) return s;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  const form = useAppForm({
    defaultValues: profile,
    validators: {
      onBlur: SettingsSchema.required().extend({
        date_of_birth: z.date().max(
          maxDateOfBirth, `Debe tener al menos 13 años`
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
      if (postUrl === '/api/settings') {
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
                  onValueChange={(e: string) => field.handleChange(e)}
                >
                  <field.SelectTrigger className="w-full">
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
              <field.Label htmlFor={field.name}>Localidad</field.Label>
              <field.Popover
                open={openLocations}
                onOpenChange={setOpenLocations}
              >
                <field.PopoverTrigger asChild>
                  <form.Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openLocations}
                    className={`w-full justify-between ${!field.state.meta.isValid ? 'border-destructive' : ''}`}
                  >
                    <div className='w-full overflow-hidden text-left'>
                      {!otherLocation
                        ? (field.state.value || '...')
                        : 'Otra (especificar debajo)'}
                    </div>
                    <ChevronsUpDown className="opacity-50" />
                  </form.Button>
                </field.PopoverTrigger>
                <field.PopoverContent className="w-auto p-0">
                  <field.Command
                    filter={(value, search) => {
                      if (
                        lowerAndRemoveDiacritics(value)
                          .includes(lowerAndRemoveDiacritics(search))) return 1
                      return 0
                    }}
                  >
                    <field.CommandInput placeholder="Buscar localidad..." lang='es' />
                    <field.CommandList>
                      <field.CommandEmpty
                        className={
                          'hover:bg-amber-100 cursor-pointer '
                          + 'text-center text-wrap text-sm '
                          + 'm-2 px-4 py-2 rounded '
                          + ''
                        }
                        onClick={() => {
                          field.handleChange('');
                          setOpenLocations(false);
                          setOtherLocation(true);
                        }}
                      >
                        <div>
                          No se encontró la localidad
                        </div>
                        <div>
                          Solicitar crearla
                        </div>
                        <ScanFaceIcon className="inline-block mt-2 mb-1 w-4 h-4 animate-bounce" />
                      </field.CommandEmpty>
                      <field.CommandGroup>
                        {locations.map((location) => (
                          <field.CommandItem
                            key={location}
                            value={location}
                            onSelect={(value) => {
                              field.handleChange(value);
                              field.form.setFieldValue('location_temp', '');
                              setOpenLocations(false);
                              setOtherLocation(false);
                            }}
                            className={field.state.value === location ? "bg-green-100" : ""}
                          >
                            {location}
                            <Check
                              className={cn(
                                "ml-auto",
                                field.state.value === location ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </field.CommandItem>
                        ))}
                      </field.CommandGroup>
                    </field.CommandList>
                  </field.Command>
                </field.PopoverContent>
              </field.Popover>
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* Debe indicar una</div>
              )}
              {otherLocation && (
                <form.AppField
                  name="location_temp"
                  children={(subField) => (
                    <div className="mt-2">
                      <subField.Input
                        id={subField.name}
                        name={subField.name}
                        placeholder="Especificar localidad"
                        value={subField.state.value || ''}
                        onChange={(e) => subField.handleChange(e.target.value)}
                        onBlur={() => subField.handleBlur()}
                        className={!subField.state.meta.isValid ? 'border-destructive' : ''}
                        required={otherLocation}
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
                event.preventDefault()
                form.reset()
                setOtherLocation(false);
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
