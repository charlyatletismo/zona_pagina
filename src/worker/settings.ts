import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { users, userUpdates } from './db/schema';
import { eq, InferInsertModel } from 'drizzle-orm';
import { M } from './lib/messages';


export const settingsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.get('jwtPayload').id;
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        surname: users.surname,
        phone: users.phone,
        email: users.email,
        emergency_contact_name: users.emergency_contact_name,
        emergency_contact_phone: users.emergency_contact_phone,
        sex: users.sex,
        date_of_birth: users.date_of_birth,
        clothing_shirt_size: users.clothing_shirt_size,
        location: users.location,
        location_temp: users.location_temp,
        location_address: users.location_address,
        special_needs: users.special_needs,
        discount_percentage: users.discount_percentage,
        manager_id: users.manager_id,
        training_team_id: users.training_team_id,
        training_team_temp: users.training_team_temp,
        profile_image_url: users.profile_image_url,
        language: users.language,
      })
      .from(users)
      .where(eq(users.id, userId))
      .get();
    if (!user) {
      return c.json({ message: M.USER_NOT_FOUND }, 404);
    }
    return c.json(user);
  })
  .post("/", async (c) => {
    const db = drizzle(c.env.DB);
    const userId: string = c.get('jwtPayload').id;
    const body = await c.req.json();

    const updates: Partial<InferInsertModel<typeof users>> = {
      name: body.name,
      surname: body.surname,
      phone: body.phone,
      email: body.email,
      emergency_contact_name: body.emergency_contact_name,
      emergency_contact_phone: body.emergency_contact_phone,
      sex: body.sex,
      date_of_birth: body.date_of_birth,
      clothing_shirt_size: body.clothing_shirt_size,
      location: body.location,
      location_temp: body.location_temp,
      location_address: body.location_address,
      training_team_id: body.training_team_id,
      training_team_temp: body.training_team_temp,
      profile_image_url: body.profile_image_url,
      profile_image_preview_url: body.profile_image_preview_url,
      language: body.language,
    };

    const userBeforeUpdate = await db
      .select({phone: users.phone, email: users.email})
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .get();
    if (!userBeforeUpdate) {
      return c.json({ message: M.USER_NOT_FOUND }, 404);
    }
    if (updates.phone && updates.phone !== userBeforeUpdate.phone) {
      await db.insert(userUpdates).values({
        user_id: userId,
        field_name: 'phone',
        old_value: userBeforeUpdate.phone,
        new_value: updates.phone,
        updated_by: userId,
      }).run();
    }
    if (updates.email && updates.email !== userBeforeUpdate.email) {
      await db.insert(userUpdates).values({
        user_id: userId,
        field_name: 'email',
        old_value: userBeforeUpdate.email,
        new_value: updates.email,
        updated_by: userId,
      }).run();
    }

    await db.update(users)
      .set({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .where(eq(users.id, userId))
      .run();

    return c.json({ message: M.SETTINGS_PROFILE_UPDATED });
  });
