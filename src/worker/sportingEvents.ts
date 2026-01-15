import { Hono } from "hono";
import { Env } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import { authorizedAthMan, authorizedOrg } from '@shared/roles';
import { getSpEvent, addSpEvent, updateSpEvent, registerToSpEvent, delSpEvent } from "./lib/sportingEvents";
import { mainSportingEventsList } from "./lib/sportingEventList";
import {
  getUserRegistration,
  getManagedUsersRegistrations,
  getAllUsersRegistrations
} from "./lib/sportingEventRegistrations";
import { ARSportingEventSchema } from "@shared/apiRespTypes";
import { M } from "./lib/messages";


export const sportingEventsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const res = await mainSportingEventsList(db);
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
  .post("/:id/register", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { circuitId, userId }
      : {circuitId: number, userId: string} = await c.req.json();
    if (!circuitId) {
      return c.json({ message: M.SPORTING_EVENT_CIRCUIT_ID_REQUIRED }, 400);
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
