import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls';
import { ARChipSchema } from '@shared/apiRespTypes';
import z from 'zod';
import { ChipsForm } from '@/components/chipsForm';
import { FormBox } from '@/components/formBox';
import { Button } from '@/components/ui/button';
import { DeleteButton } from '@/components/deleteButton';
import { GoBackButton } from '@/components/goBackButton';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';


export const Route = createFileRoute('/sportingEvents/chips')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const res = await getAuthenticatedThrow<
      z.infer<typeof ARChipSchema>[]
      >('/api/chips', z.array(ARChipSchema));
    return { res };
  },
  staleTime: 1000 * 60 * 5,
  gcTime: 0 // force reload every time
})


function RouteComponent() {
  const { res } = Route.useLoaderData();
  const [chipsData, setChipsData] = useState(res.body.data || []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <GoBackButton />
      <h2 className="ml-4 text-2xl font-bold text-gray-800">Editar Segmentos de Chips</h2>
      <p className="ml-4 text-gray-500 text-sm mt-1 mb-6">
        Aquí puedes editar los chips disponibles para los eventos deportivos.
      </p>

      {chipsData.map((chip, index) => (
        <div className='flex mt-4'>
          <FormBox
            key={index}
            title={null}
            description={null}
            returnDisabled={true}
            padding=''
          >
            <ChipsForm chipsData={chip} />
          </FormBox>
          <DeleteButton
            onConfirm={async () => {
              if (chip.id === 0) {
                // If the chip doesn't have an ID, it's a new unsaved chip, just remove it from the state
                setChipsData(chipsData.filter(c => c.id !== 0));
              } else {
                // For existing chips, you would call the API to delete it and then remove it from the state
                const res = await postAuthenticated(`/api/chips/${chip.id}/delete`, {})
                if (res.status !== 200) {
                  // Handle error (you might want to show a message to the user)
                  return;
                }
                // After successful deletion, remove the chip from the state
                setChipsData(chipsData.filter(c => c.id !== chip.id));
              }
            }}
          />
        </div>
      ))}

      <div className="mt-8 mx-auto flex justify-center">
        <Button
          variant="outline"
          onClick={() => {
            if (chipsData.some(c => c.id === 0)) return; // prevent adding multiple new chip forms
            setChipsData([
              ...chipsData,
              {
                id: 0,
                prefix: '',
                padding_n: 0,
                start: 0,
                end: 0
              }
            ]);
          }}
        >
          <PlusIcon className="h-4 w-4" />
          Crear nuevo segmento de chips
        </Button>
      </div>
    </div>
  );
}
