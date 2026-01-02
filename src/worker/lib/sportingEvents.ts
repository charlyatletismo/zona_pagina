import { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, asc, inArray, lt, gte, and } from 'drizzle-orm';
import {
  users,
  sportingEvents,
  sportingEventCircuits,
  sportingEventSchedules,
  sportingEventRegistrations,
  sportingEventAthleteCategories
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
    user_registered_to_circuit: -1,
  };
  if (userId) {
    ev.user_registered_to_circuit = await userRegisteredInEvent(db, eventId, userId);
  }
  return ev;
}


export const addSpEvent = async (db: DrizzleD1Database, eventData: SportingEventFormData, userId: string) => {
  const circuits = eventData.circuits || [];
  const schedules = eventData.schedules || [];
  delete eventData.circuits;
  delete eventData.schedules;
  const data = {
    ...eventData,
    created_by: userId,
    last_update_by: userId
  }
  const result = await db.insert(sportingEvents).values(data).returning();
  if (circuits && circuits.length > 0) {
    circuits.forEach(circuit => {
      circuit.event_id = result[0].id;
    });
    await db.insert(sportingEventCircuits).values(circuits);
  }
  if (schedules && schedules.length > 0) {
    schedules.forEach(schedule => {
      schedule.event_id = result[0].id;
    });
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
  const circuits = eventData.circuits || [];
  const schedules = eventData.schedules || [];
  delete eventData.circuits;
  delete eventData.schedules;
  delete eventData.created_by;
  delete eventData.created_at;
  const data = {
    ...eventData,
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
  const resCircuits = await crudArray(eventId, circuits, dbCircuits);
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
  const resSchedules = await crudArray(eventId, schedules, dbSchedules);
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
        location: schedule.location,
        location_address: schedule.location_address,
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


export const registerToSpEvent = async (db: DrizzleD1Database, eventId: number, userId: string, circuitId: number) => {
  const event = await db.select()
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1);
  if (event.length === 0) {
    return { error: true, error_404: "Event not found" };
  }
  const registration = await db.select({id: sportingEventRegistrations.id})
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.user_id, userId),
      eq(sportingEventRegistrations.event_id, eventId),
    ))
    .limit(1);
  if (registration.length > 0) {
    return { error: true, error_400: "User already registered for this event" };
  }
  let categoryId: number | null = null;
  const userData = await db
    .select({
      dob: users.date_of_birth,
      category: users.hard_category})
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (userData.length === 0) {
    return { error: true, error_404: "User not found" };
  }
  if (userData[0].category) {
    categoryId = userData[0].category;
  } else {
    // try to find category based on age
    if (!userData[0].dob) {
      return { error: true, error_400: "User date of birth not set" };
    }
    const birthDate = new Date(userData[0].dob);
    const today = new Date();
    let age = today.getUTCMilliseconds() - birthDate.getUTCMilliseconds();
    age /= 1000 * 60 * 60 * 24;
    age = Math.floor(age / 365.25);
    const category = await db
      .select({id: athleteCategories.id})
      .from(athleteCategories)
      .where(and(
        gte(athleteCategories.min_age, age),
        lt(athleteCategories.max_age, age + 1),
      ))
      .limit(1);
    if (category.length === 0) {
      return { error: true, error_400: "No athlete category found for user's age" };
    }
    categoryId = category[0].id;
  }

  const spCategory = await db
    .select({id: sportingEventAthleteCategories.id})
    .from(sportingEventAthleteCategories)
    .where(and(
      eq(sportingEventAthleteCategories.event_id, eventId),
      eq(sportingEventAthleteCategories.athlete_category_id, categoryId),
      eq(sportingEventAthleteCategories.circuit_id, circuitId),
    ))
    .limit(1);
  if (spCategory.length === 0) {
    return { error: true, error_400: "No sporting event category found for user" };
  }

  await db.insert(sportingEventRegistrations).values({
    event_id: event[0].id,
    user_id: userId,
    registration_date: new Date().toISOString(),
    category_id: spCategory[0].id,
  });
  return { success: true };
}
