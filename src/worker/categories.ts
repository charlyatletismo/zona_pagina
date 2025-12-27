import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { feesCategories, athleteCategories } from './db/schema';


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
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    // async fetch both categories in parallel
    const [feeCats, athleteCats] = await Promise.all([
      getFeeCategories(db),
      getAthleteCategories(db)
    ]);
    return c.json({ feeCategories: feeCats, athleteCategories: athleteCats });
  })
  .get("/fees", async (c) => {
    const db = drizzle(c.env.DB);
    const feesCats = await getFeeCategories(db);
    return c.json(feesCats);
  })
  .get("/athlete", async (c) => {
    const db = drizzle(c.env.DB);
    const athleteCats = await getAthleteCategories(db);
    return c.json(athleteCats);
  });
