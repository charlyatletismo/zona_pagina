import { createFileRoute } from '@tanstack/react-router'
import { ORGANIZER_ROLE } from '@shared/roles'
import authCheck from '@/lib/authCheck'
import { getAuthenticatedThrow, postAuthenticated } from '@/lib/apiCalls';
import { SportingEventRegistrationApiResponse } from '@/lib/types';
import {
  Table,
  TableBody,
  // TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Hourglass, CheckCircle2 } from 'lucide-react';
import React from 'react';

export const Route = createFileRoute('/sportingEvents/registrations')({
  component: RouteComponent,
  beforeLoad: authCheck([ORGANIZER_ROLE]),
  loader: async () => {
    const spEvType = await getAuthenticatedThrow('/api/sportingEventRegistrations');
    return spEvType;
  },
  staleTime: 1000 * 60 * 5, // 5 minutes
})

function RouteComponent() {
  const res = Route.useLoaderData();
  const [registrations, setRegistrations] = React.useState<SportingEventRegistrationApiResponse>(() => {
    return res.body.data || {};
  });

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">Inscripciones</h1>
      {Object.entries(registrations).map(([eventId, eventData]) => (
        <div key={eventId} className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">{eventData.metadata.title}</h2>
          <Table>
            {/* <TableCaption>List of registrations for {eventData.metadata.title}</TableCaption> */}
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Celular</TableHead>
                <TableHead>Inscripto</TableHead>
                <TableHead>Pagado</TableHead>
                <TableHead>Fecha de Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventData.registrations.map((reg: SportingEventRegistrationApiResponse[number]["registrations"][number]) => (
                <TableRow key={reg.registrationId}>
                  <TableCell>{reg.userName}</TableCell>
                  <TableCell>{reg.userEmail}</TableCell>
                  <TableCell>{reg.userPhone}</TableCell>
                  <TableCell>{new Date(reg.registrationDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button onClick={async () => {
                      const res = await postAuthenticated(`/api/sportingEventRegistrations/${reg.registrationId}/updatePayment`, { paid: reg.paid ? 0 : 1})
                      if (res.status === 200) {
                        reg.paid = res.body.data.paid === 1;
                        reg.paymentDate = res.body.data.payment_date;
                        setRegistrations({ ...registrations });
                      } else {
                        alert('Error updating payment status');
                      }
                    }} variant={reg.paid ? "outline" : "default"} size="sm">
                      {reg.paid ? <CheckCircle2 className="w-4 h-4" /> : <Hourglass className="w-4 h-4" />}
                    </Button>
                  </TableCell>
                  <TableCell>{reg.paymentDate ? new Date(reg.paymentDate).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  )
}
