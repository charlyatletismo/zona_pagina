import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { sportingEventTypes } from './db/schema';


export const sportingEventTypesRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const eventType = await db.select().from(sportingEventTypes).all();
    if (!eventType) {
      return c.json({ error: 'Event types not found' }, 404);
    }
    return c.json(eventType);
  });
