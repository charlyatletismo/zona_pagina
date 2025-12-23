import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { sportingEvents, sportingEventRegistrations, users } from './db/schema';
import { ADMIN_ROLE, ORGANIZER_ROLE } from './_roles';
import { gte, eq } from 'drizzle-orm';


export const sportingEventRegistrationsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const roles: string[] = c.get('jwtPayload').roles.split(',');
    if (!roles.includes(ADMIN_ROLE) && !roles.includes(ORGANIZER_ROLE)) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const activeEventsRegistrations = await db.select().from(sportingEvents).where(
      gte(sportingEvents.date, yesterday.toISOString())
    ).innerJoin(
      sportingEventRegistrations,
      eq(sportingEvents.id, sportingEventRegistrations.event_id)
    ).innerJoin(
      users,
      eq(sportingEventRegistrations.user_id, users.id)
    );
    if (activeEventsRegistrations.length === 0) {
      return c.json({});
    }
    const out: Record<number, {metadata: any, registrations: any[]}> = {};
    for (const event of activeEventsRegistrations) {
      if (!out[event.sporting_events.id]) {
        out[event.sporting_events.id] = {
          metadata: {
            eventId: event.sporting_events.id,
            title: event.sporting_events.title,
            date: event.sporting_events.date,
            registration_start: event.sporting_events.registration_start,
            registration_end: event.sporting_events.registration_end,
          },
          registrations: []
        };
      }
      out[event.sporting_events.id].registrations.push({
        registrationId: event.sporting_event_registrations.id,
        userId: event.users.id,
        userName: event.users.name,
        userEmail: event.users.email,
        userPhone: event.users.phone,
        registrationDate: event.sporting_event_registrations.registration_date,
        paid: event.sporting_event_registrations.paid === 1,
        paymentDate: event.sporting_event_registrations.payment_date,
      });
    }
    return c.json(out);
  })
  .post("/:registrationId/updatePayment", async (c) => {
    const db = drizzle(c.env.DB);
    const roles: string[] = c.get('jwtPayload').roles.split(',');
    if (!roles.includes(ADMIN_ROLE) && !roles.includes(ORGANIZER_ROLE)) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    const registrationId = Number(c.req.param('registrationId'));
    const body = await c.req.json();
    const paid = body.paid ? 1 : 0;
    const payment_date = paid === 1 ? new Date().toISOString() : null;
    const updateResult = await db.update(sportingEventRegistrations)
      .set({
        paid,
        payment_date,
      })
      .where(eq(sportingEventRegistrations.id, registrationId))
      .returning();
    if (updateResult.length === 0) {
      return c.json({ error: "Registration not found" }, 404);
    }
    return c.json({
      paid: updateResult[0].paid,
      payment_date: updateResult[0].payment_date,
    });
  });
