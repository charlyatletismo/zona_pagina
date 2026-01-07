import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { authorizedOrg } from '@shared/roles';
import { M } from './lib/messages';
import { getAllSpClothing } from './lib/sportingEventClothing';


export const athleteCategoryTemplatesRoute = new Hono<{ Bindings: Env }>()
  .use(async (c, next) => {
    if (!authorizedOrg(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    // Middleware to log requests to /api/users
    // console.log(`[UsersRoute] ${c.req.method} ${c.req.url}`);
    await next();
  })
  .get("/sportingEvent/:eventId", async (c) => {
    const db = drizzle(c.env.DB);
    const eventId = Number(c.req.param("eventId"));
    return c.json(getAllSpClothing(db, eventId));
  });
