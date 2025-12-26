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


export const userRegisteredInEvent = async (db: any, eventId: number, userId: string) => {
  const registration = await db.select()
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.user_id, userId),
      eq(sportingEventRegistrations.event_id, eventId),
    ))
    .limit(1);
  if (registration.length === 0) {
    return -1;
  }
  return registration[0].circuit_id;
}
