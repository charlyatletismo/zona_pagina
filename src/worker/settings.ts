import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

export const settingsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.get('jwtPayload').id;
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json(user);
  })
  .post("/", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.get('jwtPayload').id;
    const body = await c.req.json();

    // Filter allowed fields
    const allowedFields = [
      'name', 'surname', 'sex', 'date_of_birth',
      'country', 'city', 'full_location',
      'training_team', 'email', 'phone',
    ];

    const updates: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return c.json({ message: 'No updates provided' });
    }

    await db.update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .run();

    return c.json({ message: 'Profile updated successfully' });
  });
