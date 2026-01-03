import { Hono } from 'hono';
import { Env } from './index';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { athleteCategoryTemplates } from './db/schema';
import { authorizedOrg } from './lib/roles';
import { M } from './lib/messages';


const getAthleteCategoryTemplates = async (db: DrizzleD1Database) => {
  const res = await db
    .select()
    .from(athleteCategoryTemplates)
    .all();
  return res;
};


export const athleteCategoryTemplatesRoute = new Hono<{ Bindings: Env }>()
  .use(async (c, next) => {
    if (!authorizedOrg(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    // Middleware to log requests to /api/users
    // console.log(`[UsersRoute] ${c.req.method} ${c.req.url}`);
    await next();
  })
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    return c.json(getAthleteCategoryTemplates(db));
  })
  .post("/create", async (c) => {
    const reqBody = await c.req.json();
    if (!reqBody.base_name) {
      return c.json({
        message: M.ATHLETE_CATEGORY_TEMPLATE_REQUIRED_BASE_NAME_MISSING },
        400);
    }
    const db = drizzle(c.env.DB);
    let category;
    try {
      category = await db
        .insert(athleteCategoryTemplates)
        .values({
          base_name: reqBody.base_name,
          male_name: reqBody.male_name,
          female_name: reqBody.female_name,
          unisex_name: reqBody.unisex_name,
          min_age: reqBody.min_age,
          max_age: reqBody.max_age,
          exclude_auto_qualify: reqBody.exclude_auto_qualify || 0,
        })
        .returning()
        .get();
    } catch (error) {
      console.error("Error creating athlete category template:", error);
      return c.json({ message: M.ATHLETE_CATEGORY_TEMPLATE_ERROR_CREATING }, 500);
    }
    return c.json({id: category.id});
  })
  .get("/:categoryId", async (c) => {
    const db = drizzle(c.env.DB);
    const categoryId = c.req.param("categoryId");
    const category = await db
      .select()
      .from(athleteCategoryTemplates)
      .where(eq(athleteCategoryTemplates.id, Number(categoryId)))
      .get();
    if (!category) {
      return c.json({ message: M.ATHLETE_CATEGORY_TEMPLATE_NOT_FOUND }, 404);
    }
    return c.json(category);
  })
  .post("/:categoryId", async (c) => {
    const categoryId = c.req.param("categoryId");
    const reqBody = await c.req.json();
    if (!reqBody.base_name) {
      return c.json({ message: M.ATHLETE_CATEGORY_TEMPLATE_REQUIRED_BASE_NAME_MISSING }, 400);
    }
    const db = drizzle(c.env.DB);
    const category = await db
      .update(athleteCategoryTemplates)
      .set({
        base_name: reqBody.base_name,
        male_name: reqBody.male_name,
        female_name: reqBody.female_name,
        unisex_name: reqBody.unisex_name,
        min_age: reqBody.min_age,
        max_age: reqBody.max_age,
        exclude_auto_qualify: reqBody.exclude_auto_qualify || 0,
      })
      .where(eq(athleteCategoryTemplates.id, Number(categoryId)))
      .returning()
      .get();
    if (!category) {
      return c.json({ message: M.ATHLETE_CATEGORY_TEMPLATE_NOT_FOUND }, 404);
    }
    return c.json(category);
  });
