import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { SelectedFields } from 'drizzle-orm/sqlite-core';
import { users, userUpdates } from './db/schema';
import { eq } from 'drizzle-orm';
import { M } from './lib/messages';
import { ARSettingsSchema } from '@shared/apiRespTypes';


export const settingsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.get('jwtPayload').id;
    const user = await db
      .select(
        ARSettingsSchema.keyof().options.reduce((acc, field) => {
            acc[field] = users[field];
            return acc;
          },
          {} as SelectedFields
        )
      )
      .from(users)
      .where(eq(users.id, userId))
      .get();
    if (!user) {
      return c.json({ message: M.USER_NOT_FOUND }, 404);
    }
    return c.json({ data: user });
  })
  .post("/", async (c) => {
    const db = drizzle(c.env.DB);
    const userId: string = c.get('jwtPayload').id;
    const body = await c.req.json();

    const updates = ARSettingsSchema.omit({ id: true }).safeParse(body);
    if (!updates.success) {
      return c.json({ message: M.USER_INVALID_DATA }, 400);
    }

    const userBeforeUpdate = await db
      .select({phone: users.phone, email: users.email})
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .get();
    if (!userBeforeUpdate) {
      return c.json({ message: M.USER_NOT_FOUND }, 404);
    }
    if (updates.data.phone !== userBeforeUpdate.phone) {
      await db.insert(userUpdates).values({
        user_id: userId,
        field_name: 'phone',
        old_value: userBeforeUpdate.phone,
        new_value: updates.data.phone,
        updated_by: userId,
      }).run();
    }
    if (updates.data.email !== userBeforeUpdate.email) {
      await db.insert(userUpdates).values({
        user_id: userId,
        field_name: 'email',
        old_value: userBeforeUpdate.email,
        new_value: updates.data.email,
        updated_by: userId,
      }).run();
    }

    await db.update(users)
      .set({
        ...updates,
        date_of_birth: updates.data.date_of_birth ? updates.data.date_of_birth.toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .run();

    return c.json({ message: M.SETTINGS_PROFILE_UPDATED });
  });
