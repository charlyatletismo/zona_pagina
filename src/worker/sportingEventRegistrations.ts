import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import {
  sportingEvents,
  sportingEventRegistrations,
  sportingEventTransactions,
  users } from './db/schema';
import { authorizedOrg } from '@shared/roles';
import { gte, eq } from 'drizzle-orm';
import { M } from './lib/messages';


export const sportingEventRegistrationsRoute = new Hono<{ Bindings: Env }>()
  .use(async (c, next) => {
    if (!authorizedOrg(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    // Middleware to log requests to /api/users
    // console.log(`[UsersRoute] ${c.req.method} ${c.req.url}`);
    await next();
  })
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const activeEventsRegistrations = await db
      .select()
      .from(sportingEvents)
      .where(gte(sportingEvents.date, yesterday.toISOString()))
      .innerJoin(
        sportingEventRegistrations,
        eq(sportingEvents.id, sportingEventRegistrations.event_id))
      .innerJoin(
        users,
        eq(sportingEventRegistrations.user_id, users.id)
      );
    if (activeEventsRegistrations.length === 0) {
      return c.json({ data: [] });
    }
    const out: Record<number, {metadata: any, registrations: any[]}> = {};
    for (const event of activeEventsRegistrations) {
      if (!out[event.sporting_events.id]) {
        out[event.sporting_events.id] = {
          metadata: {
            event_id: event.sporting_events.id,
            title: event.sporting_events.title,
            date: event.sporting_events.date,
            registration_start: event.sporting_events.registration_start,
            registration_end: event.sporting_events.registration_end,
          },
          registrations: []
        };
      }
      out[event.sporting_events.id].registrations.push({
        registration_id: event.sporting_event_registrations.id,
        user_id: event.users.id,
        user_name: event.users.name,
        user_email: event.users.email,
        user_phone: event.users.phone,
        registration_date: event.sporting_event_registrations.registration_date,
        registration_status: event.sporting_event_registrations.status,
        paid_percentage: event.sporting_event_registrations.paid_percentage,
        full_payment_date: event.sporting_event_registrations.full_payment_date,
      });
    }
    return c.json({ data: out });
  })
  .post("/:registrationId/newPayment", async (c) => {
    const userId = c.get('jwtPayload')?.id;
    if (!userId) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const registrationId = Number(c.req.param('registrationId'));
    const { amount, transaction_date, receipt_url, payment_method, status, notes } = await c.req.json();
    if (!amount || !transaction_date || !receipt_url || !payment_method || !status) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_PAYMENT_MISSING_REQUIRED_FIELDS }, 400);
    }
    const registration = await db
      .select()
      .from(sportingEventRegistrations)
      .where(eq(sportingEventRegistrations.id, registrationId))
      .limit(1)
      .get();
    if (!registration) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_NOT_FOUND }, 404);
    }
    const spEvent = await db
      .select()
      .from(sportingEvents)
      .where(eq(sportingEvents.id, registration.event_id))
      .limit(1)
      .get();
    if (!spEvent) {
      return c.json({ message: M.SPORTING_EVENT_NOT_FOUND }, 404);
    }

    await db.insert(sportingEventTransactions).values({
      event_id: registration.event_id,
      transaction_type: 'income',
      category: 'registration',
      amount,
      currency: spEvent.fee_currency!,
      description: `Payment for registration / Pago de registro`,
      transaction_date,
      user_id: registration.user_id,
      registration_id: registration.id,
      receipt_url,
      payment_method,
      status,
      created_by: userId,
      updated_by: userId,
      notes,
    }).run();

    const totalPaid = (registration.paid_amount || 0) + amount;
    const fullyPaid = totalPaid >= registration.fee_amount_after_discount;

    await db.update(sportingEventRegistrations)
      .set({
        paid_amount: totalPaid,
        paid_percentage:
          registration.fee_amount_after_discount !== 0
          ? (totalPaid / registration.fee_amount_after_discount) * 100
          : 100,
        full_payment_date: fullyPaid ? new Date().toISOString() : null,
        status: fullyPaid ? 'paid' : 'partially_paid',
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .where(eq(sportingEventRegistrations.id, registrationId))
      .run();
    return c.json({ message: M.SPORTING_EVENT_REGISTRATION_PAYMENT_SUCCESSFUL });
  });
