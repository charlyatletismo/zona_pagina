import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { users } from './db/schema';
import { eq, and, not, InferInsertModel } from 'drizzle-orm';
import {
  ADMIN_ROLE,
  ATHLETES_MANAGER_ROLE,
  authorizedAthMan,
  authorizedOrg
} from '@shared/roles';
import { ATHLETE_ROLE } from '@shared/roles';
import { ARUserSchema } from '@shared/apiRespTypes';
import { M } from './lib/messages';


export const usersRoute = new Hono<{ Bindings: Env }>()
  .use(async (c, next) => {
    if (!authorizedAthMan(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    // Middleware to log requests to /api/users
    // console.log(`[UsersRoute] ${c.req.method} ${c.req.url}`);
    await next();
  })
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    let allUsers;
    if (c.get('jwtPayload').role === ATHLETES_MANAGER_ROLE) {
      const managerId: string = c.get('jwtPayload').id;
      allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          surname: users.surname,
          phone: users.phone,
          email: users.email,
        })
        .from(users)
        .where(eq(users.manager_id, managerId))
        .all();
    } else {
      allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          surname: users.surname,
          phone: users.phone,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .all();
    }
    if (!allUsers) {
      return c.json({ message: M.USERS_UNAVAILABLE }, 404);
    }
    return c.json({ data: allUsers });
  })
  .post("/create", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const newUserData = ARUserSchema.safeParse(await c.req.json());
    if (!newUserData.success) {
      return c.json({ message: M.USER_INVALID_DATA }, 400);
    }
    const db = drizzle(c.env.DB);
    const res = await db.insert(users).values({
      ...newUserData.data,
      date_of_birth: newUserData.data.date_of_birth?.toISOString(),
      role: authorizedOrg(c.get('jwtPayload')?.role)
        ? (newUserData.data.role || ATHLETE_ROLE)
        : ATHLETE_ROLE,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).returning().get();
    return c.json({ message: M.USER_CREATED_SUCCESSFULLY, data: res });
  })
  .get("/managers", async (c) => {
    const db = drizzle(c.env.DB);
    if (!authorizedOrg(c.get('jwtPayload')?.role)) {
      if (c.get('jwtPayload').role !== ATHLETES_MANAGER_ROLE) {
        // return self
        return c.json({ data: [{
          id: c.get('jwtPayload').id,
          name: c.get('jwtPayload').name,
          surname: c.get('jwtPayload').surname
        }] })
      }
      if (!c.get('jwtPayload').manager_id) {
        return c.json({ data: [] });
      }
      const manager = await db
        .select({
          id: users.id,
          name: users.name,
          surname: users.surname,
        })
        .from(users)
        .where(eq(users.id, c.get('jwtPayload').manager_id))
        .get();
      if (!manager) {
        return c.json({ data: [] });
      }
      return c.json({ data: [manager] });
    }
    const managers = await db
      .select({
        id: users.id,
        name: users.name,
        surname: users.surname,
        phone: users.phone,
        email: users.email,
      })
      .from(users)
      .where(eq(users.role, ATHLETES_MANAGER_ROLE))
      .all();
    return c.json({ data: managers });
  })
  .get("/exists/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.req.param("id");
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        surname: users.surname
      })
      .from(users)
      .where(eq(users.id, userId))
      .get();
    return c.json({ data: user });
  })
  .get("/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.req.param("id");
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .get();
    if (!user) {
      return c.json({ message: M.USER_NOT_FOUND }, 404);
    }
    let filteredUser: any;
    if (c.get('jwtPayload').role === ATHLETES_MANAGER_ROLE) {
      const managerId = c.get('jwtPayload').id;
      if (user.manager_id !== managerId) {
        return c.json({ message: M.UNAUTHORIZED }, 403);
      }
      filteredUser = {
        id: user.id,
        name: user.name,
        surname: user.surname,
        phone: user.phone,
        email: user.email,
        emergency_contact_name: user.emergency_contact_name,
        emergency_contact_phone: user.emergency_contact_phone,
        sex: user.sex,
        date_of_birth: user.date_of_birth,
        clothing_shirt_size: user.clothing_shirt_size,
        location: user.location,
        location_temp: user.location_temp,
        location_address: user.location_address,
        special_needs: user.special_needs,
        discount_percentage: user.discount_percentage,
        manual_athlete_category: user.manual_athlete_category,
        manager_id: user.manager_id,
        training_team_id: user.training_team_id,
        training_team_temp: user.training_team_temp,
        profile_image_url: user.profile_image_url,
        profile_image_preview_url: user.profile_image_preview_url,
        language: user.language,
      }
    } else {
      filteredUser = user;
    }
    return c.json({ data: filteredUser });
  })
  .post("/:id/setRole", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const userId = c.req.param("id");
    const { role } = await c.req.json();
    const res = await db
      .update(users)
      .set({ role })
      .where(and(
        eq(users.id, userId),
        not(eq(users.role, ADMIN_ROLE)) // Prevent changing admin role
      ))
      .run();
    if (res.meta.changes === 0) {
      return c.json({ message: M.USER_NOT_FOUND_OR_CANNOT_CHANGE_ADMIN_ROLE }, 404);
    }
    return c.json({ message: M.USER_ROLE_UPDATED_SUCCESSFULLY });
  })
  .post("/:id/update", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.req.param("id");
    const updateData: Partial<InferInsertModel<typeof users>> = await c.req.json();
    delete updateData.id; // Prevent changing user ID
    delete updateData.created_at; // Prevent changing created_at
    delete updateData.temp_code; // Prevent changing temp_code
    updateData.updated_at = new Date().toISOString();

    if (c.get('jwtPayload').role === ATHLETES_MANAGER_ROLE) {
      // Athletes Manager can only update their own athletes
      delete updateData.role; // Prevent changing role
      delete updateData.discount_percentage; // Prevent changing discount percentage
      delete updateData.manual_athlete_category; // Prevent changing manual athlete category
      const managerId = c.get('jwtPayload').id;
      const res = await db.update(users)
        .set(updateData)
        .where(and(
          eq(users.id, userId),
          eq(users.manager_id, managerId)
        ))
        .run();
      if (res.meta.changes === 0) {
        return c.json({ message: M.USER_NOT_FOUND_OR_UNAUTHORIZED }, 404);
      };
    } else {
      // Admin or Organizer can update everything except admin role
      const res = await db.update(users)
        .set(updateData)
        .where(and(
          eq(users.id, userId),
          not(eq(users.role, ADMIN_ROLE)) // Prevent changing admin role
        ))
        .run();
      if (res.meta.changes === 0) {
        return c.json({ message: M.USER_NOT_FOUND_OR_UNAUTHORIZED }, 404);
      };
    }
    return c.json({ message: M.USER_PROFILE_UPDATED_SUCCESSFULLY });
  })
  .post("/changeId", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { newId, oldId } = await c.req.json();
    if (!newId || !oldId) {
      return c.json({ message: M.USER_INVALID_DATA }, 400);
    }
    // Check if newId already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, newId))
      .get();
    if (existingUser) {
      return c.json({ message: M.USER_ALREADY_EXISTS }, 400);
    }
    const res = await db
      .update(users)
      .set({ id: newId })
      .where(eq(users.id, oldId))
      .run();
    if (res.meta.changes === 0) {
      return c.json({ message: M.USER_NOT_FOUND }, 404);
    }
    return c.json({ message: M.USER_ID_UPDATED_SUCCESSFULLY });
  });
