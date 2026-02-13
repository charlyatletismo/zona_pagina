import { useNavigate } from "@tanstack/react-router";
import z from "zod";
import {
  ARTrainingTeamSchema,
  ARTrainingTeamIndexSchema,
  ARUserMinSchema,
} from "@shared/apiRespTypes";
import { useAppForm } from '@/lib/genForm';
import { useState } from "react";
import {
  AlertCircle,
  Save,
  ListRestartIcon,
  XCircle
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls';
import { getMessage, capitalizeStr } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { LocationForm } from './locationForm';


export const TrainingTeamForm = ({
  trainingTeam,
  dbTrainingTeams,
  dbLocations,
  onSuccess,
}: {
  trainingTeam: z.infer<typeof ARTrainingTeamSchema> | null,
  dbTrainingTeams: z.infer<typeof ARTrainingTeamIndexSchema>[],
  dbLocations: string[],
  onSuccess?: () => void,
}) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newLocation, setNewLocation] = useState(false);
  const [loadedLocations, setLoadedLocations] = useState(dbLocations);
  const [userAutoFill, setUserAutoFill] = useState<string>("");
  const path = trainingTeam
    ? `/api/trainingTeams/update/${trainingTeam.id}`
    : "/api/trainingTeams/create";

  const ExtendedTrainingTeamSchema = ARTrainingTeamSchema.extend({
    name: ARTrainingTeamSchema.shape.name.refine(
      (val) => !dbTrainingTeams.some(team => team.name === val),
      { error: "El nombre del equipo ya existe en la base de datos." }),
  })

  const form = useAppForm({
    defaultValues: trainingTeam || {
      name: "",
    },
    validators: {
      onBlur: ExtendedTrainingTeamSchema,
      onSubmitAsync: async ({ value }) => {
        if (value.coach_user_id) {
          const res = await getAuthenticatedThrow<
            z.infer<typeof ARUserMinSchema>
          >(`/api/users/exists/${value.coach_user_id}`, ARUserMinSchema);
          if (!res.body?.data) {
            return {
              form: 'Invalid data',
              fields: {
                coach_user_id: {
                  message: "El ID de entrenador indicado no corresponde a ningún usuario. Corregirlo o dejar vacío."
                },
              }
            };
          }
        }
        return null;
      }
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
      setTimeout(() => {
        setSuccess('');
        onSuccess ? onSuccess() : navigate({ to: '..', reloadDocument: true });
      }, 1000);
    },
  });

  return (
    <div>
      {newLocation && (
        <div className='mb-2 border-b-2'>
          <div className='flex justify-between px-6 pt-6'>
            <div className='text-xl font-bold flex-row md:flex-col'>
              Crear nueva localidad
            </div>
            <Button
              onClick={() => setNewLocation(false)}
              variant='outline'
            >
              <ListRestartIcon className="w-4 h-4 mr-2" />
              Cancelar crear nueva localidad
            </Button>
          </div>
          <LocationForm
            dbLocations={loadedLocations}
            location={null}
            onSuccess={async () => {
              const locationsApi = await getAuthenticatedThrow<string[]>('/api/locations', z.array(z.string()));
              setLoadedLocations(locationsApi.body?.data || []);
              setNewLocation(false);
            }}
          />
        </div>
      )}
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

          <form.AppField
            name="name"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Nombre del equipo</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Nuevo equipo de entrenamiento"
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                  required
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <form.AppField
            name="location"
            children={(field) => (
              <div className="space-y-2">
                <field.ComboBoxIdName
                  data={loadedLocations.map(loc => ({ id: loc, name: loc }))}
                  label="Localidad"
                  name={field.name}
                  value={field.state.value || ""}
                  onChange={(value) => {
                    if (value !== "new location :)") {
                      field.handleChange(value || null);
                    }
                  }}
                  onBlur={field.handleBlur}
                  placeholder="Seleccionar o escribir localidad"
                  borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                  valKey={"new location :)"}
                  valKeyDesc="Creando nueva localidad"
                  valKeySetter={() => {
                    setError('');
                    setSuccess('');
                    setNewLocation(true);
                    setTimeout(() => {
                      // Scroll to top of the page
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                  }}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* Debe indicar una localidad</div>
                )}
              </div>
            )}
          />

          <form.AppField
            name="coach_user_id"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>DNI del entrenador</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => {
                    setUserAutoFill("");
                    field.handleChange(e.target.value || null)
                  }}
                  onBlur={async (e) => {
                    field.handleBlur();
                    const val = e.target.value;
                    if (!val || val.length < 8) return;
                    setUserAutoFill("loading");
                    const res = await getAuthenticatedThrow<
                      z.infer<typeof ARUserMinSchema>
                    >(`/api/users/exists/${val}`, ARUserMinSchema);
                    if (res.body?.data) {
                      setUserAutoFill("found");
                      form.setFieldValue(
                        'coach_name',
                        capitalizeStr(`${res.body.data.name} ${res.body.data.surname}`));
                    } else {
                      setUserAutoFill("not found");
                    }
                    setTimeout(() => { setUserAutoFill(""); }, 1500);
                  }}
                  placeholder="DNI (solo si tiene cuenta)"
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
                {userAutoFill === 'loading'
                ? <Spinner className="mr-2 h-4 w-4" />
                : userAutoFill === 'not found'
                  ? (
                    <div className="flex gap-1">
                      <XCircle className="w-4 h-4 text-destructive my-auto" />
                      <span className="text-destructive text-sm my-auto">
                        Usuario no encontrado
                      </span>
                    </div>
                  )
                  : userAutoFill === 'found'
                    ? (
                      <div className="flex gap-2">
                        <span className="text-sm text-green-600">
                          Usuario encontrado y nombre autocompletado
                        </span>
                      </div>
                    )
                    : null
                }
              </div>
            )}
          />

          <form.AppField
            name="coach_name"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Nombre del entrenador</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(capitalizeStr(e.target.value) || null)}
                  onBlur={field.handleBlur}
                  placeholder="Nombre del entrenador"
                />
              </div>
            )}
          />

          <form.AppField
            name="contact_email"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Email de contacto del equipo</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  placeholder="team@example.com"
                />
              </div>
            )}
          />

          <form.AppField
            name="contact_phone"
            children={(field) => (
              <div className="space-y-2">
                <field.PhoneInput
                  label="Teléfono de contacto del equipo"
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                  showError={field.state.meta.isTouched}
                  required={false}
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
    </div>
  );
}
