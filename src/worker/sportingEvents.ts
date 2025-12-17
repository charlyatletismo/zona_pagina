import { Hono } from "hono";
import { Env } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import { eq, lt, gte, desc } from 'drizzle-orm';
import { sportingEvents } from './db/schema'
import { updatedEventTrigger } from "./triggers";
import { ADMIN_ROLE, ORGANIZER_ROLE } from './_roles';


export const sportingEventsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const activeEvents = await db.select()
      .from(sportingEvents)
      .where(gte(sportingEvents.date, yesterday.toISOString()))
      .orderBy(desc(sportingEvents.date));

    let comingSoonEvents = [];
    let openInscriptionEvents = [];
    let closedInscriptionEvents = [];

    for (const event of activeEvents) {
      if (event.inscription_start && event.inscription_end) {
        const start = new Date(event.inscription_start);
        const end = new Date(event.inscription_end);
        if (now >= start && now <= end) {
          openInscriptionEvents.push(event);
        } else {
          closedInscriptionEvents.push(event);
        }
      } else {
        comingSoonEvents.push(event);
      }
    }

    const pastEvents = await db.select()
      .from(sportingEvents)
      .where(lt(sportingEvents.date, yesterday.toISOString()))
      .orderBy(desc(sportingEvents.date))
      .limit(5);

    return c.json({
      comingSoon: comingSoonEvents,
      open: openInscriptionEvents,
      closed: closedInscriptionEvents,
      past: pastEvents,
    });
  })
  .get("/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const event = await db.select()
      .from(sportingEvents)
      .where(eq(sportingEvents.id, Number(id)))
      .limit(1);
    if (event.length === 0) {
      return c.json({ error: "Event not found" }, 404);
    }
    return c.json(event[0]);
  })
  .post("/add", async (c) => {
    const userId: string = c.get('jwtPayload').id;
    const roles: string[] = c.get('jwtPayload').roles.split(',');
    if (!roles.includes(ADMIN_ROLE) && !roles.includes(ORGANIZER_ROLE)) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const db = drizzle(c.env.DB);
    const eventData: Record<string, any> = await c.req.json();
    if (!eventData.title || !eventData.date || !eventData.event_type) {
      return c.json({ error: "title, date and event_type are required" }, 400);
    }
    const data = {
      title: eventData.title,
      description: eventData.description || "",
      date: eventData.date,
      inscription_start: eventData.inscription_start,
      inscription_end: eventData.inscription_end,
      location_hint: eventData.location_hint,
      location_text: eventData.location_text,
      location_lat: eventData.location_lat,
      location_long: eventData.location_long,
      circuit_map_url: eventData.circuit_map_url,
      event_type: eventData.event_type,
      rules: eventData.rules,
      disclaimer_of_liability_title: eventData.disclaimer_of_liability_title,
      disclaimer_of_liability_content: eventData.disclaimer_of_liability_content,
      award_prizes: eventData.award_prizes,
      created_by: userId,
      last_update_by: userId,
    }
    const result = await db.insert(sportingEvents).values(data).returning();
    updatedEventTrigger(result[0].id);
    return c.json(result[0]);
  })
  .post("/update/:id", async (c) => {
    const roles: string[] = c.get('jwtPayload').roles.split(',');
    if (!roles.includes(ADMIN_ROLE) && !roles.includes(ORGANIZER_ROLE)) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const eventData: Record<string, any> = await c.req.json();
    if (!eventData.title || !eventData.date || !eventData.event_type) {
      return c.json({ error: "title, date and event_type are required" }, 400);
    }
    eventData.last_update_by = c.get('jwtPayload').id;
    eventData.last_update_at = new Date().toISOString();
    if (eventData.id) {
      delete eventData.id;
    }
    await db.update(sportingEvents)
      .set(eventData)
      .where(eq(sportingEvents.id, Number(id)))
      .run();
    updatedEventTrigger(Number(id));
    return c.json({ success: true });
  });
