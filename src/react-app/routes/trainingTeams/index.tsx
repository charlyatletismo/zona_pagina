import { createFileRoute, Link } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { ARTrainingTeamAllSchema } from '@shared/apiRespTypes';
import z from 'zod';
import { Button } from '@/components/ui/button';
import {
  PlusIcon,
  FileScanIcon,
} from 'lucide-react';
import { TrainingTeamsTable } from '@/components/trainingTeamsTable';


export const Route = createFileRoute('/trainingTeams/')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const res = await getAuthenticatedThrow<
      z.infer<typeof ARTrainingTeamAllSchema>[]
      >('/api/trainingTeams/all',
        z.array(ARTrainingTeamAllSchema));
    return { res };
  },
  staleTime: 0, // force reload every time
})


function RouteComponent() {
  const { res } = Route.useLoaderData();

  return (
    <div className='max-w-full my-2 p-5 mx-auto'>
      <div className='flex flex-col sm:flex-row sm:justify-between'>
        <div className='mb-4 sm:mb-0'>
          <h1 className='text-2xl font-bold mb-4'>Equipos de Entrenamiento</h1>
        </div>
        <div className='flex gap-2 flex-col sm:flex-row mb-8 sm:mb-0'>
          <Button variant='outline'>
            <Link to='/trainingTeams/create' className='flex gap-2 items-center w-full justify-center'>
              <PlusIcon className='w-4 h-4' />
              Crear Equipo
            </Link>
          </Button>
          <Button variant='outline'>
            <Link to='/trainingTeams/checkTemporary' className='flex gap-2 items-center w-full justify-center'>
              <FileScanIcon className='w-4 h-4' />
              Eq. Temporales
            </Link>
          </Button>
        </div>
      </div>
      <TrainingTeamsTable data={res.body.data} />
    </div>
  )
}
