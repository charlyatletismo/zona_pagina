import { DrizzleD1Database } from 'drizzle-orm/d1';
import {
  sportingEventTransactions,
} from '../db/schema';


export const registrationPaymentThroughMP = async (
  db: DrizzleD1Database,
  eventId: number,
  registrationId: number,
  userId: string,
  paidAmount: number,
  receivedAmount: number
) => {
  await db.insert(sportingEventTransactions).values({
    event_id: eventId,
    transaction_type: 'inflow',
    category: 'registration_payment',
    amount: receivedAmount,
    currency: 'ARS',
    description: `Pago de la inscripción del usuario ${userId} `
      + `a través de MercadoPago. Monto pagado: ${paidAmount}. `
      + `Monto recibido: ${receivedAmount}`,
    transaction_date: new Date().toISOString(),
    user_id: userId,
    registration_id: registrationId,
    payment_method: 'mercadopago',
    status: 'completed',
    created_by: userId,
    updated_by: userId,
  });
}
