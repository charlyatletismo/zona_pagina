import { DrizzleD1Database } from 'drizzle-orm/d1';
import z from 'zod';
import {
  sportingEventTransactions,
} from '../db/schema';
import {
  SportingEventTransactionSchema,
  SportingEventRegistrationSchema,
} from '@shared/types';


// Transaction written by a payment webhook. (external_payment_id, registration_id, category)
// identifies the row, so both ids are required
const ExternalPaymentTransactionSchema = SportingEventTransactionSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  external_payment_id: z.string().min(1).max(128),
  registration_id: SportingEventRegistrationSchema.shape.id,
});


const upsertMPTransaction = async (
  db: DrizzleD1Database,
  input: z.infer<typeof ExternalPaymentTransactionSchema>,
) => {
  const values = ExternalPaymentTransactionSchema.parse(input);
  // A payment provider can notify the same payment several times (even concurrently),
  // so (external_payment_id, registration_id, category) identifies the row.
  // The unique index on those columns makes this a single atomic upsert
  await db.insert(sportingEventTransactions)
    .values({
      ...values,
      transaction_date: values.transaction_date.toISOString(),
    })
    .onConflictDoUpdate({
      target: [
        sportingEventTransactions.external_payment_id,
        sportingEventTransactions.registration_id,
        sportingEventTransactions.category,
      ],
      set: {
        amount: values.amount,
        status: values.status,
        payment_method: values.payment_method,
        updated_by: values.updated_by,
        updated_at: new Date().toISOString(),
      },
    });
}


export const registrationPaymentThroughMP = async (
  db: DrizzleD1Database,
  externalPaymentId: string,
  eventId: number,
  registrationId: number,
  userId: string,
  paidAmount: number,
  receivedAmount: number
) => {
  await upsertMPTransaction(db, {
    event_id: eventId,
    transaction_type: 'inflow',
    category: 'registration_payment',
    amount: paidAmount,
    currency: 'ARS',
    transaction_date: new Date(),
    user_id: userId,
    registration_id: registrationId,
    payment_method: 'mercado_pago_checkout_pro',
    status: 'completed',
    external_payment_id: externalPaymentId,
    created_by: userId,
    updated_by: userId,
  });
  await upsertMPTransaction(db, {
    event_id: eventId,
    transaction_type: 'outflow',
    category: 'mercado_pago_fee',
    amount: paidAmount - receivedAmount,
    currency: 'ARS',
    transaction_date: new Date(),
    user_id: userId,
    registration_id: registrationId,
    payment_method: 'mercado_pago_checkout_pro',
    status: 'completed',
    external_payment_id: externalPaymentId,
    created_by: userId,
    updated_by: userId,
  });
}
