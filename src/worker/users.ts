import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { users } from './db/schema';
import { eq, and, not, like } from 'drizzle-orm';
import { ADMIN_ROLE, ATHLETES_MANAGER_ROLE, authorizedAthMan, authorizedOrg } from './lib/roles';


export const usersRoute = new Hono<{ Bindings: Env }>()
  .use(async (c, next) => {
    if (!authorizedAthMan(c.get('jwtPayload')?.roles)) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    // Middleware to log requests to /api/users
    // console.log(`[UsersRoute] ${c.req.method} ${c.req.url}`);
    await next();
  })
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const roles = c.get('jwtPayload').roles.split(",");
    let allUsers;
    if (roles.length === 1 && roles[0] === ATHLETES_MANAGER_ROLE) {
      const managerId = c.get('jwtPayload').id;
      allUsers = await db.select({
        id: users.id,
        name: users.name,
        surname: users.surname,
        phone: users.phone,
        email: users.email,
      }).from(users).where(eq(users.manager_id, managerId)).all();
    } else {
      allUsers = await db.select({
        id: users.id,
        name: users.name,
        surname: users.surname,
        phone: users.phone,
        email: users.email,
        roles: users.roles,
      }).from(users).all();
    }
    if (!allUsers) {
      return c.json({ error: 'Users not found' }, 404);
    }
    return c.json(allUsers);
  })
  .get("/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.req.param("id");
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    const roles = c.get('jwtPayload').roles.split(",");
    if (roles.length === 1 && roles[0] === ATHLETES_MANAGER_ROLE) {
      const managerId = c.get('jwtPayload').id;
      if (user.manager_id !== managerId) {
        return c.json({ error: "Unauthorized" }, 403);
      }
    }
    return c.json(user);
  })
  .post("/:id/setRole", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.req.param("id");
    const { role } = await c.req.json();
    if (!authorizedOrg(c.get('jwtPayload')?.roles)) {
      return c.json({ error: "Invalid role" }, 400);
    }
    const res = await db.update(users)
      .set({ roles: role })
      .where(and(
        eq(users.id, userId),
        not(like(users.roles, ADMIN_ROLE)) // Prevent changing admin role
      ))
      .run();

    if (res.meta.changes === 0) {
      return c.json({ error: "User not found or cannot change admin role" }, 404);
    }

    return c.json({ success: true, message: 'User role updated successfully' });
  })
  .post("/:id/update", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.req.param("id");
    const updateData = await c.req.json();
    const data: Record<string, any> = {
      phone: updateData.phone,
      name: updateData.name,
      surname: updateData.surname,
      sex: updateData.sex,
      date_of_birth: updateData.date_of_birth,
      country: updateData.country,
      city: updateData.city,
      full_location: updateData.full_location,
      manager_id: updateData.manager_id,
      training_team: updateData.training_team,
      email: updateData.email,
      profile_image_url: updateData.profile_image_url,
      profile_image_preview_url: updateData.profile_image_preview_url,
      updated_at: new Date().toISOString(),
    }

    const roles = c.get('jwtPayload').roles.split(",");
    let wasUpdated = false;
    if (roles.length === 1 && roles[0] === ATHLETES_MANAGER_ROLE) {
      // Athletes Manager can only update their own athletes
      const managerId = c.get('jwtPayload').id;
      const res = await db.update(users)
        .set(data)
        .where(and(
          eq(users.id, userId),
          eq(users.manager_id, managerId)
        ))
        .run();
      wasUpdated = res.meta.changes > 0;
    } else {
      // Admin or Organizer can update roles and hard_category
      data.roles = updateData.roles;
      data.hard_category = updateData.hard_category;
      const res = await db.update(users)
        .set(data)
        .where(eq(users.id, userId))
        .run();
      wasUpdated = res.meta.changes > 0;
    }
    if (!wasUpdated) {
      return c.json({ error: "User not found or unauthorized" }, 404);
    }

    return c.json({ success: true, message: 'User profile updated successfully' });
  });
