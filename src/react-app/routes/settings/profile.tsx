import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, Save, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import authCheck from '@/lib/authCheck';


export const Route = createFileRoute('/settings/profile')({
  component: RouteComponent,
  beforeLoad: authCheck(),
})


interface UserProfile {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  sex: string;
  date_of_birth: string;
  country: string;
  city: string;
  full_location: string;
  training_team: string;
  // generated
  countryCode: string;
  barePhone: string;
}

function RouteComponent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('JWT_TOKEN');
        if (!token) {
          setError('No estás autenticado');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Error al cargar el perfil');
        }

        const data = await res.json();
        setFormData({
          ...data,
          countryCode: data.phone ? data.phone.slice(0, data.phone.indexOf("9")) : '',
          barePhone: data.phone ? data.phone.slice(data.phone.indexOf("9") + 1) : '',
        });
      } catch (err) {
        setError('Error al cargar la información del perfil');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'barePhone') {
      const phone = (formData.countryCode || '') + '9' + value;
      setFormData(prev => ({ ...prev, phone, barePhone: value }));
      return;
    } else if (name === 'countryCode') {
      const phone = value + '9' + (formData.barePhone || '');
      setFormData(prev => ({ ...prev, phone, countryCode: value }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('JWT_TOKEN');
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Error al actualizar el perfil');
      }

      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
      localStorage.setItem('REQUIRE_PROFILE_UPDATE', '');
    } catch (err) {
      setError('Error al guardar los cambios');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const isMissing = (value: string | undefined | null) => !value || value.trim() === '';

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);
  const maxDateString = maxDate.toISOString().split('T')[0];

  if (loading) {
    return <div className="flex justify-center p-8"><Spinner /></div>;
  }

  return (
    <div className="p-4 w-full md:max-w-2xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary" 
        onClick={() => navigate({ to: '/settings' })}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Configuración
      </Button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Editar Perfil</h2>
          <p className="text-gray-500 text-sm mt-1">
            Completa tu información para mejorar tu experiencia.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                DNI
              </label>
              <Input
                name="id"
                value={formData.id || ''}
                disabled
                className="bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400">El DNI no se puede cambiar. Contactar al administrador si necesita cambiarlo.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor='barePhone' className="mb-1 block text-sm font-light text-gray-700">
                Celular (con WhatsApp)
                {isMissing(formData.barePhone && formData.countryCode) && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="flex mb-2">
                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                  +
                </span>
                <Input
                  id='countryCode'
                  name='countryCode'
                  placeholder="54"
                  maxLength={3}
                  value={formData.countryCode || ''}
                  onChange={e => {
                    // ignore if there is there at most 3 digits or if it is not a number
                    if (e.target.value.length > 3) { return; }
                    if (!e.target.value.match(/^[0-9]*$/)) { return; }
                    handleChange(e);
                  }}
                  className={
                    'w-16 rounded-none' +
                    cn(isMissing(formData.countryCode) && "border-orange-300 bg-orange-50 focus-visible:ring-orange-300 w-16 rounded-none")
                  }
                  />
                <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300">
                  9
                </span>
                <Input
                  id='barePhone'
                  name='barePhone'
                  placeholder="celular"
                  minLength={10}
                  maxLength={10}
                  value={formData.barePhone || ''}
                  onChange={e => {
                    // ignore if there is there at most 10 digits or if it is not a number
                    // console.log(e.target.value, phone);
                    // if (e.target.value.length > 11) { return; }
                    // if (!e.target.value.match(/^[0-9]*$/)) { return; }

                    // console.log('setPhone', e.target.value);
                    handleChange(e);
                  }}
                  className={
                    'rounded-l-none' +
                    cn(isMissing(formData.barePhone) && "border-orange-300 bg-orange-50 focus-visible:ring-orange-300 rounded-l-none")
                  }
                  required
                  />
              </div>
            </div>

            

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Nombre
                {isMissing(formData.name) && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Input
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className={cn(isMissing(formData.name) && "border-orange-300 bg-orange-50 focus-visible:ring-orange-300")}
                placeholder="Tu nombre"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Apellido
                {isMissing(formData.surname) && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Input
                name="surname"
                value={formData.surname || ''}
                onChange={handleChange}
                className={cn(isMissing(formData.surname) && "border-orange-300 bg-orange-50 focus-visible:ring-orange-300")}
                placeholder="Tu apellido"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
                {isMissing(formData.email) && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                className={cn(isMissing(formData.email) && "border-orange-300 bg-orange-50 focus-visible:ring-orange-300")}
                placeholder="ejemplo@correo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Sexo
                {isMissing(formData.sex) && <span className="text-red-500 ml-1">*</span>}
              </label>
              <select
                name="sex"
                value={formData.sex || ''}
                onChange={handleChange}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  isMissing(formData.sex) && "border-orange-300 bg-orange-50 focus-visible:ring-orange-300"
                )}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="male">Hombre</option>
                <option value="female">Mujer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                País
                {isMissing(formData.country) && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Input
                name="country"
                value={formData.country || ''}
                onChange={handleChange}
                className={cn(isMissing(formData.country) && "border-orange-300 bg-orange-50 focus-visible:ring-orange-300")}
                placeholder="Tu país"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Ciudad
                {isMissing(formData.city) && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Input
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                className={cn(isMissing(formData.city) && "border-orange-300 bg-orange-50 focus-visible:ring-orange-300")}
                placeholder="Tu ciudad"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Fecha de Nacimiento
                {isMissing(formData.date_of_birth) && <span className="text-red-500 ml-1">*</span>}
              </label>
              <Input
                name="date_of_birth"
                type="date"
                max={maxDateString}
                value={formData.date_of_birth || ''}
                onChange={handleChange}
                className={cn(isMissing(formData.date_of_birth) && "border-orange-300 bg-orange-50 focus-visible:ring-orange-300")}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Equipo de Entrenamiento
              </label>
              <Input
                name="training_team"
                value={formData.training_team || ''}
                onChange={handleChange}
                placeholder="Nombre de tu equipo (opcional)"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={saving} className="w-full md:w-auto">
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
