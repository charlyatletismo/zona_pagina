import { Hono } from "hono";
import { Env } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import { lt, gte, desc } from 'drizzle-orm';
import { events } from './db/schema'


export const eventsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const activeEvents = await db.select()
      .from(events)
      .where(gte(events.date, yesterday.toISOString()))
      .orderBy(desc(events.date));

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
      .from(events)
      .where(lt(events.date, yesterday.toISOString()))
      .orderBy(desc(events.date))
      .limit(5);

    return c.json({
      comingSoon: comingSoonEvents,
      open: openInscriptionEvents,
      closed: closedInscriptionEvents,
      past: pastEvents,
    });
  });
