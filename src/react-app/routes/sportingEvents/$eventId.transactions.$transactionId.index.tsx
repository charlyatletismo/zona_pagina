import { createFileRoute } from '@tanstack/react-router';
import authCheck from '@/lib/authCheck';
import { ORGANIZER_ROLE } from '@shared/roles';
import { getAuthenticatedThrow } from '@/lib/apiCalls';
import { ARSportEvTransactionSchema } from '@shared/apiRespTypes';
import z from 'zod';


export const Route = createFileRoute(
  '/sportingEvents/$eventId/transactions/$transactionId/',
)({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async ({ params }) => {
    const { transactionId } = params;
    const res = await getAuthenticatedThrow<
      z.infer<typeof ARSportEvTransactionSchema>
      >(`/api/sportingEventTransactions/${transactionId}`,
        ARSportEvTransactionSchema);
    return { res };
  },
  staleTime: 1000 * 60 * 5,
  gcTime: 0 // force reload every time
})


function RouteComponent() {
  return (
    <div>Hello "/sportingEvents/$eventId/transactions/$transactionId/"!</div>
  )
}
