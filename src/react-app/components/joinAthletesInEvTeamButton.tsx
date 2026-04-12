import { ARSportingEventRegistrationFlatSchema } from "@shared/apiRespTypes";
import z from "zod";
import { Button } from "./ui/button";
import { postAuthenticated } from "@/lib/apiCalls";
import { getMessage } from "@/lib/utils";
import { Users2Icon } from "lucide-react";


export const JoinAthletesInEvTeamButton = ({
  disabled,
  selectedRegs,
  eventId,
  setLoading,
  setError,
  setSuccess
}: {
  disabled: boolean;
  selectedRegs: z.infer<typeof ARSportingEventRegistrationFlatSchema>[];
  eventId: string;
  setLoading: (loading: boolean) => void;
  setError: (message: string) => void;
  setSuccess: (message: string) => void;
}) => {
  return (
    <Button
      variant="outline"
      className='cursor-pointer'
      disabled={disabled}
      onClick={async () => {
        // Lógica para formar un equipo
        setLoading(true);
        if (selectedRegs.length !== 2) {
          setLoading(false);
          setError('Por favor, selecciona exactamente 2 inscripciones para formar un equipo.');
          return;
        }
        const selectedReg1 = selectedRegs[0];
        const selectedReg2 = selectedRegs[1];
        if (!selectedReg1 || !selectedReg2) {
          setLoading(false);
          setError('No se pudieron encontrar las inscripciones seleccionadas.');
          return;
        }
        const circuitIds = selectedRegs.map(reg => reg.circuit_id);
        const sameCircuit = circuitIds.every(id => id === circuitIds[0]);
        if (sameCircuit) {
          setLoading(false);
          setError('Los atletas seleccionados pertenecen al mismo circuito. Para formar un equipo, deben pertenecer a circuitos diferentes.');
          return;
        }
        const circuitTeamsEnabled = selectedRegs.every(reg => reg.circuit_teams_enabled);
        if (!circuitTeamsEnabled) {
          setLoading(false);
          setError('Los atletas seleccionados no tienen habilitada la opción de formar equipos en sus circuitos.');
          return;
        }
        let reqId: string, destId: string;
        if (selectedReg1.event_team_leader_id !== null && selectedReg2.event_team_leader_id !== null) {
          if (selectedReg1.event_team_leader_id === selectedReg2.event_team_leader_id) {
            setLoading(false);
            setSuccess('Ambos atletas ya pertenecen al mismo equipo.');
            return;
          }
          // Delete existing team of reg2
          await postAuthenticated(
            `/api/sportingEvents/${eventId}/registrations/makeTeam`,
            {reqId: selectedReg2.user_id, destId: null}
          );
          reqId = selectedReg1.user_id;
          destId = selectedReg2.user_id;
        } else {
          if (selectedReg1.event_team_leader_id !== null) {
            reqId = selectedReg1.user_id;
            destId = selectedReg2.user_id;
          } else {
            reqId = selectedReg2.user_id;
            destId = selectedReg1.user_id;
          }
        }
        const r = await postAuthenticated(
          `/api/sportingEvents/${eventId}/registrations/makeTeam`,
          {reqId, destId}
        );
        setLoading(false);
        if (r.status !== 200) {
          console.error('Error formando el equipo:', getMessage(r.body?.message, 'Error desconocido'));
          setError(`Hubo un error al formar el equipo. ${getMessage(r.body?.message, 'Error desconocido')}`);
        } else {
          setSuccess('Equipo formado exitosamente.');
          window.location.reload();
        }
      }}
    >
      <Users2Icon className='w-4 h-4 text-green-500' />
      Unir
    </Button>
  )
}