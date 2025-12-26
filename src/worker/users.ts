import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';
import { ADMIN_ROLE, ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE, ATHLETE_ROLE } from './lib/roles';


export const usersRoute = new Hono<{ Bindings: Env }>()
  .use(async (c, next) => {
    const roles: string[] = c.get('jwtPayload').roles.split(',');
    if (!roles.includes(ADMIN_ROLE) && !roles.includes(ORGANIZER_ROLE)) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    // Middleware to log requests to /api/users
    // console.log(`[UsersRoute] ${c.req.method} ${c.req.url}`);
    await next();
  })
  .get("/", async (c) => {
    // const roles: string[] = c.get('jwtPayload').roles.split(',');
    // if (!roles.includes(ADMIN_ROLE) && !roles.includes(ORGANIZER_ROLE)) {
    //   return c.json({ error: "Unauthorized" }, 403);
    // }
    const db = drizzle(c.env.DB);
    const allUsers = await db.select().from(users).all();
    if (!allUsers) {
      return c.json({ error: 'Users not found' }, 404);
    }
    return c.json(allUsers);
  })
  .get("/:id", async (c) => {
    // const roles: string[] = c.get('jwtPayload').roles.split(',');
    // if (!roles.includes(ADMIN_ROLE) && !roles.includes(ORGANIZER_ROLE)) {
    //   return c.json({ error: "Unauthorized" }, 403);
    // }
    const db = drizzle(c.env.DB);
    const userId = c.req.param("id");
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json(user);
  })
  .post("/:id/setRole", async (c) => {
    // const roles: string[] = c.get('jwtPayload').roles.split(',');
    // if (!roles.includes(ADMIN_ROLE) && !roles.includes(ORGANIZER_ROLE)) {
    //   return c.json({ error: "Unauthorized" }, 403);
    // }
    const db = drizzle(c.env.DB);
    const userId = c.req.param("id");
    const { role } = await c.req.json();
    if (![ORGANIZER_ROLE, ATHLETES_MANAGER_ROLE, ATHLETE_ROLE].includes(role)) {
        return c.json({ error: "Invalid role" }, 400);
    }

    // For simplicity, let's assume we are promoting to 'organizer' role
    await db.update(users)
      .set({ roles: role })
      .where(eq(users.id, userId))
      .run();

    return c.json({ success: true, message: 'User role updated successfully' });
  })
  .post("/:id/update", async (c) => {
    // const roles: string[] = c.get('jwtPayload').roles.split(',');
    // if (!roles.includes(ADMIN_ROLE) && !roles.includes(ORGANIZER_ROLE)) {
    //   return c.json({ error: "Unauthorized" }, 403);
    // }
    const db = drizzle(c.env.DB);
    const userId = c.req.param("id");
    const updateData = await c.req.json();

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .run();

    return c.json({ success: true, message: 'User profile updated successfully' });
  });
