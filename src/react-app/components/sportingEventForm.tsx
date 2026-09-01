import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Save, AlertCircle, MapPinnedIcon, Trash2, ListRestartIcon, PlusIcon } from 'lucide-react';
import { getLang, getMessage, capitalizeStr } from '@/lib/utils';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls';
import z from 'zod';
import { useAppForm } from '@/lib/genForm';
import {
  SportingEventSchema,
  SportingEventClothingSchema,
  CLOTHING_TYPES,
  SHIRT_NOT_INCLUDED,
} from '@shared/types';
import {
  SportingEventTypesEnumDescriptions,
} from '@shared/lang';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { DeleteButton } from './deleteButton';
import { LocationForm } from './locationForm';
// import { SCHEDULE_TEMPLATE_IDS } from '@shared/schedules';
import { FormErrorsCard } from './formErrorsCard';
import { HelpTooltip } from './helpTooltip';


const getClothesByType = (
  clothingArray: z.infer<typeof SportingEventClothingSchema>[] | null,
) => {
  if (!clothingArray) return [];
  const clothesByType = clothingArray.reduce((acc, clothingItem, index) => {
    if (clothingItem.clothing_type === undefined) return acc;
    const i = acc.some((e) => e.key === clothingItem.clothing_type)
    if (i) {
      acc.forEach((e) => {
        if (e.key === clothingItem.clothing_type) {
          e.data.push({ ...clothingItem, index });
        }
      });
    } else {
      acc.push({ key: clothingItem.clothing_type, data: [{ ...clothingItem, index }] });
    }
    return acc;
  }, [] as {
      key: string,
      data: (
        z.infer<typeof SportingEventClothingSchema>
        & { index: number }
      )[]
    }[]
  )
  return clothesByType;
}


