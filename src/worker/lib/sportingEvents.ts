import { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, asc, inArray } from 'drizzle-orm';
import {
  sportingEvents,
  sportingEventCircuits,
  sportingEventSchedules
} from '../db/schema'
import { userRegisteredInEvent } from './sportingEventRegistrations';
import { SportingEventFormData } from './types';


export const getSpEvent = async (db: DrizzleD1Database, eventId: number, userId?: string | null) => {
  const event = await db
    .select()
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1)
  if (event.length === 0) {
    return null;
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
  // console.log(event);
  const ev = {
    ...event[0],
    circuits,
    schedules,
    user_registered: false,
  };
  if (userId) {
    ev.user_registered = await userRegisteredInEvent(db, eventId, userId);
  }
  return ev;
}


export const addSpEvent = async (db: DrizzleD1Database, eventData: SportingEventFormData, userId: string) => {
  const data = {
    title: eventData.title,
    description: eventData.description,
    date: eventData.date,
    registration_start: eventData.registration_start,
    registration_end: eventData.registration_end,
    location_hint: eventData.location_hint,
    location_text: eventData.location_text,
    location_lat: eventData.location_lat,
    location_long: eventData.location_long,
    event_type: eventData.event_type,
    rules: eventData.rules,
    disclaimer_of_liability_title: eventData.disclaimer_of_liability_title,
    disclaimer_of_liability_content: eventData.disclaimer_of_liability_content,
    award_prizes: eventData.award_prizes,
    created_by: userId,
    last_update_by: userId,
  }
  const result = await db.insert(sportingEvents).values(data).returning();
  if (eventData.circuits && eventData.circuits.length > 0) {
    const circuits = [];
    for (const element of eventData.circuits) {
      circuits.push({
        event_id: result[0].id,
        name: element.name,
        description: element.description,
        distance_km: element.distance_km,
        map_url: element.map_url,
      });
    }
    await db.insert(sportingEventCircuits).values(circuits);
  }
  if (eventData.schedules && eventData.schedules.length > 0) {
    const schedules = [];

    for (const element of eventData.schedules) {
      schedules.push({
        event_id: result[0].id,
        date: element.date,
        title: element.title,
        description: element.description,
        location_hint: element.location_hint,
        location_text: element.location_text,
        location_lat: element.location_lat || null,
        location_long: element.location_long || null,
      });
    }
    await db.insert(sportingEventSchedules).values(schedules);
  }
  return result[0].id;
}


export const crudArray = async (eventId: number, array: any[], dbArray: any[]) => {
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


export const updateSpEvent = async (db: DrizzleD1Database, eventId: number, eventData: Partial<SportingEventFormData>, userId: string) => {
  const data = {
    title: eventData.title,
    description: eventData.description,
    date: eventData.date,
    registration_start: eventData.registration_start,
    registration_end: eventData.registration_end,
    location_hint: eventData.location_hint,
    location_text: eventData.location_text,
    location_lat: eventData.location_lat,
    location_long: eventData.location_long,
    event_type: eventData.event_type,
    rules: eventData.rules,
    disclaimer_of_liability_title: eventData.disclaimer_of_liability_title,
    disclaimer_of_liability_content: eventData.disclaimer_of_liability_content,
    award_prizes: eventData.award_prizes,
    created_by: eventData.created_by,
    created_at: eventData.created_at,
    last_update_by: userId,
    last_update_at: new Date().toISOString(),
  }
  await db.update(sportingEvents)
    .set(data)
    .where(eq(sportingEvents.id, eventId))
    .run();
  
  // Update, delete or insert circuits
  // map by id the form circuits
  const dbCircuits = await db
    .select()
    .from(sportingEventCircuits)
    .where(eq(sportingEventCircuits.event_id, eventId));
  const resCircuits = await crudArray(eventId, eventData.circuits || [], dbCircuits);
  // Insert new circuits
  if (resCircuits.insert.length > 0) {
    await db.insert(sportingEventCircuits).values(resCircuits.insert);
  }
  // Update existing circuits
  for (const circuit of resCircuits.update) {
    await db.update(sportingEventCircuits)
      .set({
        name: circuit.name,
        description: circuit.description,
        distance_km: circuit.distance_km,
        map_url: circuit.map_url,
      })
      .where(eq(sportingEventCircuits.id, circuit.id))
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
  const resSchedules = await crudArray(eventId, eventData.schedules || [], dbSchedules);
  // Insert new schedules
  if (resSchedules.insert.length > 0) {
    await db.insert(sportingEventSchedules).values(resSchedules.insert);
  }
  // Update existing schedules
  for (const schedule of resSchedules.update) {
    await db.update(sportingEventSchedules)
      .set({
        date: schedule.date,
        title: schedule.title,
        description: schedule.description,
        location_hint: schedule.location_hint,
        location_text: schedule.location_text,
        location_lat: schedule.location_lat,
        location_long: schedule.location_long,
      })
      .where(eq(sportingEventSchedules.id, schedule.id))
      .run();
  }
  // Delete removed schedules
  if (resSchedules.delete.length > 0) {
    await db.delete(sportingEventSchedules)
      .where(inArray(sportingEventSchedules.id, resSchedules.delete))
      .run();
  }
  
}