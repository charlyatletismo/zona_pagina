import { Hono } from 'hono';
import { Env, Variables } from './index';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { SelectedFields } from 'drizzle-orm/sqlite-core';
import { sportingEventTransactions } from './db/schema';
import {
  ARSportEvTransactionSchema,
  ARSportEvTransactionMinSchema,
} from '@shared/apiRespTypes';
import {
  newPaymentForRegistration,
  calculatePaidBasedOnTransactions
} from './lib/sportingEventRegistrationActions';
import { authorizedOrg } from '@shared/roles';
import { M } from "./lib/messages";


export const sportingEventTransactionsRoute = new Hono<{ Bindings: Env, Variables: Variables }>()
  .use(async (c, next) => {
    if (c.req.method !== 'GET' && !authorizedOrg(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    await next();
  })
  .get("/all/:eventId", async (c) => {
    const db = drizzle(c.env.DB);
    const eventId = c.req.param("eventId");
    const allTransactions = await db
      .select(
        ARSportEvTransactionMinSchema.keyof().options.reduce((acc, field) => {
            acc[field] = sportingEventTransactions[field];
            return acc;
          },
          {} as SelectedFields
        )
      )
      .from(sportingEventTransactions)
      .where(eq(sportingEventTransactions.event_id, Number(eventId)))
      .all();
    return c.json({ data: allTransactions });
  })
  .get("/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const tr = await db
      .select()
      .from(sportingEventTransactions)
      .where(eq(sportingEventTransactions.id, Number(id)))
      .get();
    if (!tr) {
      return c.json({ message: M.SPORTING_EVENT_TRANSACTION_NOT_FOUND }, 404);
    }
    return c.json({ data: tr });
  })
  .post("/create", async (c) => {
    const db = drizzle(c.env.DB);
    const data = ARSportEvTransactionSchema.omit({
      id: true,
      created_at: true,
      updated_at: true,
    }).safeParse(await c.req.json());

    if (!data.success) {
      console.error(JSON.stringify(data.error));
      return c.json(
        { message: M.SPORTING_EVENT_TRANSACTION_INVALID_DATA },
        400
      );
    }

    await db.insert(sportingEventTransactions).values({
      ...data.data,
      transaction_date: data.data.transaction_date.toISOString(),
    });

    if (data.data.status === 'completed'
        && data.data.category === 'registration_payment'
        && data.data.registration_id) {
      // update paid amount
      const result = await newPaymentForRegistration(db, data.data.registration_id, data.data.amount)
      if (!result) {
        console.error('Failed to update registration payment after transaction creation');
      }
    }

    return c.json({ message: M.SPORTING_EVENT_TRANSACTION_CREATED_SUCCESSFULLY });
  })
  .post("/update/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const data = ARSportEvTransactionSchema.omit({
      id: true,
      created_at: true,
      updated_at: true,
    }).safeParse(await c.req.json());

    if (!data.success) {
      console.error(JSON.stringify(data.error));
      return c.json(
        { message: M.SPORTING_EVENT_TRANSACTION_INVALID_DATA },
        400
      );
    }

    await db.update(sportingEventTransactions)
      .set({
        ...data.data,
        transaction_date: data.data.transaction_date.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .where(eq(sportingEventTransactions.id, Number(id)));

    if (data.data.status === 'completed'
        && data.data.category === 'registration_payment'
        && data.data.registration_id) {
      // update paid amount
      const result = await calculatePaidBasedOnTransactions(db, data.data.registration_id)
      if (!result) {
        console.error('Failed to update registration payment after transaction creation');
      }
    }

    return c.json({ message: M.SPORTING_EVENT_TRANSACTION_UPDATED_SUCCESSFULLY });
  })
  .post("/delete/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();

    const trToDelete = await db
      .select()
      .from(sportingEventTransactions)
      .where(eq(sportingEventTransactions.id, Number(id)))
      .get();

    if (!trToDelete) {
      return c.json({ message: M.SPORTING_EVENT_TRANSACTION_NOT_FOUND }, 404);
    }

    await db.delete(sportingEventTransactions)
      .where(eq(sportingEventTransactions.id, Number(id)));

    if (trToDelete.status === 'completed'
        && trToDelete.category === 'registration_payment'
        && trToDelete.registration_id) {
      // update paid amount
      const result = await calculatePaidBasedOnTransactions(db, trToDelete.registration_id)
      if (!result) {
        console.error('Failed to update registration payment after transaction creation');
      }
    }

    return c.json({ message: M.SPORTING_EVENT_TRANSACTION_DELETED_SUCCESSFULLY });
  });
