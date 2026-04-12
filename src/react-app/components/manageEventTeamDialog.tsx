import z from 'zod';
import { postAuthenticated } from '@/lib/apiCalls';
import {
  ARSportingEventRegistrationFlatSchema,
} from '@shared/apiRespTypes';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash2Icon } from 'lucide-react';
import React from 'react';
import { getMessage } from '@/lib/utils';


export const ManageEventTeamRegDialog = ({
  reg,
  setReg,
  eventId,
  setError,
  setSuccess,
  setLoading,
} : {
  reg: z.infer<typeof ARSportingEventRegistrationFlatSchema> | null,
  setReg: (reg: z.infer<typeof ARSportingEventRegistrationFlatSchema> | null) => void,
  eventId: string,
  setError: (msg: string) => void,
  setSuccess: (msg: string) => void,
  setLoading: (loading: boolean) => void,
}) => {
  const [teamMemberId, setTeamMemberId] = React.useState("");

  return (
    <Dialog open={reg !== null} onOpenChange={() => {
      setTeamMemberId('');
      setReg(null);
    }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{reg?.event_team_leader_id ? 'Modificar equipo del evento' : 'Formar equipo para el evento'}</DialogTitle>
          <DialogDescription>
            Formar equipo con otro atleta registrado en el evento.
            Ambos atletas deben estar registrados en el mismo evento y en distintos circuitos.
          </DialogDescription>

          <Label htmlFor="teamMemberId" className="mt-4">DNI Compañero</Label>
          <Input
            id="teamMemberId"
            name="teamMemberId"
            placeholder=""
            value={teamMemberId || ''}
            onChange={(e) => {
              setTeamMemberId(e.target.value);
            }}
            required={true}
            />

          <div className='flex gap-2 justify-end mt-2'>
            {reg?.event_team_leader_id !== null && (
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="cursor-pointer"
                  disabled={reg?.event_team_leader_id === null}
                  onClick={async () => {
                    // Lógica para eliminar el equipo
                    setLoading(true);
                    const r = await postAuthenticated(
                      `/api/sportingEvents/${eventId}/registrations/makeTeam`,
                      {reqId: reg?.user_id, destId: null}
                    );
                    setLoading(false);
                    if (r.status !== 200) {
                      console.error('Error eliminando el equipo:', getMessage(r.body?.message, 'Error desconocido'));
                      setError(`Hubo un error al eliminar el equipo. ${getMessage(r.body?.message, 'Error desconocido')}`);
                    } else {
                      setSuccess('Equipo eliminado exitosamente.');
                      window.location.reload();
                    }
                    setTeamMemberId('');
                    setReg(null);
                  }}
                >
                  <Trash2Icon className='h-4 w-4' />
                </Button>
              </DialogClose>
            )}
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
                disabled={!teamMemberId}
                onClick={async (e) => {
                  if (!teamMemberId) {
                    e.preventDefault();
                    return;
                  }
                  // Lógica para formar un equipo
                  setLoading(true);
                  const r = await postAuthenticated(
                    `/api/sportingEvents/${eventId}/registrations/makeTeam`,
                    {reqId: reg?.user_id, destId: teamMemberId}
                  );
                  setLoading(false);
                  if (r.status !== 200) {
                    console.error('Error formando el equipo:', getMessage(r.body?.message, 'Error desconocido'));
                    setError(`Hubo un error al formar el equipo. ${getMessage(r.body?.message, 'Error desconocido')}`);
                  } else {
                    setSuccess('Equipo formado exitosamente.');
                    window.location.reload();
                  }
                  setTeamMemberId('');
                  setReg(null);
                }}
              >
                Unir
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
