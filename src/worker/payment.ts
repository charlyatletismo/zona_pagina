import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { and, eq } from 'drizzle-orm';
import { sportingEvents, sportingEventRegistrations } from './db/schema';
import { M } from "./lib/messages";


export const paymentRoute = new Hono<{ Bindings: Env }>()
  .post("/:eventId", async (c) => {
    const db = drizzle(c.env.DB);
    const { eventId } = c.req.param();
    const event = await db.select().from(sportingEvents).where(eq(sportingEvents.id, Number(eventId))).get();
    if (!event) {
      return c.json({ message: M.SPORTING_EVENT_NOT_FOUND }, 404);
    }
    const userId = c.get('jwtPayload').id;
    const registration = await db.select().from(sportingEventRegistrations).where(
      and(
        eq(sportingEventRegistrations.event_id, Number(eventId)),
        eq(sportingEventRegistrations.user_id, userId)
      )
    ).get();
    if (!registration) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_NOT_FOUND }, 403);
    }
    console.log("Using MercadoPago access token:", c.env.MERCADOPAGO_ACCESS_TOKEN);
    if (!c.env.MERCADOPAGO_ACCESS_TOKEN) {
      return c.json({ error: "MercadoPago access token not configured" }, 500);
    }
    let res: {
      id: string | null,
      init_point: string | null,
    } = {
      id: null,
      init_point: null,
    };
    let err = null;
    try {
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${c.env.MERCADOPAGO_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          items: [
            {
              id: `event_${eventId}_user_${userId}`,
              title: event.title,
              quantity: 1,
              unit_price: registration.fee_amount_after_discount,
            }
          ],
          // back_urls: {
          //   success: `http://localhost:5173/sportingEvents/${eventId}/registration`,
          //   failure: `http://localhost:5173/sportingEvents/${eventId}/registration`,
          //   pending: `http://localhost:5173/sportingEvents/${eventId}/registration`
          // },
          // auto_return: "approved",
        })
      });
      if (response.ok) {
        res = await response.json();
      } else {
        err = `HTTP ${response.status}: ${await response.text()}`;
      }
    } catch (error) {
      err = error;
    }
    console.log("MercadoPago preference creation response:", res);
    console.log("MercadoPago preference creation error:", err);

    return c.json({
      data: {
        init_point: res.init_point,
        preference_id: res.id,
      }
    });
  })