const SportingEventForm = (
    { data, locations } : {
    data: z.infer<typeof SportingEventSchema> | null,
    locations: string[],
    }) => {
  const navigate = useNavigate();
  const apiEndpointPath = data
    ? `/api/sportingEvents/update/${data.id}`
    : '/api/sportingEvents/create';

  const [newLocation, setNewLocation] = useState(false);
  const [loadedLocations, setLoadedLocations] = useState(locations);
  const [moreOptions, setMoreOptions] = useState(false);
  const [freezeClothing, setFreezeClothing] = useState((!!data?.clothing) && data.clothing.length > 0);

  const form = useAppForm({
    defaultValues: data,
    validators: {
      onBlur: SportingEventSchema,
    },
    onSubmit: async ({ value }) => {
      setError('');
      setSuccess('');
      // Scroll to top of the page when form is submitted
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (!value) {
        setError('Por favor, ingrese algún dato antes de enviar el formulario.')
        setTimeout(() => {
          setError('');
        }, 1500);
        return;
      }
      const res = await postAuthenticated<number | undefined>(apiEndpointPath, value, navigate);
      if (res.status !== 200) {
        setError(getMessage(res.body?.message, 'Error al guardar los cambios'));
        setTimeout(() => {
          setError('');
        }, 1500);
        return;
      }
      setSuccess(getMessage(res.body?.message, 'Cambios guardados con éxito'));
      setTimeout(() => {
        setSuccess('');
        navigate({ to: `/sportingEvents/${res.body.data || data?.id}`, reloadDocument: true });
      }, 1000);
    }
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        className="px-6 pb-6 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        {error && (
          <div className="mt-5 bg-red-500/10 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 bg-green-500/10 text-green-600 p-3 rounded-md text-sm">
            {success}
          </div>
        )}

        <form.Subscribe
          selector={(state) => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <div>
              {isSubmitting ? (
                <div className="mt-5 mb-4 bg-muted text-muted-foreground p-3 rounded-md text-sm flex gap-4 items-center space-x-2">
                  <Spinner /><div>Guardando...</div>
                </div>) : null
              }
            </div>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <form.AppField
            name="title"
            children={(field) => (
              <div className='space-y-2 md:col-span-2'>
                <field.Label htmlFor={field.name}>Título del Evento</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Mi Evento Deportivo"
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
            name="date"
            children={(field) => (
              <div className='space-y-2'>
                <field.Label htmlFor={field.name}>Fecha del Evento</field.Label>
                <field.DatePicker
                  borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                  value={field.state.value}
                  onChange={(d) => {
                    if (!d) return;
                    field.handleChange(d)
                  }}
                  onBlur={field.handleBlur}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <form.AppField
            name="event_type"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Tipo de Evento</field.Label>
                <field.SelectCustom
                  id={field.name}
                  name={field.name}
                  options={
                    SportingEventSchema.shape.event_type.options.map((evtype) => ({
                      label: SportingEventTypesEnumDescriptions[evtype][getLang()],
                      value: evtype
                    }))
                  }
                  value={field.state.value || ""}
                  borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                  onChange={(e) => {
                    const r = SportingEventSchema.shape.event_type.safeParse(e)
                    if (r.success) {
                      field.handleChange(r.data);
                    } else {
                      field.handleChange("other");
                    }
                    field.handleBlur();
                  }}
                  onBlur={field.handleBlur}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          {/* <form.AppField
            name="photo_id"
            children={(field) => (
              <div className='space-y-2 md:col-span-2'>
                <field.Label htmlFor={field.name}>Banner del Evento</field.Label>
                <img src={field.state.value || ''} alt="Banner del Evento" className='w-full h-48 object-cover rounded-md border border-gray-300' />
                
                <Button type="button" variant="outline" className='cursor-pointer'>
                  Cambiar banner
                </Button>
                
              </div>
            )}
          /> */}

          <form.AppField
            name="description"
            children={(field) => (
              <div className="space-y-2 md:col-span-2">
                <field.Label htmlFor={field.name}>Descripción</field.Label>
                <field.Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                  placeholder="Descripción del evento (opcional)"
                  rows={3}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <form.AppField
            name="registration_start"
            children={(field) => (
              <div className='space-y-2'>
                <field.Label htmlFor={field.name}>Inicio de Inscripciones</field.Label>
                <field.DateTimePicker
                  name={field.name}
                  borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <form.AppField
            name="registration_end"
            children={(field) => (
              <div className='space-y-2'>
                <field.Label htmlFor={field.name}>Fin de Inscripciones</field.Label>
                <field.DateTimePicker
                  name={field.name}
                  borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <form.AppField
            name="age_ranges"
            children={(field) => (
              <div className='space-y-2'>
                <field.Label htmlFor={field.name}>Rangos de Edad</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => {
                    let inputValue = e.target.value;
                    if (inputValue && inputValue.slice(-1) === "," && field.state.value?.slice(-2) === ",0") {
                      inputValue = inputValue.slice(0, -1);
                    }
                    const finalValue = inputValue
                      ? inputValue.split(",").map(s => s.trim()).map(Number)
                      : null;
                    if (finalValue?.some(isNaN) || finalValue?.some(num => num.toString().includes("."))) {
                      // Handle invalid numbers if needed
                      return;
                    }
                    field.handleChange(finalValue?.join(",") || null);
                  }}
                  onBlur={() => {
                    if (field.state.value !== null && field.state.value !== undefined) {
                      // console.log('Sorting age ranges:', field.state.value);
                      field.handleChange(field.state.value.split(",").map(Number).sort((a,b) => a-b).join(","))
                      // console.log('finished age ranges:', field.state.value);
                    }
                    field.handleBlur();
                  }}
                  placeholder="18,25,30,40,50,60,70,80"
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <hr className='md:col-span-2' />

          <div className="md:col-span-2 text-lg font-semibold my-auto">Tarifas</div>

          <form.AppField
            name="mercadopago_enabled"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>
                  Habilitar MercadoPago
                  <HelpTooltip content={
                    "Para cambiar de cuenta de MP a la que llegan los fondos debe "
                    + "ir a Mercado Pago, y con su cuenta de empresa crear una aplicación y "
                    + "generar las credenciales API (Secret Key y Access Token) "
                    + "y luego ingresar esos datos en las variables de entorno "
                    + "correspondientes de Cloudflare y hacer un nuevo deploy del proyecto."}
                    />
                </field.Label>
                <field.Switch
                  id={field.name}
                  name={field.name}
                  checked={field.state.value || false}
                  onCheckedChange={(e) => field.handleChange(e)}
                />
                <div className='text-xs'>La cuenta de Mercado Pago puede ser DISTINTA que la cuenta del alias.</div>
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <form.AppField
            name="bank_alias"
            children={(field) => (
              <div className='space-y-2'>
                <field.Label htmlFor={field.name}>Alias Bancario para Transferencias</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  placeholder="alias.bancario"
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <form.AppField
            name="fee_amount"
            children={(field) => (
              <div className='space-y-2'>
                <field.Label htmlFor={field.name}>Costo de Inscripción</field.Label>
                <div className='relative'>
                  <field.Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : null)}
                    onBlur={field.handleBlur}
                    className={!field.state.meta.isValid ? 'border-destructive' : 'pl-5'}
                  />
                  <div className='absolute left-2 top-1 text-gray-500'>
                    $
                  </div>
                </div>
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <form.AppField
            name="fee_payment_due_date"
            children={(field) => (
              <div className='space-y-2'>
                <field.Label htmlFor={field.name}>Vencimiento del Pago</field.Label>
                <field.DateTimePicker
                  name={field.name}
                  borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <form.AppField
            name="fee_amount_promotional"
            children={(field) => (
              <div className='md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2 mt-5 md:mt-0'>
                  <field.Label htmlFor={field.name}>Costo Promocional de Inscripción</field.Label>
                  <div className='relative'>
                    <field.Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : null)}
                      onBlur={() => {
                        if (field.state.value === null || field.state.value === undefined) {
                          field.form.setFieldValue('promotional_fee_end', null);
                          field.form.setFieldValue('promotional_fee_payment_due_date', null);
                        }
                        field.handleBlur()
                      }}
                      className={!field.state.meta.isValid ? 'border-destructive' : 'pl-5'}
                    />
                    <div className='absolute left-2 top-1 text-gray-500'>
                      $
                    </div>
                  </div>
                  {!field.state.meta.isValid && (
                    <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                  )}
                </div>
                {field.state.value && (
                  <form.AppField
                    name="promotional_fee_payment_due_date"
                    children={(field) => (
                      field.form.state.values?.fee_amount_promotional ? 
                        <div className='space-y-2'>
                          <field.Label htmlFor={field.name}>Vencimiento del Pago Promocional</field.Label>
                          <field.DateTimePicker
                            name={field.name}
                            borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                            value={field.state.value}
                            onChange={field.handleChange}
                            onBlur={field.handleBlur}
                          />
                          {!field.state.meta.isValid && (
                            <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                          )}
                        </div>
                      : null
                      
                    )}
                  />
                )}
                {field.state.value && (
                  <form.AppField
                    name="registration_start"
                    children={(field) => (
                      <div className='space-y-2'>
                        <field.Label htmlFor={field.name}>Inicio de la Promoción</field.Label>
                        <field.Input
                          name={field.name}
                          value={field.state.value?.toLocaleDateString() || ''}
                          disabled
                        />
                        <field.Input
                          name={field.name}
                          value={field.state.value?.toLocaleTimeString() || ''}
                          disabled
                        />
                        {!field.state.meta.isValid && (
                          <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                        )}
                      </div>
                    )}
                  />
                )}
                {field.state.value && (
                  <form.AppField
                    name="promotional_fee_end"
                    children={(field) => (
                      <div className='space-y-2'>
                        <field.Label htmlFor={field.name}>Fin de la Promoción</field.Label>
                        <field.DateTimePicker
                          name={field.name}
                          borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                          value={field.state.value}
                          onChange={field.handleChange}
                          onBlur={field.handleBlur}
                        />
                        {!field.state.meta.isValid && (
                          <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                        )}
                      </div>
                    )}
                  />
                )}
              </div>
            )}
          />

          <hr className='md:col-span-2' />

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
                      field.handleChange(value);
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
            name="location_address"
            children={(field) => (
              <div className="space-y-2">
                <field.Label htmlFor={field.name}>Dirección</field.Label>
                <field.Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  placeholder="Calle 123, Plaza Principal, etc."
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <div className='flex gap-2 flex-col md:flex-row md:col-span-2'>
            <form.AppField
              name="location_lat"
              children={(field) => (
                <div className="space-y-2">
                  <field.Label htmlFor={field.name}>Latitud</field.Label>
                  <field.Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ''}
                    onChange={(e) => {
                      const match = e.target.value.match(/(-?\d+\.?\d*), ?(-?\d+\.?\d*)/);
                      if (match) {
                        const [, lat, lng] = match;
                        field.handleChange(parseFloat(lat));
                        field.form.setFieldValue('location_long', parseFloat(lng));
                      } else {
                        field.handleChange(e.target.value ? parseFloat(e.target.value) : null)
                      }
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

            <form.AppField
              name="location_long"
              children={(field) => (
                <div className="space-y-2">
                  <field.Label htmlFor={field.name}>Longitud</field.Label>
                  <field.Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value || ''}
                    onChange={(e) => {
                      const match = e.target.value.match(/(-?\d+\.?\d*), ?(-?\d+\.?\d*)/);
                      if (match) {
                        const [, lat, lng] = match;
                        field.form.setFieldValue('location_lat', parseFloat(lat));
                        field.handleChange(parseFloat(lng));
                      } else {
                        field.handleChange(e.target.value ? parseFloat(e.target.value) : null)
                      }
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
            <div className='space-y-2 w-full md:max-w-[50%]'>
              <div className='text-xs text-gray-500'>Click derecho en pin + click en coords + pegar en lat o long</div>
              <Button variant="secondary" className="w-full" asChild>
                <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">
                  <MapPinnedIcon className="w-4 h-4 mr-2" />
                  Ir a Google Maps
                </a>
              </Button>
            </div>
          </div>

          <form.AppField
            name="disclaimer_of_liability"
            children={(field) => (
              <div className="space-y-2 md:col-span-2">
                <field.Label htmlFor={field.name}>Descargo de responsabilidad</field.Label>
                <field.Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                  placeholder="Descargo de responsabilidad (opcional)"
                  rows={3}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <form.AppField
            name="rules"
            children={(field) => (
              <div className="space-y-2 md:col-span-2">
                <field.Label htmlFor={field.name}>Reglamento</field.Label>
                <field.Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                  placeholder="Reglamento del evento (opcional)"
                  rows={3}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

          <form.AppField
            name="award_prizes"
            children={(field) => (
              <div className="space-y-2 md:col-span-2">
                <field.Label htmlFor={field.name}>Premios</field.Label>
                <field.Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  onBlur={field.handleBlur}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                  placeholder="Premios del evento (opcional)"
                  rows={3}
                />
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />
        </div>

        <hr className='md:col-span-2' />

        <form.AppField
          name="clothing"
          mode='array'
          children={(field) => (
            <div className="space-y-4 md:col-span-2">
              <div className='flex flex-col sm:flex-row justify-between mt-6 mb-2'>
                <div className="text-lg font-semibold my-auto">Indumentaria</div>
                <div className='flex gap-2 flex-col sm:flex-row items-center'>
                  {CLOTHING_TYPES.map((ctype) => (
                    <form.Button
                      variant='outline'
                      className={
                        (field.state.value
                         && field.state.value?.some(item => item.clothing_type === ctype))
                          ? 'border-primary dark:border-primary'
                          : ''
                      }
                      type="button"
                      onClick={() => {
                        if (field.state.value?.some(item => item.clothing_type === ctype)) {
                          return;
                        }
                        if (field.state.value && field.state.value.length > 0) {
                          // Change clothing type of existing items to the new type
                          console.log('Changing clothing type from', field.state.value[0].clothing_type, 'to', ctype);
                          const newItems = field.state.value.map(item => ({
                            ...item,
                            clothing_type: ctype,
                          }));
                          field.handleChange(newItems);
                          return;
                        }
                        console.log('Adding clothing type:', ctype);
                        const newItems = SportingEventClothingSchema.shape
                          .size.options.map((size) => ({
                            clothing_type: ctype,
                            size,
                          })
                        );
                        field.handleChange([...(field.state.value || []), ...newItems]);
                      }}
                    >
                      {ctype === 'tshirt'
                        ? 'Remeras'
                        : ctype === 'tanktop'
                          ? 'Musculosas'
                          : capitalizeStr(ctype)}
                    </form.Button>
                  ))}
                  {field.state.value && field.state.value.length > 0 && (
                    <DeleteButton
                      dgDescription="Borra la indumentaria configurada en el evento, dejando sin indumentaria demandada ni reservada en todas las inscripciones."
                      onConfirm={async () => {
                        // Remove existing clothing
                        setFreezeClothing(false);
                        field.handleChange(null);
                      }}
                    />
                  )}
                </div>
              </div>
              {!field.state.value && (
                <div className='text-sm text-gray-500 italic mt-4'>
                  No se ha seleccionado ningún tipo de indumentaria para el evento.
                  Haga clic en los botones de arriba para agregar tipos de indumentaria.
                  </div>
              )}
              {freezeClothing && (
                <div className='text-sm text-gray-500 italic mt-4'>
                  Por favor, agregue la indumentaria del evento en el apartado de Indumentaria
                </div>
              )}
              {field.state.value &&
                getClothesByType(field.state.value).map(({ key: ctype, data: items }) => (
                <div key={ctype} className="border rounded-md p-4">
                  <div className="text-md font-semibold mb-2">
                    {ctype === 'tshirt'
                      ? 'Remeras'
                      : ctype === 'tanktop'
                        ? 'Musculosas'
                        : capitalizeStr(ctype)}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {items.map((clothingItem, index) => (
                      <div key={index} className={"space-y-2" + (clothingItem.size === SHIRT_NOT_INCLUDED ? " hidden" : "")}>
                        <div className="text-sm font-medium">{clothingItem.size}</div>
                        <div className="flex items-center gap-2">
                          <div className='flex flex-col'>
                            <form.AppField
                              name={`clothing[${clothingItem.index}].purchased_quantity`}
                              children={(subField) => (
                                <subField.Input
                                  id={subField.name}
                                  name={subField.name}
                                  className="w-20 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                  value={subField.state.value || ""}
                                  onChange={(e) => {
                                    subField.handleChange(e.target.value ? parseInt(e.target.value) : 0);
                                  }}
                                  disabled={freezeClothing}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            </div>
          )}
        />

        <hr className='md:col-span-2' />

        <form.AppField
          name="schedules"
          mode='array'
          children={(field) => (
            <div className="space-y-4 md:col-span-2">
              <div className='flex flex-col sm:flex-row justify-between mt-6 mb-2'>
                <div className="text-lg font-semibold my-auto">Cronograma</div>
                <form.Button
                  variant='outline'
                  type="button"
                  onClick={() => {
                    field.pushValue({
                      title: '',
                      date_start: field.form.state.values?.date || new Date(),
                      date_end: field.form.state.values?.date || new Date(),
                    })
                  }}
                >
                  <PlusIcon className="w-4 h-4" />
                </form.Button>
              </div>
              {!field.state.value && (
                <div className='text-sm text-gray-500 italic mt-4'>
                  No se han agregado hitos al cronograma del evento.
                  Haga clic en el botón de arriba para agregar un hito.
                  </div>
              )}
              {field.state.value && (
                <div className="space-y-2">
                  {field.state.value.map((_, index) => (
                    <div key={index} className="p-4 border rounded-md">
                      <div className='flex flex-row justify-between mb-5'>
                        <div className="text-sm font-medium my-auto rounded-full bg-secondary text-secondary-foreground w-8 h-8 flex items-center justify-center">{index + 1}</div>
                        <form.Button
                          variant='secondary'
                          type="button"
                          onClick={() => {
                            if (field.state.value?.length === 1) {
                              field.handleChange(null);
                            } else {
                              field.removeValue(index);
                            }
                            field.handleBlur();
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </form.Button>
                      </div>
                      <div className='space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-2'>
                        <form.AppField
                          name={`schedules[${index}].title`}
                          children={(subField) => (<div className='sm:col-span-2 grid grid-cols-1 sm:grid-cols-2'>
                            <div className='space-y-2'>
                              <subField.Label htmlFor={subField.name}>Título</subField.Label>
                              <subField.Input
                                id={subField.name}
                                name={subField.name}
                                className={!subField.state.meta.isValid ? 'border-destructive' : ''}
                                value={subField.state.value || ""}
                                onChange={(e) => {
                                  subField.handleChange(e.target.value);
                                }}
                                onBlur={subField.handleBlur}
                                required
                              />
                              {!subField.state.meta.isValid && (
                                <div className='ml-auto text-xs text-destructive'>* {subField.state.meta.errors[0]?.message} </div>
                              )}
                            </div>
                          </div>)}
                        />

                        <form.AppField
                          name={`schedules[${index}].date_start`}
                          children={(subField) => (
                            <div className='space-y-2'>
                              <subField.Label htmlFor={subField.name}>Fecha y hora de inicio del hito</subField.Label>
                              <field.DateTimePicker
                                name={subField.name}
                                borderColor={!subField.state.meta.isValid ? 'border-destructive' : ''}
                                value={subField.state.value}
                                onChange={subField.handleChange}
                                onBlur={subField.handleBlur}
                              />
                              {!subField.state.meta.isValid && (
                                <div className='ml-auto text-xs text-destructive'>* {subField.state.meta.errors[0]?.message} </div>
                              )}
                            </div>
                          )}
                        />

                        <form.AppField
                          name={`schedules[${index}].date_end`}
                          children={(subField) => (
                            <div className='space-y-2'>
                              <subField.Label htmlFor={subField.name}>Fecha y hora de fin del hito</subField.Label>
                              <field.DateTimePicker
                                name={subField.name}
                                borderColor={!subField.state.meta.isValid ? 'border-destructive' : ''}
                                value={subField.state.value}
                                onChange={subField.handleChange}
                                onBlur={subField.handleBlur}
                              />
                              {!subField.state.meta.isValid && (
                                <div className='ml-auto text-xs text-destructive'>* {subField.state.meta.errors[0]?.message} </div>
                              )}
                            </div>
                          )}
                        />

                        <form.AppField
                          name={`schedules[${index}].location`}
                          children={(subField) => (
                            <div className="space-y-2">
                              <subField.ComboBoxIdName
                                data={loadedLocations.map(loc => ({ id: loc, name: loc }))}
                                label="Localidad"
                                name={subField.name}
                                value={subField.state.value || ""}
                                onChange={(value) => {
                                  if (value !== "new location :)") {
                                    subField.handleChange(value);
                                  }
                                }}
                                onBlur={subField.handleBlur}
                                placeholder="Seleccionar o escribir localidad"
                                borderColor={!subField.state.meta.isValid ? 'border-destructive' : ''}
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
                              {!subField.state.meta.isValid && (
                                <div className='ml-auto text-xs text-destructive'>* Debe indicar una localidad</div>
                              )}
                            </div>
                          )}
                        />

                        <form.AppField
                          name={`schedules[${index}].location_address`}
                          children={(subField) => (
                            <div className="space-y-2">
                              <subField.Label htmlFor={subField.name}>Dirección</subField.Label>
                              <subField.Input
                                id={subField.name}
                                name={subField.name}
                                value={subField.state.value || ''}
                                onChange={(e) => subField.handleChange(e.target.value || null)}
                                onBlur={subField.handleBlur}
                                placeholder="Calle 123, Plaza Principal, etc."
                                className={!subField.state.meta.isValid ? 'border-destructive' : ''}
                              />
                              {!subField.state.meta.isValid && (
                                <div className='ml-auto text-xs text-destructive'>* {subField.state.meta.errors[0]?.message} </div>
                              )}
                            </div>
                          )}
                        />

                        {/* <form.AppField
                          name={`schedules[${index}].notification_template_id`}
                          children={(field) => (
                            <div className="space-y-2 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className='space-y-2'>
                                <field.Label htmlFor={field.name}>Envío de notificación</field.Label>
                                <field.Select
                                  name={field.name}
                                  value={field.state.value || ""}
                                  onValueChange={(e) => {
                                    field.handleChange(e || null);
                                    field.handleBlur();
                                  }}
                                  onOpenChange={(o) => {
                                    if (!o) {
                                      field.handleBlur();
                                    }
                                    field.setMeta((meta) => ({ ...meta, isBlurred: o }));
                                  }}
                                  open={field.state.meta.isBlurred}
                                >
                                  <field.SelectTrigger className={"w-full " + (!field.state.meta.isValid ? 'border-destructive' : '')}>
                                    <field.SelectValue placeholder="..." />
                                  </field.SelectTrigger>
                                  <field.SelectContent>
                                    <field.SelectGroup>
                                      {field.state.value &&
                                        <div
                                          className="flex items-center justify-end p-2 bg-red-100 cursor-pointer hover:bg-red-200 border-b border-red-200 rounded"
                                          onClick={() => {
                                            field.handleChange("");
                                            field.handleBlur();
                                            field.setMeta((meta) => ({ ...meta, isBlurred: false }));
                                            field.form.setFieldValue(`schedules[${index}].notify_at`, null);
                                          }}
                                        >
                                            <span className="text-xs text-red-900 mr-2 font-semibold">Borrar selección</span>
                                            <Trash2 className="text-red-600 w-4 h-4" />
                                        </div>
                                      }
                                      <field.SelectLabel>Plantilla de notificación</field.SelectLabel>
                                        <field.SelectItem
                                          key={SCHEDULE_TEMPLATE_IDS.KITS_DELIVERY}
                                          value={SCHEDULE_TEMPLATE_IDS.KITS_DELIVERY}
                                        >
                                          Entrega de kits
                                        </field.SelectItem>
                                    </field.SelectGroup>
                                  </field.SelectContent>
                                </field.Select>
                                {!field.state.meta.isValid && (
                                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                                )}
                              </div>
                              {!!field.state.value && (
                                <form.AppField
                                  name={`schedules[${index}].notify_at`}
                                  children={(subField) => (
                                    <div className='space-y-2'>
                                      <subField.Label htmlFor={subField.name}>Programar envío</subField.Label>
                                      <field.DateTimePicker
                                        name={subField.name}
                                        borderColor={!subField.state.meta.isValid ? 'border-destructive' : ''}
                                        value={subField.state.value}
                                        onChange={subField.handleChange}
                                        onBlur={subField.handleBlur}
                                      />
                                      {!subField.state.meta.isValid && (
                                        <div className='ml-auto text-xs text-destructive'>* {subField.state.meta.errors[0]?.message} </div>
                                      )}
                                    </div>
                                  )}
                                />
                              )}
                            </div>
                          )}
                        /> */}

                        <div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        />

        <hr className='md:col-span-2' />

        <form.AppField
          name="circuits"
          mode='array'
          children={(field) => (
            <div className="space-y-4 md:col-span-2">
              <div className='flex flex-col sm:flex-row justify-between mt-6 mb-2'>
                <div className="text-lg font-semibold my-auto">Circuitos del Evento</div>
                <form.Button
                  variant='outline'
                  type="button"
                  onClick={() => {
                    // El primer circuito agregado es competitivo por defecto, los siguientes no competitivos
                    let firstOne = true;
                    let bib_number_start = 1;
                    let bib_number_end = 300;
                    if (field.state.value && field.state.value.length > 0) {
                      firstOne = false;
                      bib_number_start = (
                        field.state.value[
                          field.state.value.length - 1
                        ].bib_number_end || 0
                        ) + 1;
                      bib_number_end = bib_number_start + 199;
                    }
                    field.pushValue({
                      name: "",
                      distance_km: 0,
                      competitive: firstOne, // we make the first circuit competitive by default
                      bib_number_start,
                      bib_number_end,
                      teams_enabled: false, // we make the teams_enabled false by default
                      registration_disabled: false, // circuits are open to registration by default
                    })
                  }}
                >
                  <PlusIcon className="w-4 h-4" />
                </form.Button>
              </div>
              {!field.state.value && (
                <div className='text-sm text-gray-500 italic mt-4'>
                  No se han agregado circuitos al evento.
                  Haga clic en el botón de arriba para agregar un circuito.
                </div>
              )}
              {field.state.value && field.state.value.map((_, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <div className='flex flex-row justify-between mb-5'>
                    <div className='flex gap-2'>
                      <div className="text-sm font-medium my-auto rounded-full bg-secondary text-secondary-foreground w-8 h-8 flex items-center justify-center">{index + 1}</div>
                      <form.AppField
                        name={`circuits[${index}].competitive`}
                        children={(subField) => (
                          <div className='flex items-center gap-1'>
                            <subField.Switch
                              id={subField.name}
                              name={subField.name}
                              checked={subField.state.value || false}
                              onCheckedChange={(e) => {
                                subField.handleChange(e)
                              }}
                            />
                            <subField.Label htmlFor={subField.name}>
                              {subField.state.value ? "Competitivo" : "No competitivo"}
                            </subField.Label>
                          </div>
                        )}
                      />
                    </div>
                    <form.Button
                      variant='secondary'
                      type="button"
                      onClick={() => {
                        if (field.state.value?.length === 1) {
                          field.handleChange(null);
                        } else {
                          field.removeValue(index);
                        }
                        field.handleBlur();
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </form.Button>
                  </div>
                  <div className='space-y-4 grid grid-cols-1 md:grid-cols-2 gap-2'>
                    <form.AppField
                      name={`circuits[${index}].name`}
                      children={(subField) => (
                        <div className='space-y-2'>
                          <subField.Label htmlFor={subField.name}>Nombre del Circuito</subField.Label>
                          <subField.Input
                            id={subField.name}
                            name={subField.name}
                            className={!subField.state.meta.isValid ? 'border-destructive' : ''}
                            value={subField.state.value || ""}
                            onBlur={subField.handleBlur}
                            onChange={(e) => {
                              subField.handleChange(e.target.value);
                            }}
                            required
                          />
                          {!subField.state.meta.isValid && (
                            <div className='ml-auto text-xs text-destructive'>* {subField.state.meta.errors[0]?.message} </div>
                          )}
                        </div>
                      )}
                    />

                    <form.AppField
                      name={`circuits[${index}].distance_km`}
                      children={(subField) => (
                        <div className='space-y-2'>
                          <subField.Label htmlFor={subField.name}>Distancia (en kilómetros)</subField.Label>
                          <subField.Input
                            id={subField.name}
                            name={subField.name}
                            className={!subField.state.meta.isValid ? 'border-destructive' : ''}
                            value={subField.state.value || ""}
                            onBlur={subField.handleBlur}
                            onChange={(e) => {
                              subField.handleChange(e.target.value ? parseInt(e.target.value) : 0);
                            }}
                          />
                          {!subField.state.meta.isValid && (
                            <div className='ml-auto text-xs text-destructive'>* {subField.state.meta.errors[0]?.message} </div>
                          )}
                        </div>
                      )}
                    />

                    <form.AppField
                      name={`circuits[${index}].bib_number_start`}
                      children={(subField) => (
                        <div className='space-y-2'>
                          <subField.Label htmlFor={subField.name}>Núm. de Dorsal inicial</subField.Label>
                          <subField.Input
                            id={subField.name}
                            name={subField.name}
                            className={!subField.state.meta.isValid ? 'border-destructive' : ''}
                            value={subField.state.value || ""}
                            onBlur={subField.handleBlur}
                            onChange={(e) => {
                              subField.handleChange(e.target.value ? parseInt(e.target.value) : 0);
                            }}
                          />
                          {!subField.state.meta.isValid && (
                            <div className='ml-auto text-xs text-destructive'>* {subField.state.meta.errors[0]?.message} </div>
                          )}
                        </div>
                      )}
                    />

                    <form.AppField
                      name={`circuits[${index}].bib_number_end`}
                      children={(subField) => (
                        <div className='space-y-2'>
                          <subField.Label htmlFor={subField.name}>Núm. de Dorsal final</subField.Label>
                          <subField.Input
                            id={subField.name}
                            name={subField.name}
                            className={!subField.state.meta.isValid ? 'border-destructive' : ''}
                            value={subField.state.value || ""}
                            onBlur={subField.handleBlur}
                            onChange={(e) => {
                              subField.handleChange(e.target.value ? parseInt(e.target.value) : 0);
                            }}
                          />
                          {!subField.state.meta.isValid && (
                            <div className='ml-auto text-xs text-destructive'>* {subField.state.meta.errors[0]?.message} </div>
                          )}
                        </div>
                      )}
                    />

                    <form.AppField
                      name={`circuits[${index}].teams_enabled`}
                      children={(subField) => (
                        <div className='flex items-center gap-1'>
                          <subField.Switch
                            id={subField.name}
                            name={subField.name}
                            checked={subField.state.value || false}
                            onCheckedChange={(e) => {
                              subField.handleChange(e)
                            }}
                          />
                          <subField.Label htmlFor={subField.name}>
                            {subField.state.value ? "Equipos habilitados" : "Equipos no habilitados"}
                          </subField.Label>
                        </div>
                      )}
                    />

                    <form.AppField
                      name={`circuits[${index}].registration_disabled`}
                      children={(subField) => (
                        <div className='flex items-center gap-1'>
                          <subField.Switch
                            id={subField.name}
                            name={subField.name}
                            checked={subField.state.value || false}
                            onCheckedChange={(e) => {
                              subField.handleChange(e)
                            }}
                          />
                          <subField.Label htmlFor={subField.name}>
                            Cerrar inscripciones
                            <HelpTooltip content={
                              "No permitir nuevas inscripciones de atletas. "
                              + "Los únicos que tienen permitido inscribir atletas "
                              + "son los organizadores."}
                            />
                          </subField.Label>
                        </div>
                      )}
                    />

                    <form.AppField
                      name={`circuits[${index}].map_url`}
                      children={(subField) => (
                        <div className='space-y-2 md:col-span-2'>
                          <subField.Label htmlFor={subField.name}>URL al circuito</subField.Label>
                          <div className='flex gap-2'>
                            <subField.Input
                              id={subField.name}
                              name={subField.name}
                              className={!subField.state.meta.isValid ? 'border-destructive' : ''}
                              value={subField.state.value || ""}
                              onBlur={subField.handleBlur}
                              onChange={(e) => {
                                subField.handleChange(e.target.value);
                              }}
                              placeholder="https://www.google.com/maps/d/..."
                            />
                            <form.Button variant="secondary" className="w-[25%]" asChild>
                              <a href="https://www.google.com/mymaps" target="_blank" rel="noopener noreferrer">
                                <MapPinnedIcon className="w-4 h-4 mr-2" />
                                Ir a My Maps
                              </a>
                            </form.Button>
                          </div>
                          {!subField.state.meta.isValid && (
                            <div className='ml-auto text-xs text-destructive'>* {subField.state.meta.errors[0]?.message} </div>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        />

        <hr />

        <form.AppField
          name="external_register_url"
          children={(field) => (
            <div className='space-y-2 md:col-span-2'>
              <field.Label htmlFor={field.name}>URL para inscripciones externas</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="https://www.example.com/inscripciones"
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="results_url"
          children={(field) => (
            <div className='space-y-2 md:col-span-2'>
              <field.Label htmlFor={field.name}>URL de Resultados</field.Label>
              <field.Input
                id={field.name}
                name={field.name}
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="https://www.example.com/resultados"
                className={!field.state.meta.isValid ? 'border-destructive' : ''}
              />
              {!field.state.meta.isValid && (
                <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
              )}
            </div>
          )}
        />

        <form.AppField
          name="hidden"
          children={(field) => (
            <div className='space-y-2 md:col-span-2'>
              <div className='flex items-center gap-2'>
                <field.Switch
                  id={field.name}
                  name={field.name}
                  checked={field.state.value || false}
                  onCheckedChange={(e) => field.handleChange(e)}
                />
                <field.Label htmlFor={field.name}>
                  Mantener el evento oculto (en modo borrador)
                </field.Label>
              </div>
              <div className='text-sm text-gray-500 italic'>
                Si activás esta opción, el evento no será visible para los usuarios regulares.
                Podés usar esta función para mantener el evento en modo borrador mientras
                terminás de configurar toda la información y los detalles del mismo. Recordá
                desactivar esta opción antes de publicar el evento para que los usuarios
                puedan verlo e inscribirse.
              </div>
            </div>
          )}
        />

        {data && data.id && (
          <div>
            <hr className="my-6" />
            <Button
              variant='outline'
              type='button'
              onClick={() => setMoreOptions(!moreOptions)}
            >
              {moreOptions
                ? "Ocultar opciones avanzadas"
                : "Mostrar opciones avanzadas"}
            </Button>
            {moreOptions && (
              <div>
                <div className='bg-destructive/5 p-5 rounded-lg flex justify-between items-center mt-4'>
                  <div className="text-lg font-semibold">Zona de peligro</div>
                  <DeleteButton
                    btnText="Eliminar evento"
                    btnIcon={null}
                    dgTitle="¿Estás seguro que querés eliminar este evento?"
                    dgDescription={"Esta acción no se puede deshacer. Si "
                      + "eliminás el evento, se eliminarán todas las inscripciones "
                      + "asociadas al mismo, los pagos registrados y toda la "
                      + "información relacionada en general. No podrás recuperarlo."}
                    onConfirm={async () => {
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 500);
                      const res = await postAuthenticated(`/api/sportingEvents/delete/${data.id}`);
                      if (res.status === 200) {
                        setSuccess('Evento eliminado exitosamente');
                        setTimeout(() => {
                          navigate({to: '/', reloadDocument: true});
                        }, 1500);
                      } else {
                        setError(getMessage(res.body?.message, 'Error desconocido al eliminar el evento'));
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {localStorage.getItem('ADMIN_MODE') === 'active' && (
          <div>
            <hr className="my-6" />
            <form.Subscribe
              selector={(state) => state.errors}
              children={(errors) => (
                <FormErrorsCard errors={errors} />
              )}
            />
          </div>
        )}

        <hr className="my-6" />

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
                  if (form.state.values?.clothing
                      && form.state.values.clothing.length > 0) {
                    setFreezeClothing(true);
                  }
                }}
              >
                <ListRestartIcon className="mr-2 h-4 w-4" />
                Reset
              </form.Button>
            </form.AppForm>
          )}
        />
      </form>
    </div>
  );
};

export default SportingEventForm;
