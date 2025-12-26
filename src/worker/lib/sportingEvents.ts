import { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, lt, gte, desc, and, asc } from 'drizzle-orm';
import {
  users,
  sportingEvents,
  sportingEventRegistrations,
  sportingEventAthleteCategories,
  athleteCategories,
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
    description: eventData.description || "",
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
        description: element.description || "",
        distance_km: element.distance_km,
        map_url: element.map_url || "",
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
        description: element.description || "",
        location_hint: element.location_hint || "",
        location_text: element.location_text || "",
        location_lat: element.location_lat || null,
        location_long: element.location_long || null,
      });
    }
    await db.insert(sportingEventSchedules).values(schedules);
  }
  return result[0].id;
}
