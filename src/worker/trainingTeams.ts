import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { trainingTeams } from './db/schema';
import { SelectedFields } from 'drizzle-orm/sqlite-core';
import { TrainingTeamsApiResponseSchemaElement } from "@shared/apiRespTypes";


export const trainingTeamsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const data = await db
      .select(
        TrainingTeamsApiResponseSchemaElement.keyof().options.reduce((acc, field) => {
            acc[field] = trainingTeams[field];
            return acc;
          },
          {} as SelectedFields
        )
      )
      .from(trainingTeams)
      .all();
    return c.json({ data });
  });
