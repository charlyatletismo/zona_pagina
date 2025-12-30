import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { sportingEventTypes } from './db/schema';
import { authorizedOrg } from './lib/roles';


export const sportingEventTypesRoute = new Hono<{ Bindings: Env }>()
  .use(async (c, next) => {
    if (c.req.method === "GET") {
      await next();
      return;
    }
    if (!authorizedOrg(c.get('jwtPayload')?.roles)) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    // Middleware to log requests to /api/users
    // console.log(`[UsersRoute] ${c.req.method} ${c.req.url}`);
    await next();
  })
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const eventType = await db.select().from(sportingEventTypes).all();
    if (!eventType) {
      return c.json({ error: 'Event types not found' }, 404);
    }
    return c.json(eventType);
  })
  .post("/create", async (c) => {
    const reqBody = await c.req.json();
    if (!reqBody.name) {
      return c.json({ error: "Missing required field: name" }, 400);
    }
    const db = drizzle(c.env.DB);
    const newEventType = await db
      .insert(sportingEventTypes)
      .values({
        name: reqBody.name,
        description: reqBody.description || null,
      })
      .returning();
    return c.json(newEventType[0]);
  })
  .get("/:spTypeId", async (c) => {
    const spTypeId = c.req.param("spTypeId");
    const db = drizzle(c.env.DB);
    const eventType = await db
      .select()
      .from(sportingEventTypes)
      .where(eq(sportingEventTypes.id, Number(spTypeId)))
      .get();
    if (!eventType) {
      return c.json({ error: "Sporting event type not found" }, 404);
    }
    return c.json(eventType);
  })
  .post("/:spTypeId", async (c) => {
    const spTypeId = c.req.param("spTypeId");
    const reqBody = await c.req.json();
    if (!reqBody.name) {
      return c.json({ error: "Missing required fields: name" }, 400);
    }
    const db = drizzle(c.env.DB);
    const updatedEventType = await db
      .update(sportingEventTypes)
      .set({
        name: reqBody.name,
        description: reqBody.description || null,
      })
      .where(eq(sportingEventTypes.id, Number(spTypeId)))
      .returning();
    if (updatedEventType.length === 0) {
      return c.json({ error: "Sporting event type not found" }, 404);
    }
    return c.json(updatedEventType[0]);
  });
