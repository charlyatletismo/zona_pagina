import { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, asc, inArray } from 'drizzle-orm';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import {
  sportingEvents,
  sportingEventCircuits,
  sportingEventSchedules,
  sportingEventRegistrations,
  sportingEventClothing
} from '../db/schema'
import { userRegisteredInEvent } from './sportingEventRegistrations';
import { M } from './messages';
import z from 'zod';
import {
  SportingEventDbSchema,
  SportingEventClothingSchema,
  SportingEventCircuitSchema,
  SportingEventScheduleSchema,
} from '@shared/types';
import { ARSportingEventSchema } from '@shared/apiRespTypes';


interface DataResult {
  status: ContentfulStatusCode;
  message?: Record<string, string>;
  data?: any;
}
interface NoDataResult {
  status: ContentfulStatusCode;
  message: Record<string, string>;
}

export const getSpEventMin = async (
    db: DrizzleD1Database,
    eventId: number): Promise<DataResult> => {
  const event = await db
    .select({
      id: sportingEvents.id,
      title: sportingEvents.title,
      date: sportingEvents.date,
    })
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1)
    .get();
  if (!event) {
    return {
      status: 404,
      message: M.SPORTING_EVENT_NOT_FOUND
    };
  }
  return {
    status: 200,
    data: event,
  };
}

export const getSpEvent = async (
    db: DrizzleD1Database,
    eventId: number,
    userId?: string | null): Promise<DataResult> => {
  const event = await db
    .select()
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1)
  if (event.length === 0) {
    return {
      status: 404,
      message: M.SPORTING_EVENT_NOT_FOUND
    };
  }
  const circuits = await db
    .select()
    .from(sportingEventCircuits)
    .where(eq(sportingEventCircuits.event_id, eventId));;
  const schedules = await db
    .select()
    .from(sportingEventSchedules)
    .where(eq(sportingEventSchedules.event_id, eventId))
    .orderBy(asc(sportingEventSchedules.date));
  const athletesRegistered = await db
    .select()
    .from(sportingEventRegistrations)
    .where(eq(sportingEventRegistrations.event_id, eventId));
  const clothing = await db
    .select()
    .from(sportingEventClothing)
    .where(eq(sportingEventClothing.event_id, eventId));
  const athletesConfirmed = athletesRegistered.filter(
    ar => ar.status === 'paid' || ar.status === 'partially_paid');
  const ev = {
    ...event[0],
    circuits: circuits.length > 0 ? circuits : null,
    schedules: schedules.length > 0 ? schedules : null,
    clothing: clothing.length > 0 ? clothing : null,
    athletes_registered: athletesRegistered.length,
    athletes_confirmed: athletesConfirmed.length,
    user_registration_status: {
      registration_status: 'not_registered',
      circuit_id: -1,
      pending_to_pay: 0,
    }, // not registered
  };
  if (userId) {
    ev.user_registration_status = await userRegisteredInEvent(
      db,
      eventId,
      userId,
      ARSportingEventSchema.parse(event[0])
    );
  }
  return {
    status: 200,
    data: ev
  };
}

interface ReadSpEventResult extends DataResult {
  data?: z.infer<typeof SportingEventDbSchema>;
  schedules?: z.infer<typeof SportingEventScheduleSchema>[] | null;
  clothing?: z.infer<typeof SportingEventClothingSchema>[] | null;
  circuits?: z.infer<typeof SportingEventCircuitSchema>[] | null;
}

const readSpEvent = (
  eventData: z.infer<typeof ARSportingEventSchema>
): ReadSpEventResult => {
// main event data validation
  const ev = ARSportingEventSchema.omit({id: true}).parse(eventData);

  // circuits validation
  let circuits = null;
  if (ev.circuits && ev.circuits.length > 0) {
    try {
      circuits = ev.circuits.map(item =>
        SportingEventCircuitSchema.parse(item)
      );
    } catch (error) {
      // Handle parsing error if needed
      console.error("Error parsing sporting event circuit data:", error)
      return {
        status: 400,
        message: M.SPORTING_EVENT_CIRCUIT_INVALID_DATA,
      };
    }
  }

  // schedules validation
  let schedules = null;
  if (ev.schedules && ev.schedules.length > 0) {
    try {
      schedules = ev.schedules.map(item =>
        SportingEventScheduleSchema.parse(item)
      );
    } catch (error) {
      // Handle parsing error if needed
      console.error("Error parsing sporting event schedule data:", error)
      return {
        status: 400,
        message: M.SPORTING_EVENT_SCHEDULE_INVALID_DATA,
      };
    }
  }

  // clothing validation
  let clothing = null;
  if (ev.clothing && ev.clothing.length > 0) {
    try {
      clothing = ev.clothing.map(item =>
        SportingEventClothingSchema.parse(item)
      );
    } catch (error) {
      // Handle parsing error if needed
      console.error("Error parsing sporting event clothing data:", error)
      return {
        status: 400,
        message: M.SPORTING_EVENT_CLOTHING_INVALID_DATA,
      };
    }
  }

  const data = SportingEventDbSchema.parse(ev);

  return {
    status: 200,
    data,
    schedules,
    clothing,
    circuits,
  }
}


