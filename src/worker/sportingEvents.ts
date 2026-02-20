import { Hono } from "hono";
import { Env } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import {
  authorizedAthMan,
  authorizedOrg
} from '@shared/roles';
import {
  getSpEvent,
  addSpEvent,
  updateSpEvent,
  delSpEvent,
  getSpEventMin
} from "./lib/sportingEvents";
import {
  registerToSpEvent,
  deleteRegistrationToSpEvent
} from "./lib/sportingEventRegistrationActions";
import {
  mainSportingEventsList,
  allSportingEventsList,
  getUserRegisteredSpEvents,
} from "./lib/sportingEventList";
import {
  getUserRegistration,
  getManagedUsersRegistrations,
  getAllUsersRegistrations,
  getUserRegistrationWithEvent,
  setRegistrationAsPaid,
} from "./lib/sportingEventRegistrations";
import { ARSportingEventSchema } from "@shared/apiRespTypes";
import { M } from "./lib/messages";


export const sportingEventsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const res = await mainSportingEventsList(db);
    return c.json({ data: res });
  })
  .get("/all", async (c) => {
    const db = drizzle(c.env.DB);
    const res = await allSportingEventsList(db);
    return c.json({ data: res });
  })
  .get("/myEvents", async (c) => {
    const db = drizzle(c.env.DB);
    const userId: string = c.get('jwtPayload').id;
    const res = await getUserRegisteredSpEvents(db, userId);
    return c.json({ data: res });
  })
  .get("/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const userId: string | null = c.get('jwtPayload')?.id || null;
    const res = await getSpEvent(db, Number(id), userId);
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ data: res.data });
  })
  .get("/exists/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const res = await getSpEventMin(db, Number(id));
    return c.json(res, res.status);
  })
  .post("/:id/register", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { circuitId, userId }
      : {circuitId: number, userId: string} = await c.req.json();
    if (!circuitId) {
      return c.json({ message: M.SPORTING_EVENT_CIRCUIT_ID_REQUIRED }, 400);
    }
    if (!userId) {
      return c.json({ message: M.SPORTING_EVENT_USER_ID_REQUIRED }, 400);
    }
    const reqUserId: string = c.get('jwtPayload')?.id;
    const res = await registerToSpEvent(
      db,
      Number(id),
      reqUserId,
      userId,
      circuitId);
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: res.message, data: res.data });
  })
  .post("/:id/unregister", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { userId }
      : {userId: string} = await c.req.json();
    if (!userId) {
      return c.json({ message: M.SPORTING_EVENT_USER_ID_REQUIRED }, 400);
    }
    const reqUserId: string = c.get('jwtPayload')?.id;
    const res = await deleteRegistrationToSpEvent(
      db,
      Number(id),
      reqUserId,
      userId);
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: res.message });
  })
  .get("/:id/registration", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const userId: string = c.get('jwtPayload').id;
    const res = await getUserRegistration(db, Number(id), userId);
    if (!res) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_NOT_FOUND }, 404);
    }
    return c.json({ data: res });
  })
  .get("/:id/allRegistrations", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const res = await getAllUsersRegistrations(db, Number(id));
    return c.json({ data: res });
  })
  .get("/:id/managedRegistrations", async (c) => {
    if (!authorizedAthMan(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const userId: string = c.get('jwtPayload').id;
    const res = await getManagedUsersRegistrations(db, Number(id), userId);
    return c.json({ data: res });
  })
  .post("/:id/pay", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.get('jwtPayload').id;
    const { id } = c.req.param();
    const data = await getUserRegistrationWithEvent(db, Number(id), userId);
    if (!data || !data.registration) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_NOT_FOUND }, 403);
    }
    if (data.registration.status === 'paid') {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_ALREADY_PAID }, 400);
    }
    if ((data.payment?.pending_to_pay || 0) <= 0) {
      // update registration status to paid (this MUST NEVER happen)
      console.error(`Registration ${data.registration.id} for event `
        + `${id} has no pending amount to pay but is not marked `
        + `as paid. Marking as paid to avoid blocking the user.`);
      setRegistrationAsPaid(db, data.registration.id, userId);
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_ALREADY_PAID }, 400);
    }
    // console.log("Using MercadoPago access token:", c.env.MERCADOPAGO_ACCESS_TOKEN);
    if (!c.env.MERCADOPAGO_ACCESS_TOKEN) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_PAYMENT_PROCESSING_ERROR }, 500);
    }
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.MERCADOPAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items: [
          {
            id: `event_${id}_user_${userId}`,
            title: data.event.title,
            quantity: 1,
            unit_price: data.payment?.pending_to_pay || 0,
          }
        ],
        // back_urls: {
        //   success: `http://localhost:5173/sportingEvents/${id}/registration`,
        //   failure: `http://localhost:5173/sportingEvents/${id}/registration`,
        //   pending: `http://localhost:5173/sportingEvents/${id}/registration`
        // },
        // auto_return: "approved",
      })
    });
    if (!response.ok) {
      console.error(`HTTP ${response.status}: ${await response.text()}`);
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_PAYMENT_PROCESSING_ERROR }, 500);
    }
    // console.log("MercadoPago preference creation response:", res);
    // console.log("MercadoPago preference creation error:", err);

    const res: {
      id: string | null,
      init_point: string | null,
    } = await response.json();
    return c.json({
      data: {
        init_point: res.init_point,
        preference_id: res.id,
      }
    });
  })
  .post("/create", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const userId: string = c.get('jwtPayload').id;
    const db = drizzle(c.env.DB);
    const eventData = ARSportingEventSchema.omit({id: true}).safeParse(await c.req.json());
    if (!eventData.success) {
      return c.json({ message: M.SPORTING_EVENT_MISSING_REQUIRED_FIELDS }, 400);
    }
    const res = await addSpEvent(db, eventData.data, userId);
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({
      data: res.data,
      message: M.SPORTING_EVENT_CREATED_SUCCESSFULLY
    });
  })
  .post("/update/:id", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const userId: string = c.get('jwtPayload').id;
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const eventData = ARSportingEventSchema.safeParse(await c.req.json());
    if (!eventData.success) {
      return c.json({ message: M.SPORTING_EVENT_MISSING_REQUIRED_FIELDS }, 400);
    }
    const res = await updateSpEvent(db, Number(id), eventData.data, userId);
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: M.SPORTING_EVENT_UPDATED_SUCCESSFULLY });
  })
  .post("/delete/:id", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const res = await delSpEvent(db, Number(id));
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: M.SPORTING_EVENT_DELETED_SUCCESSFULLY });
  });
