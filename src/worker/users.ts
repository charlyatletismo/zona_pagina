import { Hono } from 'hono';
import { Env, Variables } from './index';
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


export const usersRoute = new Hono<{ Bindings: Env, Variables: Variables }>()
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
          training_team_id: users.training_team_id,
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
          training_team_id: users.training_team_id,
          manager_id: users.manager_id,
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
    // if (!authorizedOrg(c.get('jwtPayload')?.role)) {
    //   return c.json({ message: M.UNAUTHORIZED }, 403);
    // }
    const newUserData = ARUserSchema.safeParse(await c.req.json());
    if (!newUserData.success) {
      return c.json({ message: M.USER_INVALID_DATA }, 400);
    }
    if (!newUserData.data.id || !newUserData.data.phone) {
      return c.json({ message: M.USER_INVALID_DATA }, 400);
    }
    const db = drizzle(c.env.DB);
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, newUserData.data.id))
      .get();
    if (existingUser) {
      return c.json({ message: M.USER_ALREADY_EXISTS }, 400);
    }
    const existingPhone = await db
      .select()
      .from(users)
      .where(eq(users.phone, newUserData.data.phone!))
      .get();
    if (existingPhone) {
      return c.json({ message: M.USER_PHONE_ALREADY_IN_USE }, 400);
    }

    if (newUserData.data.email) {
      const existingEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, newUserData.data.email!))
        .get();
      if (existingEmail) {
        return c.json({ message: M.USER_EMAIL_ALREADY_IN_USE }, 400);
      }
    }


    const res = await db.insert(users).values({
      ...newUserData.data,
      date_of_birth: newUserData.data.date_of_birth?.toISOString(),
      discount_percentage: authorizedOrg(c.get('jwtPayload')?.role)
        ? newUserData.data.discount_percentage || 0
        : 0,
      special_needs: authorizedOrg(c.get('jwtPayload')?.role)
        ? newUserData.data.special_needs || null
        : null,
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
        .where(eq(users.id, c.get('jwtPayload').manager_id!))
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
    if (c.get('jwtPayload').role === ATHLETES_MANAGER_ROLE) {
      const managerId = c.get('jwtPayload').id;
      if (user.manager_id !== managerId) {
        return c.json({ message: M.UNAUTHORIZED }, 403);
      }
      return c.json({
        data: ARUserSchema.omit({
          temp_code: true,
          role: true,
          created_at: true,
          updated_at: true,
        }).parse(user)
      });
    }
    return c.json({ data: ARUserSchema.parse(user) });
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