export const addSpEvent = async (
  db: DrizzleD1Database,
  eventData: z.infer<typeof ARSportingEventSchema>,
  userId: string
): Promise<DataResult> => {

  const {
    status,
    message,
    data,
    schedules,
    clothing,
    circuits,
    // categories
  } = readSpEvent(eventData);

  if (status !== 200 || !data) {
    return {
      status: 400,
      message: message || {
        "es": "Error al leer los datos del evento deportivo",
        "en": "Error reading sporting event data",
      }
    };
  }

  const result = await db.insert(sportingEvents).values({
    ...data,
    date: data.date.toISOString(),
    registration_start: data.registration_start?.toISOString() || null,
    registration_end: data.registration_end?.toISOString() || null,
    fee_payment_due_date: data.fee_payment_due_date?.toISOString() || null,
    promotional_fee_end: data.promotional_fee_end?.toISOString() || null,
    promotional_fee_payment_due_date: data.promotional_fee_payment_due_date?.toISOString() || null,
    created_by: userId,
    updated_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).returning();

  if (circuits && circuits.length > 0) {
    await db.insert(sportingEventCircuits).values(
      circuits.map(circuit => ({
        ...circuit,
        event_id: result[0].id,
        competitive: circuit.competitive ? 1 : 0,
      }))
    );
  }

  if (schedules && schedules.length > 0) {
    await db.insert(sportingEventSchedules).values(
      schedules.map(schedule => ({
        ...schedule,
        event_id: result[0].id,
        date: schedule.date.toISOString(),
        notify_at: schedule.notify_at?.toISOString() || null,
      }))
    );
  }

  if (clothing && clothing.length > 0) {
    await db.insert(sportingEventClothing).values(
      clothing.map(cloth => ({
        ...cloth,
        event_id: result[0].id,
      }))
    );
  }

  // TODO categories

  return {
    status: 200,
    data: result[0].id,
  };
}


export const crudArray = async <T = unknown>(
  eventId: number,
  array: any[] | null | undefined,
  dbArray: any[] | null | undefined
): Promise<{
  insert: T[];
  update: T[];
  delete: number[];
}> => {
  if (!array) {
    return {
      insert: [],
      update: [],
      delete: dbArray?.map(e => e.id) || [],
    }
  }
  if (!dbArray) {
    return {
      insert: array.map(element => ({
        event_id: eventId,
        ...element,
      })),
      update: [],
      delete: [],
    }
  }
  const arrayMap = new Map<number, any>();
  const newElements = [];
  const delElements = [];
  const updElements = [];
  for (const element of array) {
    if (element.id) {
      arrayMap.set(element.id, element);
    } else {
      newElements.push({
        event_id: eventId,
        ...element,
      });
    }
  }
  for (const dbElement of dbArray) {
    const formElement = arrayMap.get(dbElement.id);
    if (formElement) {
      // update
      updElements.push(formElement);
      arrayMap.delete(dbElement.id);
    } else {
      // delete
      delElements.push(dbElement.id);
    }
  }
  return {
    insert: newElements,
    update: updElements,
    delete: delElements,
  }
}


export const updateSpEvent = async (
    db: DrizzleD1Database,
    eventId: number,
    eventData: z.infer<typeof ARSportingEventSchema>,
    userId: string): Promise<NoDataResult> => {

  const {
    status,
    message,
    data,
    schedules,
    clothing,
    circuits,
  } = readSpEvent(eventData);

  if (status !== 200 || !data) {
    return {
      status: 400,
      message: message || {
        "es": "Error al leer los datos del evento deportivo",
        "en": "Error reading sporting event data",
      }
    };
  }

  const finalData = SportingEventDbSchema.omit({
    id: true,
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
  }).parse(data)
  const res = await db.update(sportingEvents)
    .set({
      ...finalData,
      date: finalData.date.toISOString(),
      registration_start: finalData.registration_start?.toISOString() || null,
      registration_end: finalData.registration_end?.toISOString() || null,
      fee_payment_due_date: finalData.fee_payment_due_date?.toISOString() || null,
      promotional_fee_end: finalData.promotional_fee_end?.toISOString() || null,
      promotional_fee_payment_due_date: finalData.promotional_fee_payment_due_date?.toISOString() || null,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .where(eq(sportingEvents.id, eventId))
    .run();
  if (res.meta.changes === 0) {
    return { status: 404, message: M.SPORTING_EVENT_NOT_FOUND };
  }

  // Update, delete or insert circuits
  // map by id the form circuits
  const dbCircuits = await db
    .select()
    .from(sportingEventCircuits)
    .where(eq(sportingEventCircuits.event_id, eventId));
  const resCircuits = await crudArray<z.infer<typeof SportingEventCircuitSchema>>(eventId, circuits, dbCircuits);
  const finalCircuitSchema = z.array(
    SportingEventCircuitSchema.omit({id: true}).required({
      event_id: true,
    }).extend({
      competitive: z.coerce.number<boolean>().optional(),
    })
  );
  // Insert new circuits
  if (resCircuits.insert.length > 0) {
    await db.insert(sportingEventCircuits).values(finalCircuitSchema.parse(resCircuits.insert));
  }
  // Update existing circuits
  for (const circuit of resCircuits.update) {
    await db.update(sportingEventCircuits)
      .set({
        ...circuit,
        competitive: circuit.competitive ? 1 : 0,
      })
      .where(eq(sportingEventCircuits.id, circuit.id!))
      .run();
  }
  // Delete removed circuits
  if (resCircuits.delete.length > 0) {
    await db.delete(sportingEventCircuits)
      .where(inArray(sportingEventCircuits.id, resCircuits.delete))
      .run();
  }

  // Update, delete or insert schedules
  // map by id the form schedules
  const dbSchedules = await db
    .select()
    .from(sportingEventSchedules)
    .where(eq(sportingEventSchedules.event_id, eventId));
  const resSchedules = await crudArray<z.infer<typeof SportingEventScheduleSchema>>(eventId, schedules, dbSchedules);
  const finalScheduleSchema = z.array(
    SportingEventScheduleSchema.omit({id: true}).required({
      event_id: true,
    })
  );
  // Insert new schedules
  if (resSchedules.insert.length > 0) {
    const tempSchedules = finalScheduleSchema.parse(resSchedules.insert);
    await db.insert(sportingEventSchedules).values(tempSchedules.map(
      schedule => ({
        ...schedule,
        date: schedule.date.toISOString(),
        notify_at: schedule.notify_at?.toISOString() || null,
      })
    ));
  }
  // Update existing schedules
  for (const schedule of resSchedules.update) {
    await db.update(sportingEventSchedules)
      .set({
        ...schedule,
        date: schedule.date?.toISOString(),
        notify_at: schedule.notify_at?.toISOString() || null,
      })
      .where(eq(sportingEventSchedules.id, schedule.id!))
      .run();
  }
  // Delete removed schedules
  if (resSchedules.delete.length > 0) {
    await db.delete(sportingEventSchedules)
      .where(inArray(sportingEventSchedules.id, resSchedules.delete))
      .run();
  }

  const dbClothing = await db
    .select()
    .from(sportingEventClothing)
    .where(eq(sportingEventClothing.event_id, eventId));
    const resClothing = await crudArray<z.infer<typeof SportingEventClothingSchema>>(eventId, clothing, dbClothing);
    const finalClothingSchema = z.array(
      SportingEventClothingSchema.omit({id: true}).required({
        event_id: true,
      })
    );
  // Insert new clothing
  if (resClothing.insert.length > 0) {
    await db.insert(sportingEventClothing).values(
      finalClothingSchema.parse(resClothing.insert));
  }
  // Update existing clothing
  for (const cloth of resClothing.update) {
    await db.update(sportingEventClothing)
      .set(cloth)
      .where(eq(sportingEventClothing.id, cloth.id!))
      .run();
  }
  // Delete removed clothing
  if (resClothing.delete.length > 0) {
    await db.delete(sportingEventClothing)
      .where(inArray(sportingEventClothing.id, resClothing.delete))
      .run();
  }

  // TODO categories

  return { status: 200, message: M.SPORTING_EVENT_UPDATED_SUCCESSFULLY };
}


export const delSpEvent = async (
    db: DrizzleD1Database,
    eventId: number): Promise<NoDataResult> => {
  const res = await db.delete(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .run();
  if (res.meta.changes === 0) {
    return { status: 404, message: M.SPORTING_EVENT_NOT_FOUND };
  }
  return { status: 200, message: M.SPORTING_EVENT_DELETED_SUCCESSFULLY };
}
