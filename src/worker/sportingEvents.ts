import { Hono } from "hono";
import { Env } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import { ADMIN_ROLE, ORGANIZER_ROLE, authorizedRoles } from './lib/roles';
import { getSpEvent, addSpEvent, updateSpEvent, registerToSpEvent } from "./lib/sportingEvents";
import { mainSportingEventsList } from "./lib/sportingEventList";
import { SportingEventFormData } from "./lib/types";


export const sportingEventsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const res = await mainSportingEventsList(db);
    return c.json(res);
  })
  .get("/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const userId: string | null = c.get('jwtPayload')?.id || null;
    const event = await getSpEvent(db, Number(id), userId);
    if (!event) {
      return c.json({ error: "Event not found" }, 404);
    }
    return c.json(event);
  })
  .post("/:id/register", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const payload = await c.req.json();
    if (!payload || !payload.circuitId) {
      return c.json({ error: "circuitId is required" }, 400);
    }
    const userId: string = c.get('jwtPayload').id;
    const res = await registerToSpEvent(db, Number(id), userId, Number(payload.circuitId));
    if (res.error) {
      if (res.error_404) {
        return c.json({ message: res.error_404 }, 404);
      }
      if (res.error_400) {
        return c.json({ message: res.error_400 }, 400);
      }
      throw new Error("Unhandled error");
    }
    return c.json({ success: true });
  })
  .post("/create", async (c) => {
    const userId: string = c.get('jwtPayload').id;
    const roles: string[] = c.get('jwtPayload').roles.split(',');
    if (!authorizedRoles([ADMIN_ROLE, ORGANIZER_ROLE], roles)) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    const db = drizzle(c.env.DB);
    const eventData: SportingEventFormData = await c.req.json();
    if (!eventData.title || !eventData.date || !eventData.event_type) {
      return c.json({ error: "title, date and event_type are required" }, 400);
    }
    const eventId = await addSpEvent(db, eventData, userId);
    return c.json({success: true, eventId: eventId});
  })
  .post("/update/:id", async (c) => {
    const userId: string = c.get('jwtPayload').id;
    const roles: string[] = c.get('jwtPayload').roles.split(',');
    if (!authorizedRoles([ADMIN_ROLE, ORGANIZER_ROLE], roles)) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const eventData: Partial<SportingEventFormData> = await c.req.json();
    if (!eventData.title || !eventData.date || !eventData.event_type) {
      return c.json({ error: "title, date and event_type are required" }, 400);
    }
    await updateSpEvent(db, Number(id), eventData, userId);
    return c.json({ success: true });
  });
