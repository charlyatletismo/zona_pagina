import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { feesCategories, athleteCategories } from './db/schema';
import { authorizedOrg } from './lib/roles';


const getFeeCategories = async (db: ReturnType<typeof drizzle>) => {
  return await db.select().from(feesCategories).all();
};


const getAthleteCategories = async (db: ReturnType<typeof drizzle>) => {
  const res = await db
    .select()
    .from(athleteCategories)
    .innerJoin(
      feesCategories,
      eq(athleteCategories.fee_category_id, feesCategories.id))
    .all();
  return res.map(r => ({
    ...r.athlete_categories,
    fee_category_name: r.fees_categories?.name,
    fee_category_description: r.fees_categories?.description,
  }));
};


export const categoriesRoute = new Hono<{ Bindings: Env }>()
  .use(async (c, next) => {
    if (!authorizedOrg(c.get('jwtPayload')?.roles)) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    // Middleware to log requests to /api/users
    // console.log(`[UsersRoute] ${c.req.method} ${c.req.url}`);
    await next();
  })
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    // async fetch both categories in parallel
    const [feeCategories, athleteCategories] = await Promise.all([
      getFeeCategories(db),
      getAthleteCategories(db)
    ]);
    return c.json({ feeCategories, athleteCategories });
  })
  /////////////////////////////////////////// Fee Categories ///////////////////////////////////////////
  .get("/fee", async (c) => {
    const db = drizzle(c.env.DB);
    const feeCategories = await getFeeCategories(db);
    return c.json(feeCategories);
  })
  .post("/fee/create", async (c) => {
    const reqBody = await c.req.json();
    if (!reqBody.name) {
      return c.json({ error: "Missing required field: name" }, 400);
    }
    const db = drizzle(c.env.DB);
    const feeCategory = await db
      .insert(feesCategories)
      .values({
        name: reqBody.name,
        description: reqBody.description,
      })
      .returning()
      .get();
    return c.json(feeCategory);
  })
  .get("/fee/:feeId", async (c) => {
    const feeId = c.req.param("feeId");
    const db = drizzle(c.env.DB);
    const feeCategory = await db
      .select()
      .from(feesCategories)
      .where(eq(feesCategories.id, Number(feeId)))
      .get();
    if (!feeCategory) {
      return c.json({ error: "Fee category not found" }, 404);
    }
    return c.json(feeCategory);
  })
  .post("/fee/:feeId", async (c) => {
    const feeId = c.req.param("feeId");
    const reqBody = await c.req.json();
    if (!reqBody.name) {
      return c.json({ error: "Missing required fields: name" }, 400);
    }
    const db = drizzle(c.env.DB);
    const feeCategory = await db
      .update(feesCategories)
      .set({
        name: reqBody.name,
        description: reqBody.description || null,
      })
      .where(eq(feesCategories.id, Number(feeId)))
      .returning()
      .get();
    if (!feeCategory) {
      return c.json({ error: "Fee category not found" }, 404);
    }
    return c.json(feeCategory);
  })
  /////////////////////////////////////////// Athlete Categories ///////////////////////////////////////////
  .get("/athlete", async (c) => {
    const db = drizzle(c.env.DB);
    const athleteCategories = await getAthleteCategories(db);
    return c.json(athleteCategories);
  })
  .post("/athlete/create", async (c) => {
    const reqBody = await c.req.json();
    if (!reqBody.name || !reqBody.fee_category_id) {
      return c.json({ error: "Missing required fields: name or fee_category_id" }, 400);
    }
    const db = drizzle(c.env.DB);
    const athleteCategory = await db
      .insert(athleteCategories)
      .values({
        name: reqBody.name,
        description: reqBody.description,
        sex: reqBody.sex,
        min_age: reqBody.min_age,
        max_age: reqBody.max_age,
        fee_category_id: reqBody.fee_category_id,
        condition: reqBody.condition,
      })
      .returning()
      .get();
    return c.json(athleteCategory);
  })
  .get("/athlete/:athleteId", async (c) => {
    const athleteId = c.req.param("athleteId");
    const db = drizzle(c.env.DB);
    const athleteCategory = await db
      .select()
      .from(athleteCategories)
      .innerJoin(
        feesCategories,
        eq(athleteCategories.fee_category_id, feesCategories.id))
      .where(eq(athleteCategories.id, Number(athleteId)))
      .get();
    if (!athleteCategory) {
      return c.json({ error: "Athlete category not found" }, 404);
    }
    return c.json({
      ...athleteCategory.athlete_categories,
      fee_category_name: athleteCategory.fees_categories?.name,
    });
  })
  .post("/athlete/:athleteId", async (c) => {
    const athleteId = c.req.param("athleteId");
    const reqBody = await c.req.json();
    if (!reqBody.name || !reqBody.fee_category_id) {
      return c.json({ error: "Missing required fields: name or fee_category_id" }, 400);
    }
    const db = drizzle(c.env.DB);
    const athleteCategory = await db
      .update(athleteCategories)
      .set({
        name: reqBody.name,
        description: reqBody.description || null,
        sex: reqBody.sex || null,
        min_age: reqBody.min_age || null,
        max_age: reqBody.max_age || null,
        fee_category_id: reqBody.fee_category_id,
        condition: reqBody.condition || null,
      })
      .where(eq(athleteCategories.id, Number(athleteId)))
      .returning()
      .get();
    if (!athleteCategory) {
      return c.json({ error: "Athlete category not found" }, 404);
    }
    return c.json(athleteCategory);
  });