import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react';
import { Save, AlertCircle, MapPinnedIcon, Trash2, ListRestartIcon } from 'lucide-react';
import { cn, getLang, getMessage, capitalizeStr } from '@/lib/utils';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls'
import z from 'zod';
import { useAppForm } from '@/lib/genForm';
import {
  SportingEventSchema,
  AthleteCategoryTemplateSchema,
  SportingEventTypesEnumDescriptions,
  SportingEventScheduleSchema,
  SportingEventCircuitSchema,
  SportingEventClothingSchema,
  CLOTHING_TYPES,
} from '@shared/types'
import { SportingEventApiResponseReadSchema } from '@shared/apiRespTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { LocationForm } from './locationForm';


const PartialSportingEventSchema = SportingEventSchema.partial()
const ArrayOfCatTemplates = z.array(AthleteCategoryTemplateSchema)

const genClothingItems = (
  clothingType: z.infer<typeof SportingEventClothingSchema.shape.clothing_type>
) => {
  return SportingEventClothingSchema.shape.size.options.map((size) => ({
    clothing_type: clothingType,
    size,
  }));
}

const PartialClothingSchema = SportingEventClothingSchema.partial();
const getClothesByType = (
  clothingArray: z.infer<typeof PartialClothingSchema>[] | null,
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
  }, [] as {key: string, data: any[]}[])
  return clothesByType;
}


