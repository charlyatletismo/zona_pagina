import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, Save } from 'lucide-react'
import { cn, getMessage } from '@/lib/utils'
import { postAuthenticated } from '@/lib/apiCalls'
import { UserProfile } from '@shared/types'


interface UserProfileForm {
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


export const ProfileForm = ({ profile, postUrl }: { profile: UserProfile, postUrl: string }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<UserProfileForm>>({
    ...profile,
    countryCode: profile.phone ? profile.phone.slice(0, profile.phone.indexOf("9")) : '',
    barePhone: profile.phone ? profile.phone.slice(profile.phone.indexOf("9") + 1) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    } else if (name === 'name' || name === 'surname') {
      // capitalize first letter
      const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
      setFormData(prev => ({ ...prev, [name]: capitalizedValue }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    // Scroll to top of the page when form is submitted
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const res = await postAuthenticated(postUrl, formData, navigate);
    if (res.status !== 200) {
      setError(getMessage(res.body?.message, 'Error al actualizar el perfil'));
      setSaving(false);
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
    setSaving(false);
  };

  const isMissing = (value: string | undefined | null) => !value || value.trim() === '';

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13);
  const maxDateString = maxDate.toISOString().split('T')[0];

  return (
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
            <option value="M">Hombre</option>
            <option value="F">Mujer</option>
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
  )
};
