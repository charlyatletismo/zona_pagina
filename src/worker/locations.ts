import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { locations } from './db/schema';
import { eq, not } from 'drizzle-orm';
import { TEMPORARY_LOCATION_ID } from '@shared/types';


export const locationsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const allLocs: { id: string }[] = await db
      .select({
        id: locations.id
      })
      .from(locations)
      .where(not(eq(locations.id, TEMPORARY_LOCATION_ID)))
      .all();
    return c.json({ data: allLocs.map(loc => loc.id) });
  });
