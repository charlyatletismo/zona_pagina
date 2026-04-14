import { createFileRoute } from '@tanstack/react-router';
import { useState } from "react";
import { useAppForm } from '@/lib/genForm';
import z from 'zod';
import { Spinner } from '@/components/ui/spinner';


const CustomSchema = z.object({
  sex: z.enum(['M', 'F'], 'Debe seleccionar un sexo'),
});


export const Route = createFileRoute('/test10')({
  component: RouteComponent,
})

function RouteComponent() {
  const [success, _setSuccess] = useState('');
  const setSuccess = (msg: string) => {
    _setSuccess(msg)
    setTimeout(() => {
      _setSuccess('');
    }, 5000);
  };

  const form = useAppForm({
    defaultValues: {
      sex: '',
    },
    validators: {
      onBlur: CustomSchema,
    },
    onSubmit: async ({ value }) => {
      // delay artificial para probar el spinner
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(`Formulario enviado con éxito. Sexo seleccionado: ${value.sex}`);
    }
  });

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4">
      <div className='w-full max-w-md backdrop-blur-xl rounded-2xl shadow-2xl border border-muted p-8'>
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold">Título</h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">Subtítulo</p>
        </div>

        {success && (
          <div className="bg-green-500/10 text-green-600 p-3 rounded-md text-sm mb-2">
            {success}
          </div>
        )}

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
            children={([isSubmitting]) => (
              <div>
                {isSubmitting ? (
                  <div className='flex gap-4 items-center space-x-2 mb-4 text-sm text-gray-600'>
                    <Spinner /><div>Enviando...</div>
                  </div>) : null
                }
              </div>
            )}
          />

          <div className="grid grid-cols-1 gap-2">

            <form.AppField
              name="sex"
              children={(field) => (
                <div className='space-y-2'>
                  <field.Label htmlFor={field.name}>Sexo</field.Label>
                  <div className='flex items-center'>
                    <field.Select
                      name={field.name}
                      value={field.state.value || ""}
                      onValueChange={(e: string) => {
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

          </div>

              <form.Button
                type="submit"
                className='mr-2 mt-2'
              >
                Enviar
              </form.Button>

        </form>
      </div>
    </div>
  )
}
