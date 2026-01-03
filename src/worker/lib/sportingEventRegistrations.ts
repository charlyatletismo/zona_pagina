import { eq, and } from 'drizzle-orm';
import { sportingEventRegistrations, sportingEventAthleteCategories } from '../db/schema'
import { DrizzleD1Database } from 'drizzle-orm/d1';


export const userRegisteredInEvent = async (db: DrizzleD1Database, eventId: number, userId: string) => {
  const registration = await db.select({
      category_id: sportingEventRegistrations.category_id,
      status: sportingEventRegistrations.status,
    })
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.user_id, userId),
      eq(sportingEventRegistrations.event_id, eventId),
    ))
    .limit(1)
    .get();
  if (!registration) {
    return {
      registration_status: 'not_registered',
      category_name: '',
      circuit_id: -1,
    }; // not registered
  }
  if (!registration.category_id) {
    return {
      registration_status: 'pending_category_set',
      category_name: '',
      circuit_id: -1,
    };
  }
  const category = await db.select()
    .from(sportingEventAthleteCategories)
    .where(eq(sportingEventAthleteCategories.id, registration.category_id))
    .limit(1)
    .get();
  return {
    registration_status: registration.status,
    category_name: category!.name,
    circuit_id: category!.circuit_id,
  };
}