const SportingEventForm = (
    { data, catTemplates, locations } : {
    data: z.infer<typeof SportingEventSchema> | null,
    catTemplates: z.infer<typeof ArrayOfCatTemplates>,
    locations: string[],
    }) => {
  const navigate = useNavigate();
  const apiEndpointPath = data
    ? `/api/sportingEvents/update/${data.id}`
    : '/api/sportingEvents/create';
  
  const [newLocation, setNewLocation] = useState(false);
  const [loadedLocations, setLoadedLocations] = useState(locations);

  const form = useAppForm({
    defaultValues: data
      ? SportingEventApiResponseReadSchema.parse(data || {})
      : SportingEventSchema.keyof().options.reduce((acc, field) => {
          acc[field] = null;
          return acc;
        },
        {} as Record<string, null>),
    validators: {
      onBlur: SportingEventSchema,
    },
    onSubmit: async ({ value }) => {
      setError('');
      setSuccess('');
      // Scroll to top of the page when form is submitted
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const res = await postAuthenticated(apiEndpointPath, value, navigate);
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
        navigate({ to: `/sportingEvents/${res.body.data.id || data?.id}`, reloadDocument: true });
      }, 1000);
    }
  });


  const [formData, setFormData] = useState<z.infer<typeof PartialSportingEventSchema>>(data || {});
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
            dbLocations={locations}
            location={null}
            onSuccess={async () => {
              const locationsApi = await getAuthenticatedThrow<string[]>('/api/locations');
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
                <field.Select
                  name={field.name}
                  value={field.state.value || ""}
                  onValueChange={(e: any) => {
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
                      <field.SelectLabel>Talle de remera</field.SelectLabel>
                      {SportingEventSchema.shape.event_type.options.map((evtype) => (
                        <field.SelectItem key={evtype} value={evtype}>{SportingEventTypesEnumDescriptions[evtype][getLang()]}</field.SelectItem>
                      ))}
                    </field.SelectGroup>
                  </field.SelectContent>
                </field.Select>
                {!field.state.meta.isValid && (
                  <div className='ml-auto text-xs text-destructive'>* {field.state.meta.errors[0]?.message} </div>
                )}
              </div>
            )}
          />

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
            name="fee_amount"
            children={(field) => (
              <div className='space-y-2 md:col-span-2 mx-auto max-w-2xl'>
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
            name="registration_start"
            children={(field) => (
              <div className='space-y-2'>
                <field.Label htmlFor={field.name}>Inicio de Inscripciones</field.Label>
                <field.DatePicker
                  borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                  value={field.state.value}
                  onChange={(d) => {
                    if (d && field.state.value) {
                      d = new Date(
                        d.toDateString()
                        + " "
                        + field.state.value?.toTimeString().slice(0, 5)
                      )
                    };
                    field.handleChange(d || null);
                  }}
                  onBlur={() => field.handleBlur()}
                />
                <field.Input
                  id={field.name + "_time"}
                  name={field.name + "_time"}
                  type="time"
                  value={field.state.value ? field.state.value.toTimeString().slice(0, 5) : ''}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                  onBlur={() => field.handleBlur()}
                  onChange={(e) => {
                    if (field.state.value) {
                      field.handleChange(
                        new Date(
                          field.state.value.toDateString()
                          + ' '
                          + e.target.value)
                      );
                    }
                  }}
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
                <field.DatePicker
                  borderColor={!field.state.meta.isValid ? 'border-destructive' : ''}
                  value={field.state.value}
                  onChange={(d) => {
                    if (d && field.state.value) {
                      d = new Date(
                        d.toDateString()
                        + " "
                        + field.state.value?.toTimeString().slice(0, 5)
                      )
                    };
                    field.handleChange(d || null);
                  }}
                  onBlur={() => field.handleBlur()}
                />
                <field.Input
                  id={field.name + "_time"}
                  name={field.name + "_time"}
                  type="time"
                  value={field.state.value ? field.state.value.toTimeString().slice(0, 5) : ''}
                  className={!field.state.meta.isValid ? 'border-destructive' : ''}
                  onBlur={() => field.handleBlur()}
                  onChange={(e) => {
                    if (field.state.value) {
                      field.handleChange(
                        new Date(
                          field.state.value.toDateString()
                          + ' '
                          + e.target.value)
                      );
                    }
                  }}
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

        <hr className="my-6" />

        <form.AppField
          name="clothing"
          mode='array'
          children={(field) => (
            <div className="space-y-4 md:col-span-2">
              <div className='flex flex-col sm:flex-row justify-between mt-6 mb-2'>
                <div className="text-lg font-semibold my-auto">Indumentaria</div>
                <div className='flex gap-2 flex-col sm:flex-row'>
                  {CLOTHING_TYPES.map((ctype) => (
                    <form.Button
                      variant={
                        field.state.value
                          ? field.state.value?.some(item => item.clothing_type === ctype)
                            ? 'secondary'
                            : 'outline'
                          : 'outline'
                      }
                      type="button"
                      onClick={() => {
                        if (!field.state.value) {
                          console.log('Initializing clothing array');
                          field.handleChange([])
                        };
                        if (field.state.value?.some(item => item.clothing_type === ctype)) {
                          // Remove existing clothing of this type
                          console.log('Removing clothing type:', ctype);
                          const filteredItems = field.state.value.filter(item => item.clothing_type !== ctype);
                          field.handleChange(filteredItems.length === 0 ? null : filteredItems);
                          return;
                        }
                        console.log('Adding clothing type:', ctype);
                        const newItems = genClothingItems(ctype);
                        field.handleChange([...(field.state.value || []), ...newItems]);
                      }}
                      disabled={field.state.value ? !field.state.value?.some(item => item.clothing_type === ctype) : false}
                    >
                      {ctype === 'tshirt'
                        ? 'Remeras'
                        : ctype === 'tanktop'
                          ? 'Musculosas'
                          : capitalizeStr(ctype)}
                    </form.Button>
                  ))}
                </div>
              </div>
              {!field.state.value && (
                <div className='text-sm text-gray-500 italic mt-4'>
                  No se ha seleccionado ningún tipo de indumentaria para el evento.
                  Haga clic en los botones de arriba para agregar tipos de indumentaria.
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
                      <div key={index} className="space-y-2">
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

        <hr className="my-6" />

        {/* TODO: Cronograma, Circuitos y Categorías */}

        <div className="text-lg font-semibold mt-6 mb-2">Cronograma del Evento</div>
        <div className="space-y-2 md:col-span-2">
          <Button variant={'outline'} type='button' onClick={
            () => setFormData(
              prev => (
                {
                  ...prev,
                  schedules: [
                    ...(prev.schedules || []),
                    SportingEventScheduleSchema.parse({ event_id: formData.id || 0, date: '', title: '' })
                  ]
                }))
          }>{
              'Agregar nuevo hito del evento'
            }</Button>
        </div>
        {formData.schedules && formData.schedules.map((schedule, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
            <div className='space-y-2 md:col-span-2'>
              <label htmlFor={`schedules.${index}`} className="text-sm font-medium text-gray-700">{`Hito ${index + 1}`}</label>
              <div className="flex gap-2">
                <Button variant={'destructive'} type='button' onClick={
                  () => {
                    const newSchedules = [...(formData.schedules || [])];
                    newSchedules.splice(index, 1);
                    setFormData(prev => ({ ...prev, schedules: newSchedules }));
                  }
                }>{
                    <Trash2 className="w-4 h-4" />
                  }</Button>
                <Input
                  id={`schedules.${index}.title`}
                  name={`schedules.${index}.title`}
                  value={schedule.title || ''}
                  onChange={(e) => {
                    const newSchedules = [...(formData.schedules || [])];
                    newSchedules[index].title = e.target.value;
                    setFormData(prev => ({ ...prev, schedules: newSchedules }));
                  }}
                  placeholder="Título del hito"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor={`schedules.${index}.description`} className="text-sm font-medium text-gray-700">Descripción del hito</label>
              <textarea
                id={`schedules.${index}.description`}
                name={`schedules.${index}.description`}
                rows={3}
                className={cn(
                  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                )}
                value={schedule.description || ''}
                onChange={(e) => {
                  const newSchedules = [...(formData.schedules || [])];
                  newSchedules[index].description = e.target.value;
                  setFormData(prev => ({ ...prev, schedules: newSchedules }));
                }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`schedules.${index}.date`} className="text-sm font-medium text-gray-700">Fecha y Hora</label>
              <Input
                id={`schedules.${index}.date`}
                name={`schedules.${index}.date`}
                type="datetime-local"
                value={schedule.date.toISOString().slice(0, 16) || ''}
                onChange={(e) => {
                  const newSchedules = [...(formData.schedules || [])];
                  newSchedules[index].date = new Date(e.target.value);
                  setFormData(prev => ({ ...prev, schedules: newSchedules }));
                }}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor={`schedules.${index}.location`} className="text-sm font-medium text-gray-700">Localidad (Texto)</label>
              <Input
                id={`schedules.${index}.location`}
                name={`schedules.${index}.location`}
                value={schedule.location || ''}
                onChange={(e) => {
                  const newSchedules = [...(formData.schedules || [])];
                  newSchedules[index].location = e.target.value;
                  setFormData(prev => ({ ...prev, schedules: newSchedules }));
                }}
              />
            </div>
          </div>
        ))}
        <hr className="my-6" />
        <div className="text-lg font-semibold mt-6 mb-2">Circuitos del Evento</div>
        <div className="space-y-2 md:col-span-2">
          <Button variant={'outline'} type='button' onClick={
            () => setFormData(
              prev => (
                {
                  ...prev,
                  circuits: [
                    ...(prev.circuits || []),
                    SportingEventCircuitSchema.parse({ name: "", distance_km: 0 })
                  ]
                }))
          }>{
              'Agregar nuevo circuito'
            }</Button>
        </div>
        {formData.circuits && formData.circuits.map((circuit, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
            <div className='space-y-2 md:col-span-2'>
              <label htmlFor={`circuits.${index}`} className="text-sm font-medium text-gray-700">{`Circuito ${index + 1}`}</label>
              <div className="flex gap-2">
                <Button variant={'destructive'} type='button' onClick={
                  () => {
                    const newCircuits = [...(formData.circuits || [])];
                    newCircuits.splice(index, 1);
                    setFormData(prev => ({ ...prev, circuits: newCircuits }));
                  }
                }>{
                    <Trash2 className="w-4 h-4" />
                  }</Button>
                <Input
                  id={`circuits.${index}.name`}
                  name={`circuits.${index}.name`}
                  value={circuit.name || ''}
                  onChange={(e) => {
                    const newCircuits = [...(formData.circuits || [])];
                    newCircuits[index].name = e.target.value;
                    setFormData(prev => ({ ...prev, circuits: newCircuits }));
                  }}
                  placeholder="Nombre del circuito"
                />
              </div>
            </div>
            <div className='space-y-2 md:col-span-2'>
              <label htmlFor={`circuits.${index}.description`} className="text-sm font-medium text-gray-700">Descripción del Circuito</label>
              <textarea
                id={`circuits.${index}.description`}
                name={`circuits.${index}.description`}
                rows={3}
                className={cn(
                  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                )}
                value={circuit.description || ''}
                onChange={(e) => {
                  const newCircuits = [...(formData.circuits || [])];
                  newCircuits[index].description = e.target.value;
                  setFormData(prev => ({ ...prev, circuits: newCircuits }));
                }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`circuits.${index}.distance_km`} className="text-sm font-medium text-gray-700">Distancia (en kilómetros)</label>
              <Input
                id={`circuits.${index}.distance_km`}
                name={`circuits.${index}.distance_km`}
                type="number"
                step="any"
                value={circuit.distance_km || ''}
                onChange={(e) => {
                  const newCircuits = [...(formData.circuits || [])];
                  newCircuits[index].distance_km = parseFloat(e.target.value);
                  setFormData(prev => ({ ...prev, circuits: newCircuits }));
                }}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor={`circuits.${index}.map_url`} className="text-sm font-medium text-gray-700">URL del Mapa</label>
              <div className="flex gap-2">
                <Input
                  id={`circuits.${index}.map_url`}
                  name={`circuits.${index}.map_url`}
                  value={circuit.map_url || ''}
                  onChange={(e) => {
                    const newCircuits = [...(formData.circuits || [])];
                    newCircuits[index].map_url = e.target.value;
                    setFormData(prev => ({ ...prev, circuits: newCircuits }));
                  }}
                  placeholder="https://www.google.com/maps/d/..."
                />
                <Button variant="secondary" className="w-[25%]" asChild>
                  <a href="https://www.google.com/mymaps" target="_blank" rel="noopener noreferrer">
                    <MapPinnedIcon className="w-4 h-4 mr-2" />
                    Ir a My Maps
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ))}
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
};

export default SportingEventForm;
