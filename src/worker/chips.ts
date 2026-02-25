import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { eq, asc, and, not } from 'drizzle-orm';
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

const overlappingChip = (
  existingChips: {
    start: number;
    end: number;
  }[],
  newChip: z.infer<typeof ARChipCreateSchema>
) => {
  // Check that the new chip does not overlap with existing chips
  // If there are no existing chips for the same prefix and padding_n,
  // then it's available
  if (existingChips.length === 0) {
    return false;
  }
  let overlapping = true;
  const availableRanges = []
  for (let index = 0; index < existingChips.length; index++) {
    const current = existingChips[index];
    const next = existingChips[index + 1];
    // console.log(current, next)
    if (index === 0 && current.start > 0) {
      availableRanges.push({ start: 0, end: current.start - 1 });
    }
    if (next === undefined) {
      availableRanges.push({ start: current.end + 1, end: Number.MAX_SAFE_INTEGER });
    } else if (current.end < (next.start - 1)) {
      availableRanges.push({ start: current.end + 1, end: next.start - 1 });
    }
  }
  console.log("Available ranges for new chip:", availableRanges);
  for (const availRange of availableRanges) {
    if (availRange.start <= newChip.start && newChip.end <= availRange.end) {
      overlapping = false;
      break;
    }
  }
  return overlapping;
}


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
      .orderBy(asc(chips.prefix), asc(chips.padding_n), asc(chips.start))
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
    if (chip.data.start > chip.data.end) {
      return c.json({ message: M.CHIPS_INVALID_DATA }, 400);
    }
    // Normalize prefix to uppercase
    chip.data.prefix = chip.data.prefix.toUpperCase();
    // Get existing chips with the same prefix and padding_n, ordered by start
    const existingChips = await db
      .select({
        start: chips.start,
        end: chips.end,
      })
      .from(chips)
      .where(and(
        eq(chips.prefix, chip.data.prefix),
        eq(chips.padding_n, chip.data.padding_n))
      )
      .orderBy(asc(chips.start))
      .all();
    if (overlappingChip(existingChips, chip.data)) {
      return c.json({ message: M.CHIPS_OVERLAPPING }, 400);
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
    // Normalize prefix to uppercase
    chip.data.prefix = chip.data.prefix.toUpperCase();
    // Get existing chips with the same prefix and padding_n, ordered by start
    const chipExists = await db
      .select()
      .from(chips)
      .where(eq(chips.id, chipId))
      .get();
    if (!chipExists) {
      return c.json({ message: M.CHIPS_NOT_FOUND }, 404);
    }
    if (chip.data.start > chip.data.end) {
      return c.json({ message: M.CHIPS_INVALID_DATA }, 400);
    }
    const existingChips = await db
      .select({
        start: chips.start,
        end: chips.end,
      })
      .from(chips)
      .where(and(
        eq(chips.prefix, chip.data.prefix),
        eq(chips.padding_n, chip.data.padding_n),
        not(eq(chips.id, chipId))
      ))
      .orderBy(asc(chips.start))
      .all();
    if (overlappingChip(existingChips, chip.data)) {
      return c.json({ message: M.CHIPS_OVERLAPPING }, 400);
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
    const chipExists = await db
      .select()
      .from(chips)
      .where(eq(chips.id, chipId))
      .get();
    if (!chipExists) {
      return c.json({ message: M.CHIPS_NOT_FOUND }, 404);
    }
    await db.delete(chips).where(eq(chips.id, chipId)).run();
    return c.json({ message: M.CHIPS_SUCCESS_DELETING });
  })
