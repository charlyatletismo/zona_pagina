import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@/lib/roles';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, Save, AlertCircle, MapPinnedIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type InferSelectModel } from 'drizzle-orm';
import { events } from '../../../worker/db/schema';

export const Route = createFileRoute('/runningEvents/$eventId/edit')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
})

function RouteComponent() {
  const { eventId } = Route.useParams();
  const [eventTypes, setEventTypes] = useState<Array<{ id: number; name: string; description: string }>>([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<InferSelectModel<typeof events>>>({});
  const [coordinatesGoogleMaps, setCoordinatesGoogleMaps] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('JWT_TOKEN');
        const res = await fetch(`/api/runningEvents/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        });

        if (!res.ok) {
          throw new Error('Error al cargar el evento');
        }

        const data = await res.json();
        setFormData(data);
        setCoordinatesGoogleMaps(`${data.location_lat}, ${data.location_long}`)
      } catch (err) {
        setError('Error al cargar la información del evento');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const fetchEventTypes = async () => {
      try {
        const token = localStorage.getItem('JWT_TOKEN');
        const res = await fetch('/api/eventTypes', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        });
        if (!res.ok) {
          throw new Error('Error al cargar los tipos de evento');
        }
        const data = await res.json();
        setEventTypes(data);
      } catch (err) {
        console.error('Error fetching event types:', err);
      }
    };

    fetchEvent();
    fetchEventTypes();
  }, [eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('JWT_TOKEN');
      const res = await fetch(`/api/runningEvents/update/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al actualizar el evento');
      }

      setSuccess('Evento actualizado correctamente');
      setTimeout(() => {
        setSuccess('');
        navigate({ to: `/runningEvents/${eventId}` });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al guardar los cambios');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner className="w-10 h-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary" 
        asChild
      >
        <Link to="/runningEvents/$eventId" params={{ eventId }}>
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
                {eventTypes.map((type) => (
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
              <label htmlFor="inscription_start" className="text-sm font-medium text-gray-700">Inicio Inscripciones</label>
              <Input
                id="inscription_start"
                name="inscription_start"
                type="datetime-local"
                value={formData.inscription_start ? new Date(formData.inscription_start).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, inscription_start: new Date(e.target.value).toISOString() }))}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="inscription_end" className="text-sm font-medium text-gray-700">Fin Inscripciones</label>
              <Input
                id="inscription_end"
                name="inscription_end"
                type="datetime-local"
                value={formData.inscription_end ? new Date(formData.inscription_end).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, inscription_end: new Date(e.target.value).toISOString() }))}
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
  );
}
