import { useNavigate } from '@tanstack/react-router'
import React, { useState } from 'react';
import { Save, AlertCircle, MapPinnedIcon, Trash2 } from 'lucide-react';
import { cn, getLang } from '@/lib/utils';
import { postAuthenticated } from '@/lib/apiCalls'
import {
  SportingEventSchema,
  AthleteCategoryTemplateSchema,
  SportingEventTypesEnum,
  SportingEventTypesEnumDescriptions,
  SportingEventScheduleSchema,
  SportingEventCircuitSchema,
} from '@shared/types'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import z from 'zod';


const PartialSportingEventSchema = SportingEventSchema.partial()
const ArrayOfCatTemplates = z.array(AthleteCategoryTemplateSchema)


const SportingEventForm = (
    { data, catTemplates } : {
    data: z.infer<typeof SportingEventSchema> | null,
    catTemplates: z.infer<typeof ArrayOfCatTemplates>,
    }) => {
  const navigate = useNavigate();
  const apiEndpointPath = data === null ? '/api/sportingEvents/create' : `/api/sportingEvents/update/${data.id}`;
  const [formData, setFormData] = useState<z.infer<typeof PartialSportingEventSchema>>(data || {});
  const [coordinatesGoogleMaps, setCoordinatesGoogleMaps] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    // Scroll to top of the page when form is submitted
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const res = await postAuthenticated(apiEndpointPath, formData, navigate);
    if (res.status !== 200) {
      setError('Error al guardar los cambios' + (res.body.message ? `: ${res.body.message}` : ''));
      console.error('Error al guardar los cambios', res.body);
      setSaving(false);
      return;
    }

    setSuccess('Evento actualizado correctamente');
    setTimeout(() => {
      setSuccess('');
      navigate({ to: `/sportingEvents/${res.body.data.id || data?.id}`, reloadDocument: true });
    }, 1000);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center text-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md flex items-center text-sm">
          <Save className="w-4 h-4 mr-2" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-gray-700">Título del Evento</label>
          <Input
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium text-gray-700">Fecha del Evento</label>
          <Input
            id="date"
            name="date"
            type="datetime-local"
            value={formData.date?.toISOString().slice(0, 16) || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="event_type" className="text-sm font-medium text-gray-700">Tipo de Evento</label>
          <select
            id="event_type"
            name="event_type"
            value={formData.event_type || ''}
            onChange={
              (e) => setFormData(
                prev => (
                  { ...prev,
                    event_type: SportingEventTypesEnum.parse(e.target.value || "other")
                  }
                )
              )}
            className={cn(
              "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            )}
            required
          >
            <option value="">Seleccionar tipo de evento</option>
            {SportingEventTypesEnum.options.map((type) => (
              <option key={type} value={type}>
                {SportingEventTypesEnumDescriptions[type][getLang()]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="description" className="text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className={cn(
              "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            )}
            value={formData.description || ''}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="registration_start" className="text-sm font-medium text-gray-700">Inicio Inscripciones</label>
          <Input
            id="registration_start"
            name="registration_start"
            type="datetime-local"
            value={formData.registration_start?.toISOString().slice(0, 16) || ''}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="registration_end" className="text-sm font-medium text-gray-700">Fin Inscripciones</label>
          <Input
            id="registration_end"
            name="registration_end"
            type="datetime-local"
            value={formData.registration_end?.toISOString().slice(0, 16) || ''}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="image_url" className="text-sm font-medium text-gray-700">URL de Imagen</label>
          <Input
            id="image_url"
            name="image_url"
            value={formData.image_url || ''}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="location" className="text-sm font-medium text-gray-700">Localidad (Texto)</label>
          <Input
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="location_address" className="text-sm font-medium text-gray-700">Dirección</label>
          <Input
            id="location_address"
            name="location_address"
            value={formData.location_address || ''}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="coordinatesMap" className="text-sm font-medium text-gray-700">Coordenadas Google Maps (click derecho en pin + click en coordenadas)</label>
          <div className="flex gap-5">
            <Input
              id="coordinatesMap"
              name="coordinatesMap"
              placeholder="latitud, longitud"
              value={coordinatesGoogleMaps}
              onChange={(e) => {
                const url = e.target.value;
                setCoordinatesGoogleMaps(url);

                // Extract coordinates from Google Maps URL
                const match = url.match(/(-?\d+\.?\d*), (-?\d+\.?\d*)/);
                if (match) {
                  const [, lat, lng] = match;
                  setFormData(prev => ({
                    ...prev,
                    location_lat: parseFloat(lat),
                    location_long: parseFloat(lng)
                  }));
                }
              }}
            />
            <Button variant="secondary" className="w-[25%]" asChild>
              <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">
                <MapPinnedIcon className="w-4 h-4 mr-2" />
                Ir a Google Maps
              </a>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="location_lat" className="text-sm font-medium text-gray-700">Latitud</label>
          <Input
            id="location_lat"
            name="location_lat"
            type="number"
            step="any"
            value={formData.location_lat || ''}
            onChange={handleChange}
            disabled
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="location_long" className="text-sm font-medium text-gray-700">Longitud</label>
          <Input
            id="location_long"
            name="location_long"
            type="number"
            step="any"
            value={formData.location_long || ''}
            onChange={handleChange}
            disabled
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="rules" className="text-sm font-medium text-gray-700">Reglamento</label>
          <textarea
            id="rules"
            name="rules"
            rows={6}
            className={cn(
              "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            )}
            value={formData.rules || ''}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="award_prizes" className="text-sm font-medium text-gray-700">Premios</label>
          <textarea
            id="award_prizes"
            name="award_prizes"
            rows={4}
            className={cn(
              "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            )}
            value={formData.award_prizes || ''}
            onChange={handleChange}
          />
        </div>
      </div>

      <hr className="my-6" />
      <div className="text-lg font-semibold mt-6 mb-2">Cronograma del Evento</div>
      <div className="space-y-2 md:col-span-2">
        <Button variant={'outline'} type='button' onClick={
          () => setFormData(
            prev => (
              { ...prev,
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
              value={schedule.date.toISOString().slice(0,16) || ''}
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
              { ...prev,
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

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SportingEventForm;
