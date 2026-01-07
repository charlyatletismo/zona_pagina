import { eq } from 'drizzle-orm';
import {
  sportingEventClothing,
} from '../db/schema'
import { DrizzleD1Database } from 'drizzle-orm/d1';


export const getAllSpClothing = async (db: DrizzleD1Database, eventId: number) => {
  // Only for admin and organizer roles
  const clothing = await db
    .select()
    .from(sportingEventClothing)
    .where(eq(sportingEventClothing.event_id, eventId))
    .all();
  return clothing;
}
