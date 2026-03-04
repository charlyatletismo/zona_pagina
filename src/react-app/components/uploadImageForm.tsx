import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from './ui/button';
import { getMessage } from '@/lib/utils';
import { postAuthenticatedFile } from '@/lib/apiCalls';
import { Spinner } from '@/components/ui/spinner';
import { Save } from 'lucide-react';


// const UploadImageFormSchema = z.object({
//   files: z.file().refine((file) => file instanceof File, 'Debe ser un archivo').nullable(),
// });


export const UploadImageForm = ({
  tagId,
  apiUrl,
  setError,
  setSuccess,
  loading,
  setLoading,
}: {
  tagId: string;
  apiUrl: string;
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}) => {
  const navigate = useNavigate();

  const [showPreview, setShowPreview] = useState(false);

  return (
    <form
      className="w-full"
      onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        console.log(e)

        // Scroll to top of the page when form is submitted
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const formData = new FormData(e.currentTarget);
        const fileInput = formData.get(tagId) as File | null;
        if (!fileInput) {
          setLoading(false);
          setError('Por favor, selecciona un archivo');
          setTimeout(() => {
            setError('');
          }, 1500);
          return;
        }
        formData.delete(tagId);
        formData.append('file', fileInput);
        console.log('FormData:', formData);
        console.log('FormData entries:', Array.from(formData.entries()));
        const res = await postAuthenticatedFile(apiUrl, formData, navigate);
        if (res.status !== 200) {
          setLoading(false);
          setError(getMessage(res.body?.message, 'Error al actualizar la foto'));
          setTimeout(() => {
            setError('');
          }, 1500);
          return;
        }
        setLoading(false);
        setSuccess(getMessage(res.body?.message, 'Foto actualizada correctamente'));
        setTimeout(() => {
          setSuccess('');
          navigate({ to: '.', reloadDocument: true });
        }, 1000);
      }}
    >
      <div className="flex flex-col w-full gap-2">

        <div className="aspect-video rounded-xl overflow-hidden relative border border-muted-foreground">
          <img
            id={'imagePreview_' + tagId}
            src=""
            alt="Click para cargar imagen"
            className='w-full h-full object-cover text-sm flex justify-center items-center'
          />

          <input
            id={tagId}
            name={tagId}
            type='file'
            accept='image/*'
            className='absolute top-0 left-0 h-full cursor-pointer opacity-0'
            disabled={loading}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                  const imagePreview = document.getElementById('imagePreview_' + tagId) as HTMLImageElement;
                  imagePreview.src = event.target?.result as string;
                };
                reader.readAsDataURL(file);
                setShowPreview(true);
              }
            }}
          />
        </div>

      {showPreview && (
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? <Spinner /> : null}
          {loading ? null : <Save className="h-4 w-4" />}
        </Button>
      )}

      </div>
    </form>
  )
};
