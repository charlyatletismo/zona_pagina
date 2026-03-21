export const FormErrorsCard = ({ errors }: { errors: unknown[] }) => {
  return <div>
    {Object.keys(errors).length > 0 ? (
      <div className="p-4 mb-4 text-sm text-red-500 bg-red-500/10 rounded-lg border border-red-500/10" role="alert">
        <span className="font-medium">Por favor corrija los siguientes errores antes de continuar:</span>
        <ul className="mt-2 list-disc list-inside">
          {errors.map((error, index) => (
            <li key={index}>{JSON.stringify(error)}</li>
          ))}
        </ul>
      </div>
    ) : (
      <div className="p-4 mb-4 text-sm text-green-500 bg-green-500/10 rounded-lg border border-green-500/10" role="alert">
        No hay errores de validación en el formulario.
      </div>
    )}
  </div>
}
