import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { eventTypes } from './db/schema';


export const eventTypesRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const eventType = await db.select().from(eventTypes).all();
    if (!eventType) {
      return c.json({ error: 'Event types not found' }, 404);
    }
    return c.json(eventType);
  });
