import { Spinner } from "./ui/spinner";


export const Pending = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Spinner />
      <p className="text-lg text-muted-foreground">Cargando...</p>
    </div>
  );
}
