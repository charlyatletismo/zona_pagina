import z from 'zod';
import { ARSportingEventRegistrationFlatSchema } from '@shared/apiRespTypes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";


export const SeeRegistrationDetailsDialog = ({
  reg,
  setReg,
  statusBadges,
}: {
  reg: z.infer<typeof ARSportingEventRegistrationFlatSchema> | null,
  setReg: (reg: z.infer<typeof ARSportingEventRegistrationFlatSchema> | null) => void,
  statusBadges: Record<string, { text: string, color: string }>,
}) => {

  return (
    <Dialog open={reg !== null} onOpenChange={() => {
      setReg(null);
    }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className='flex justify-between items-center'>
            <div>{reg?.user_full_name}</div>
            <div className={statusBadges[reg?.status || '']?.color + ' px-2 py-1 rounded-md text-center border text-xs'}>
              {statusBadges[reg?.status || '']?.text}
            </div>
          </DialogTitle>
          <DialogDescription className='flex flex-col gap-2 text-foreground'>
            <div className='flex gap-2'>
              {reg?.status === 'paid' && <div className='border border-primary text-primary px-2 py-1 rounded-md text-center text-xs'>
                Categoría: {reg?.category || 'Sin categoría asignada'}
              </div>}
              {reg?.bib_number && <div className='border border-primary text-primary px-2 py-1 rounded-md text-center text-xs'>
                Dorsal: {reg?.bib_number}
              </div>}
              {reg?.chip_id && <div className='border border-primary text-primary px-2 py-1 rounded-md text-center text-xs'>
                Chip: {reg?.chip_id}
              </div>}
            </div>
            <div>
              <h3 className='font-bold'>Información general</h3>
              <div className='font-light'>
                Inscripto el {new Date(reg?.registration_date || '').toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                })}
              </div>
              <div className='font-light'>
                Edad a la fecha del evento: {reg?.age_at_event_date}
              </div>
              <div className='font-light'>
                Equipo de entrenamiento: {reg?.user_training_team_name || 'Sin equipo'}
              </div>
              <div className='font-light'>
                Talle solicitado: {reg?.demanded_clothing_size || 'No solicitado'}
              </div>
              <div className='font-light'>
                Talle reservado: {reg?.reserved_clothing_size || 'No reservado'}
              </div>
              <div className='font-light'>
                Dorsal: {reg?.bib_number || 'No reservado'}
              </div>
              <div className='font-light'>
                Chip: {reg?.chip_id || 'No reservado'}
              </div>
            </div>
            <div>
              <h3 className='font-bold'>Circuito</h3>
              <div className='font-light'>Nombre: {reg?.circuit_name}</div>
              <div className='font-light'>Distancia: {reg?.circuit_distance_km}km</div>
              <div className='font-light'>{reg?.circuit_competitive ? 'Competitivo' : 'No competitivo'}</div>
              <div className='font-light'>Categoría: {reg?.category || 'Sin categoría asignada'}</div>
            </div>
            <div>
              <h3 className='font-bold'>Detalles de pago</h3>
              {reg?.full_payment_date && (
                <div className='font-light'>
                  Pago completo el {new Date(reg.full_payment_date).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })}
                </div>
              )}
              <div className='font-light'>
                Pagado: ${reg?.paid_amount.toLocaleString()}
              </div>
              <div className='font-light'>
                Pendiente por pagar: ${reg?.pending_to_pay.toLocaleString()}
              </div>
              {(reg?.discount_percentage !== undefined && reg?.discount_percentage > 0) && <div className='font-light'>
                Descuento aplicado: {reg?.discount_percentage ? `${reg.discount_percentage.toFixed(0)}%` : 'No tiene descuento'}
              </div>}
              {reg?.discount_reason && <div className='font-light'>
                Razón del descuento: {reg?.discount_reason || 'No tiene descuento'}
              </div>}
            </div>
          </DialogDescription>

          <div className='flex gap-2 justify-end mt-2'>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className='max-w-20 cursor-pointer'
              >
                Cerrar
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
