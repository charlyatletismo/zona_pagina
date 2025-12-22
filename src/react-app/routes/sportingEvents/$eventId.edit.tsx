import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Save, AlertCircle, MapPinnedIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAuthenticated, postAuthenticated } from '@/lib/apiCalls'
import { SportingEvent, SportingEventType } from '@/lib/types'

export const Route = createFileRoute('/sportingEvents/$eventId/edit')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const ev: SportingEvent = await getAuthenticated(`/api/sportingEvents/${params.eventId}`);
    const evTypes: SportingEventType[] = await getAuthenticated('/api/sportingEventTypes');
    return { ev, evTypes };
  },
  staleTime: 1000 * 60 * 5,
  gcTime: 0 // force reload every time
})

function RouteComponent() {
  const { eventId } = Route.useParams();
  const { ev, evTypes } = Route.useLoaderData();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<SportingEvent>>(ev);
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

    try {
      const {status, data} = await postAuthenticated(`/api/sportingEvents/update/${eventId}`, formData);
      if (status !== 200) {
        throw new Error(data.error || 'Error al actualizar el evento');
      }

      setSuccess('Evento actualizado correctamente');
      setTimeout(() => {
        setSuccess('');
        navigate({ to: `/sportingEvents/${eventId}`, reloadDocument: true });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary" 
        asChild
      >
        <Link to="/sportingEvents/$eventId" params={{ eventId }}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al Evento
        </Link>
      </Button>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Editar Evento</h2>
          <p className="text-gray-500 text-sm mt-1">
            Actualiza la información del evento.
          </p>
        </div>

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
                value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value).toISOString() }))}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="event_type" className="text-sm font-medium text-gray-700">Tipo de Evento</label>
              <select
                id="event_type"
                name="event_type"
                value={formData.event_type || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, event_type: parseInt(e.target.value) }))}
                className={cn(
                  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                )}
                required
              >
                <option value="">Seleccionar tipo de evento</option>
                {evTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
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
                value={formData.registration_start ? new Date(formData.registration_start).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_start: new Date(e.target.value).toISOString() }))}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="registration_end" className="text-sm font-medium text-gray-700">Fin Inscripciones</label>
              <Input
                id="registration_end"
                name="registration_end"
                type="datetime-local"
                value={formData.registration_end ? new Date(formData.registration_end).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_end: new Date(e.target.value).toISOString() }))}
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
              <label htmlFor="location_text" className="text-sm font-medium text-gray-700">Ubicación (Texto)</label>
              <Input
                id="location_text"
                name="location_text"
                value={formData.location_text || ''}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="location_hint" className="text-sm font-medium text-gray-700">Referencia de Ubicación</label>
              <Input
                id="location_hint"
                name="location_hint"
                value={formData.location_hint || ''}
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
              <label htmlFor="circuit_map_url" className="text-sm font-medium text-gray-700">URL del Mapa</label>
              <Input
                id="circuit_map_url"
                name="circuit_map_url"
                value={formData.circuit_map_url || ''}
                onChange={handleChange}
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
      </div>
    </div>
  )
}
