import { Hono } from "hono";
import { Env } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import { eq, lt, gte, and } from 'drizzle-orm';
import {
  users,
  sportingEvents,
  sportingEventRegistrations,
  sportingEventAthleteCategories,
  athleteCategories
} from './db/schema'
import { ADMIN_ROLE, ORGANIZER_ROLE, authorizedRoles } from './lib/roles';
import { getSpEvent, addSpEvent, updateSpEvent } from "./lib/sportingEvents";
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
    const event = await db.select()
      .from(sportingEvents)
      .where(eq(sportingEvents.id, Number(id)))
      .limit(1);
    if (event.length === 0) {
      return c.json({ error: "Event not found" }, 404);
    }
    const registration = await db.select({id: sportingEventRegistrations.id})
      .from(sportingEventRegistrations)
      .where(and(
        eq(sportingEventRegistrations.user_id, userId),
        eq(sportingEventRegistrations.event_id, Number(id)),
      ))
      .limit(1);
    if (registration.length > 0) {
      return c.json({ error: "User already registered for this event" }, 400);
    }
    let categoryId: number | null = null;
    const userData = await db
      .select({
        dob: users.date_of_birth,
        category: users.hard_category})
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (userData.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }
    if (userData[0].category) {
      categoryId = userData[0].category;
    } else {
      // try to find category based on age
      if (!userData[0].dob) {
        return c.json({ error: "User date of birth not set" }, 400);
      }
      const birthDate = new Date(userData[0].dob);
      const today = new Date();
      let age = today.getUTCMilliseconds() - birthDate.getUTCMilliseconds();
      age /= 1000 * 60 * 60 * 24;
      age = Math.floor(age / 365.25);
      const category = await db
        .select({id: athleteCategories.id})
        .from(athleteCategories)
        .where(and(
          gte(athleteCategories.min_age, age),
          lt(athleteCategories.max_age, age + 1),
        ))
        .limit(1);
      if (category.length === 0) {
        return c.json({ error: "No athlete category found for user's age" }, 400);
      }
      categoryId = category[0].id;
    }

    const spCategory = await db
      .select({id: sportingEventAthleteCategories.id})
      .from(sportingEventAthleteCategories)
      .where(and(
        eq(sportingEventAthleteCategories.event_id, Number(id)),
        eq(sportingEventAthleteCategories.athlete_category_id, categoryId),
        eq(sportingEventAthleteCategories.circuit_id, Number(payload.circuitId)),
      ))
      .limit(1);
    if (spCategory.length === 0) {
      return c.json({ error: "No sporting event category found for user" }, 400);
    }

    await db.insert(sportingEventRegistrations).values({
      event_id: event[0].id,
      user_id: userId,
      registration_date: new Date().toISOString(),
      category_id: spCategory[0].id,
    });
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
