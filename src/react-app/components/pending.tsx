import { Spinner } from "./ui/spinner";


export const Pending = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 bg-primary/10 p-5 rounded-lg border border-primary/20">
      <Spinner className="size-8" />
      <p className="text-lg text-foreground">Cargando...</p>
    </div>
  );
}
