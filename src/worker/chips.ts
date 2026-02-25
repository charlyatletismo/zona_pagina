import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { eq, asc } from 'drizzle-orm';
import { chips } from './db/schema';
import { ARChipSchema } from '@shared/apiRespTypes';
import { authorizedOrg } from '@shared/roles';
import { M } from "./lib/messages";
import z from 'zod';


const ARChipCreateSchema = ARChipSchema.pick({
  prefix: true,
  padding_n: true,
  start: true,
  end: true,
})


export const chipsRoute = new Hono<{ Bindings: Env }>()
  .use(async (c, next) => {
    if (!authorizedOrg(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    await next();
  })
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const allChips = await db
      .select()
      .from(chips)
      .orderBy(asc(chips.prefix), asc(chips.start))
      .all();
    return c.json({ data: allChips });
  })
  .post("/", async (c) => {
    const db = drizzle(c.env.DB);
    const reqChipData: z.infer<typeof ARChipCreateSchema> = await c.req.json();
    const chip = ARChipCreateSchema.safeParse(reqChipData);
    if (!chip.success) {
      return c.json({ message: M.CHIPS_INVALID_DATA }, 400);
    }
    await db.insert(chips).values(chip.data).run();
    return c.json({ message: M.CHIPS_SUCCESS_CREATING });
  })
  .post("/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const chipId = Number(c.req.param("id"));
    const reqChipData: z.infer<typeof ARChipCreateSchema> = await c.req.json();
    const chip = ARChipCreateSchema.safeParse(reqChipData);
    if (!chip.success) {
      return c.json({ message: M.CHIPS_INVALID_DATA }, 400);
    }
    const chipExists = await db.select().from(chips).where(eq(chips.id, chipId)).get();
    if (!chipExists) {
      return c.json({ message: M.CHIPS_NOT_FOUND }, 404);
    }
    await db.update(chips).set({
      ...chip.data,
      updated_at: new Date().toISOString(),
    }).where(eq(chips.id, chipId)).run();
    return c.json({ message: M.CHIPS_SUCCESS_UPDATING });
  })
  .post("/:id/delete", async (c) => {
    const db = drizzle(c.env.DB);
    const chipId = Number(c.req.param("id"));
    const chipExists = await db.select().from(chips).where(eq(chips.id, chipId)).get();
    if (!chipExists) {
      return c.json({ message: M.CHIPS_NOT_FOUND }, 404);
    }
    await db.delete(chips).where(eq(chips.id, chipId)).run();
    return c.json({ message: M.CHIPS_SUCCESS_DELETING });
  })
