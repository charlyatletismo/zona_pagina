import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { eq, not } from 'drizzle-orm';
import { locations } from './db/schema';
import z from 'zod';
import { TEMPORARY_LOCATION_ID, LocationSchema } from '@shared/types';
import { authorizedOrg } from '@shared/roles';
import { M } from "./lib/messages";


export const locationsRoute = new Hono<{ Bindings: Env }>()
  .use(async (c, next) => {
    if (c.req.method !== 'GET' && !authorizedOrg(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    await next();
  })
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
  })
  .post("/create", async (c) => {
    const db = drizzle(c.env.DB);
    const {
      locality,
      province,
      country,
      latitude,
      longitude
    }: z.infer<typeof LocationSchema> = await c.req.json();

    // Insert the new location into the database
    await db.insert(locations).values({
      id: `${locality}, ${province}, ${country}`,
      locality,
      province,
      country,
      latitude,
      longitude
    });

    return c.json({ message: M.LOCATION_ADDED_SUCCESSFULLY });
  })
  .post("/update/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const {
      locality,
      province,
      country,
      latitude,
      longitude
    }: z.infer<typeof LocationSchema> = await c.req.json();

    // Update the existing location in the database
    await db.update(locations)
      .set({
        id: `${locality}, ${province}, ${country}`,
        locality,
        province,
        country,
        latitude,
        longitude
      })
      .where(eq(locations.id, id));

    return c.json({ message: M.LOCATION_UPDATED_SUCCESSFULLY });
  })
  .post("/delete/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();

    // Delete the location from the database
    await db.delete(locations)
      .where(eq(locations.id, id));

    return c.json({ message: M.LOCATION_DELETED_SUCCESSFULLY });
  });
