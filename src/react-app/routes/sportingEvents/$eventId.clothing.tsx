import { createFileRoute } from '@tanstack/react-router';
import React from 'react';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls';
import {
  AlertCircle,
  ShirtIcon,
  CircleQuestionMarkIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoBackButton } from '@/components/goBackButton';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { ARClothingStatsSchema } from '@shared/apiRespTypes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import z from 'zod';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { SHIRT_SIZES } from '@shared/types';
import { getMessage } from '@/lib/utils';

export const Route = createFileRoute('/sportingEvents/$eventId/clothing')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const resClothing = await getAuthenticatedThrow<
      z.infer<typeof ARClothingStatsSchema>[]
    >(`/api/sportingEvents/${params.eventId}/clothing`,
      z.array(ARClothingStatsSchema));
    return { resClothing };
  },
  staleTime: 1000 * 60 * 5,
})

function RouteComponent() {
  const { resClothing } = Route.useLoaderData();

  const [addClothingOpen, setAddClothingOpen] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [error, _setError] = React.useState('');
  const [success, _setSuccess] = React.useState('');
  const setError = (msg: string) => {
    _setError(msg)
    setTimeout(() => {
      _setError('');
    }, 2000);
  };
  const setSuccess = (msg: string) => {
    _setSuccess(msg)
    setTimeout(() => {
      _setSuccess('');
    }, 3000);
  };

  return (
    <div className='max-w-full my-2 p-5 mx-auto'>
      {error && (
        <div className="my-4 bg-red-500/10 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="my-4 bg-green-500/10 text-green-600 p-3 rounded-md text-sm">
          {success}
        </div>
      )}

      {loading ? (
        <div className="my-4 bg-muted text-muted-foreground p-3 rounded-md text-sm flex gap-4 items-center">
          <Spinner /><div>Cargando...</div>
        </div>) : null
      }

      <GoBackButton />

      <AddClothingDialog
        open={addClothingOpen}
        setOpen={setAddClothingOpen}
        eventId={Route.useParams().eventId}
        setError={setError}
        setSuccess={setSuccess}
        setLoading={setLoading}
        onSuccess={() => {
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }}
      />

      <div className='flex flex-col sm:flex-row sm:justify-between min-w-xl'>
        <div className='mb-4 sm:mb-0'>
          <h1 className='text-2xl font-bold mb-4'>Indumentaria</h1>
        </div>
        <div className='flex gap-2 flex-col sm:flex-row mb-8 sm:mb-0'>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => setAddClothingOpen(true)}
            >
            <ShirtIcon className="w-4 h-4" />
            Agregar Indumentaria
          </Button>
        </div>
      </div>

      <Table className='border my-4'>
        <TableHeader>
          <TableRow>
            {/* <TableHead className='text-center w-15'>Tipo</TableHead> */}
            <TableHead className='text-center w-15'>Talle</TableHead>
            <TableHead className='text-center min-w-25'>Comprado</TableHead>
            <TableHeadCellFlex
              title="Demandado"
              tooltipContent="Cantidad de inscriptos, sin importar si pagaron o no."
            />
            <TableHeadCellFlex
              title="Pot. faltante"
              tooltipContent="Cantidad que potencialmente podría faltar, calculada como la diferencia entre lo demandado y lo comprado."
            />
            <TableHeadCellFlex
              title="Reservado"
            />
            <TableHeadCellFlex
              title="Faltante"
              tooltipContent="Cantidad de inscripciones pagas a las cuales no se les pudieron reservar la indumentaria."
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {resClothing.body.data.map((c) => (
            <TableRow key={c.id}>
              {/* <TableCell className='text-center'>{c.clothing_type}</TableCell> */}
              <TableCell className='text-center'>{c.size}</TableCell>
              <TableCell className='text-center bg-blue-500/20'>{c.q_purchased}</TableCell>
              <TableCell className='text-center'>{c.q_demanded}</TableCell>
              <TableCell className={'text-center ' + 
                (c.q_potential_lacking > 15
                  ? 'bg-amber-500/60'
                  : c.q_potential_lacking > 5
                    ? 'bg-amber-300/60'
                    : c.q_potential_lacking > 0
                      ? 'bg-amber-100/60'
                      : ''
              )}>{c.q_potential_lacking}</TableCell>
              <TableCell className='text-center'>{c.q_reserved}</TableCell>
              <TableCell className={'text-center ' + 
                (c.q_lacking > 5
                  ? 'bg-red-500/60'
                  : c.q_lacking > 0
                    ? 'bg-red-300/60'
                    : ''
              )}>{c.q_lacking}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}


const TableHeadCellFlex = ({
  title,
  tooltipContent
}: {
  title: string,
  tooltipContent?: string
}) => {
  return (
    <TableHead className='text-center min-w-25'>
      <div className='flex items-center gap-1 justify-center'>
        <p>{title}</p>
        {tooltipContent ? <HelpTooltip content={tooltipContent} /> : null}
      </div>
    </TableHead>
  )
}


const HelpTooltip = ({ content }: { content: string }) => {
  return (
    <Popover>
      <PopoverTrigger className='cursor-pointer hover:text-primary'>
        <CircleQuestionMarkIcon className='w-4 h-4' />
      </PopoverTrigger>
      <PopoverContent className='bg-background p-3 rounded-md border'>
        <p className='text-sm'>{content}</p>
      </PopoverContent>
    </Popover>
  )
}


export const AddClothingDialog = ({
  open,
  setOpen,
  eventId,
  setError,
  setSuccess,
  setLoading,
  onSuccess,
}: {
  open: boolean,
  setOpen: (open: boolean) => void,
  eventId: string,
  setError: (msg: string) => void,
  setSuccess: (msg: string) => void,
  setLoading: (loading: boolean) => void,
  onSuccess: () => void,
}) => {
  const defaultValue = () => SHIRT_SIZES.reduce((acc, size) => {
      acc[size] = 0;
      return acc;
    }, {} as Record<string, number>
  );
  const [data, setData] = React.useState(defaultValue())

  return (
    <Dialog open={open} onOpenChange={() => {
      setOpen(false);
      setData(defaultValue());
    }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Agregar Indumentaria</DialogTitle>
          <DialogDescription>
            <p className='my-1'>
              Acá podés agregar nueva indumentaria comprada para el evento.
              Esto hará que los que tenían faltante esa indumentaria pasen a tenerla reservada.
            </p>

            <p className='my-1'>
              Solo incluí la cantidad de cada talle que compraste, no la cantidad total (es decir,
              si compraste 3 remeras talle M, poné 3, no la cantidad total de remeras talle M que
              hay para el evento).
            </p>
          </DialogDescription>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-4 my-1">
            {SHIRT_SIZES.map((size) => (
              <div className="space-y-2">
                <div className="text-sm font-medium">{size}</div>
                <div className="flex items-center gap-2">
                  <div className='flex flex-col'>
                    <Input
                      id={size}
                      name={size}
                      className="w-20 md:w-15 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={data[size] || ""}
                      onChange={(e) => {
                        if (isNaN(parseInt(e.target.value))) {
                          return;
                        }
                        setData({
                          ...data,
                          [size]: e.target.value ? parseInt(e.target.value) : 0
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='flex gap-2 justify-end mt-2'>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className='max-w-20 cursor-pointer'
              >
                Cancelar
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                type="button"
                variant="default"
                className='max-w-20 cursor-pointer'
                onClick={async (e) => {
                  if (!data) {
                    e.preventDefault();
                    return;
                  }
                  // Lógica para agregar indumentaria
                  setLoading(true);
                  const r = await postAuthenticated(
                    `/api/sportingEvents/${eventId}/addClothing`,
                    { data: Object.entries(data).map(([size, purchased_quantity]) => ({
                      size,
                      purchased_quantity,
                    })) }
                  );
                  setLoading(false);
                  if (r.status !== 200) {
                    console.error('Error agregando indumentaria:', getMessage(r.body?.message, 'Error desconocido'));
                    setError(
                      'Hubo un error al agregar la indumentaria. '
                      + getMessage(r.body?.message, 'Error desconocido'));
                  } else {
                    setSuccess('Indumentaria agregada exitosamente.');
                    onSuccess();
                  }
                }}
              >
                Confirmar
              </Button>
              </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
