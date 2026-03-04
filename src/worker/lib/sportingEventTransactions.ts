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
    amount: paidAmount,
    currency: 'ARS',
    transaction_date: new Date().toISOString(),
    user_id: userId,
    registration_id: registrationId,
    payment_method: 'mercado_pago_checkout_pro',
    status: 'completed',
    created_by: userId,
    updated_by: userId,
  });
  await db.insert(sportingEventTransactions).values({
    event_id: eventId,
    transaction_type: 'outflow',
    category: 'mercado_pago_fee',
    amount: paidAmount - receivedAmount,
    currency: 'ARS',
    transaction_date: new Date().toISOString(),
    user_id: userId,
    registration_id: registrationId,
    payment_method: 'mercado_pago_checkout_pro',
    status: 'completed',
    created_by: userId,
    updated_by: userId,
  });
}
