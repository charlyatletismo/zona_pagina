import { Hono } from "hono";
import { Env } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import { eq, lt, gte, desc, and, asc } from 'drizzle-orm';
import {
  users,
  sportingEvents,
  sportingEventRegistrations,
  sportingEventAthleteCategories,
  athleteCategories,
  sportingEventCircuits,
  sportingEventSchedules
} from './db/schema'
import { updatedEventTrigger } from "./triggers";
import { ADMIN_ROLE, ORGANIZER_ROLE, authorizedRoles } from './lib/roles';
import { getSpEvent, addSpEvent } from "./lib/sportingEvents";
import { SportingEventFormData } from "./lib/types";


export const sportingEventsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const SELECT_QUERY = {
      id: sportingEvents.id,
      title: sportingEvents.title,
      description: sportingEvents.description,
      date: sportingEvents.date,
      registration_start: sportingEvents.registration_start,
      registration_end: sportingEvents.registration_end,
      location_hint: sportingEvents.location_hint,
      location_text: sportingEvents.location_text,
    };
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const activeEvents = await db
      .select(SELECT_QUERY)
      .from(sportingEvents)
      .where(gte(sportingEvents.date, yesterday.toISOString()))
      .orderBy(desc(sportingEvents.date));

    let comingSoonEvents = [];
    let openRegistrationEvents = [];
    let closedRegistrationEvents = [];

    for (const event of activeEvents) {
      if (event.registration_start && event.registration_end) {
        const start = new Date(event.registration_start);
        const end = new Date(event.registration_end);
        if (now >= start && now <= end) {
          openRegistrationEvents.push(event);
        } else {
          closedRegistrationEvents.push(event);
        }
      } else {
        comingSoonEvents.push(event);
      }
    }

    const pastEvents = await db
      .select(SELECT_QUERY)
      .from(sportingEvents)
      .where(lt(sportingEvents.date, yesterday.toISOString()))
      .orderBy(desc(sportingEvents.date))
      .limit(5);

    return c.json({
      comingSoon: comingSoonEvents,
      open: openRegistrationEvents,
      closed: closedRegistrationEvents,
      past: pastEvents,
    });
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
