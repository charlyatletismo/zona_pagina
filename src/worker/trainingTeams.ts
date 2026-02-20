import { Hono } from 'hono';
import { Env } from './index';
import { drizzle } from 'drizzle-orm/d1';
import {
  trainingTeams,
  users,
} from './db/schema';
import { SelectedFields } from 'drizzle-orm/sqlite-core';
import {
  ARTrainingTeamIndexSchema,
  ARTrainingTeamSchema
} from "@shared/apiRespTypes";
import { M } from './lib/messages';
import { eq, isNotNull } from 'drizzle-orm';
import { authorizedOrg } from '@shared/roles';


export const trainingTeamsRoute = new Hono<{ Bindings: Env }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const data = await db
      .select(
        ARTrainingTeamIndexSchema.keyof().options.reduce((acc, field) => {
            acc[field] = trainingTeams[field];
            return acc;
          },
          {} as SelectedFields
        )
      )
      .from(trainingTeams)
      .all();
    return c.json({ data });
  })
  .get("/all", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const data = await db
      .select()
      .from(trainingTeams)
      .all();
    return c.json({ data });
  })
  .get("/temporary", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const tempTT = await db
      .select({
        id: users.id,
        temp: users.training_team_temp,
      })
      .from(users)
      .where(isNotNull(users.training_team_temp))
      .all();
    return c.json({ data: tempTT });
  })
  .post("/updateUser", async (c) => {
    const db = drizzle(c.env.DB);
    const {
      userId,
      trainingTeamId
    }: {
      userId: string,
      trainingTeamId: number
    } = await c.req.json();
    // Check if the training team exists
    const teamExists = await db
      .select()
      .from(trainingTeams)
      .where(eq(trainingTeams.id, trainingTeamId))
      .get();

    if (!teamExists) {
      return c.json({ message: M.TRAINING_TEAM_NOT_FOUND }, 404);
    }

    // Update the user's training team and clear the temporary training team
    await db.update(users)
      .set({
        training_team_id: Number(trainingTeamId),
        training_team_temp: null,
      })
      .where(eq(users.id, userId));

    return c.json({ message: M.USER_TRAINING_TEAM_UPDATED_SUCCESSFULLY });
  })
  .get("/:id", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const id = c.req.param("id");
    const data = await db
      .select()
      .from(trainingTeams)
      .where(
        eq(trainingTeams.id, Number(id))
      )
      .get();
    if (!data) {
      return c.json({ message: M.TRAINING_TEAM_NOT_FOUND }, 404);
    }
    return c.json({ data });
  })
  .post("/create", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const tteam = ARTrainingTeamSchema.omit({id: true}).parse(await c.req.json());
    const result = await db
      .insert(trainingTeams)
      .values(tteam)
      .returning();
    return c.json({ message: M.TRAINING_TEAM_CREATED_SUCCESSFULLY, data: {
      id: result[0].id,
    } });
  })
  .post("/update/:id", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const tteam = ARTrainingTeamSchema.omit({id: true}).parse(await c.req.json());
    const id = c.req.param("id");
    await db
      .update(trainingTeams)
      .set({
        ...tteam,
        updated_at: new Date().toISOString(),
      })
      .where(
        eq(trainingTeams.id, Number(id))
      )
      .run();
    return c.json({ message: M.TRAINING_TEAM_UPDATED_SUCCESSFULLY });
  });
