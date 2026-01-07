import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { locations } from './db/schema';


export const locationsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const allLocs: { id: string }[] = await db
      .select({
        id: locations.id
      })
      .from(locations)
      .all();
    return c.json({ data: allLocs.map(loc => loc.id) });
  });
