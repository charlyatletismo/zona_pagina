import { eq, and, inArray } from 'drizzle-orm';
import {
  sportingEventRegistrations,
  sportingEventAthleteCategories,
  sportingEventClothing,
  trainingTeams
} from '../db/schema'
import { DrizzleD1Database } from 'drizzle-orm/d1';


export const userRegisteredInEvent = async (db: DrizzleD1Database, eventId: number, userId: string) => {
  const registration = await db.select({
      category_id: sportingEventRegistrations.category_id,
      status: sportingEventRegistrations.status,
      paid: sportingEventRegistrations.paid_amount,
      fee: sportingEventRegistrations.fee_amount_after_discount,
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
      pending_to_pay: 0,
    }; // not registered
  }
  if (!registration.category_id) {
    return {
      registration_status: 'pending_category_set',
      category_name: '',
      circuit_id: -1,
      pending_to_pay: 0,
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
    pending_to_pay: registration.fee - registration.paid,
  };
}


export const getUserRegistration = async (db: DrizzleD1Database, eventId: number, userId: string) => {
  const registration = await db
    .select({
      sporting_event_registrations: {
        id: sportingEventRegistrations.id,
        registration_date: sportingEventRegistrations.registration_date,
        discount_percentage: sportingEventRegistrations.discount_percentage,
        discount_reason: sportingEventRegistrations.discount_reason,
        fee_amount_original: sportingEventRegistrations.fee_amount_original,
        fee_amount_after_discount: sportingEventRegistrations.fee_amount_after_discount,
        paid_amount: sportingEventRegistrations.paid_amount,
        demanded_clothing_id: sportingEventRegistrations.demanded_clothing_id,
        reserved_clothing_id: sportingEventRegistrations.reserved_clothing_id,
        special_needs: sportingEventRegistrations.special_needs,
        status: sportingEventRegistrations.status,
        full_payment_date: sportingEventRegistrations.full_payment_date,
        updated_at: sportingEventRegistrations.updated_at,
      },
      sporting_event_athlete_categories: {
        name: sportingEventAthleteCategories.name,
        circuit_id: sportingEventAthleteCategories.circuit_id,
      },
      training_teams: {
        name: trainingTeams.name,
        location: trainingTeams.location,
      },
    })
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.user_id, userId),
      eq(sportingEventRegistrations.event_id, eventId),
    ))
    .fullJoin(
      sportingEventAthleteCategories,
      eq(sportingEventRegistrations.category_id, sportingEventAthleteCategories.id)
    )
    .fullJoin(
      trainingTeams,
      eq(sportingEventRegistrations.training_team_id, trainingTeams.id)
    )
    .limit(1)
    .get();
  if (!registration || !registration.sporting_event_registrations) {
    return null;
  }
  const clothing = await db
    .select({
      id: sportingEventClothing.id,
      clothing_type: sportingEventClothing.clothing_type,
      size: sportingEventClothing.size,
      available_quantity: sportingEventClothing.available_quantity,
      demanded_quantity: sportingEventClothing.demanded_quantity,
      reserved_quantity: sportingEventClothing.reserved_quantity,
    })
    .from(sportingEventClothing)
    .where(inArray(sportingEventClothing.id, [
      registration.sporting_event_registrations.demanded_clothing_id || 0,
      registration.sporting_event_registrations.reserved_clothing_id || 0
    ]))
    .all();
  return {
    registration: {
      ...registration.sporting_event_registrations,
      demanded_clothing: clothing.find(c => c.id === registration.sporting_event_registrations?.demanded_clothing_id) || null,
      reserved_clothing: clothing.find(c => c.id === registration.sporting_event_registrations?.reserved_clothing_id) || null,
    },
    category: registration.sporting_event_athlete_categories || null,
    training_team: registration.training_teams || null,
    clothing: clothing || null,
  };
}
