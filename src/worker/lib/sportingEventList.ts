import { DrizzleD1Database } from 'drizzle-orm/d1';
import { lt, gte, desc } from 'drizzle-orm';
import { sportingEvents } from '../db/schema'


export const mainSportingEventsList = async (db: DrizzleD1Database) => {
  const SELECT_QUERY = {
    id: sportingEvents.id,
    title: sportingEvents.title,
    description: sportingEvents.description,
    date: sportingEvents.date,
    registration_start: sportingEvents.registration_start,
    registration_end: sportingEvents.registration_end,
    location: sportingEvents.location,
    location_address: sportingEvents.location_address,
    fee_amount: sportingEvents.fee_amount,
    fee_currency: sportingEvents.fee_currency,
    fee_payment_due_date: sportingEvents.fee_payment_due_date,
    fee_amount_promotional: sportingEvents.fee_amount_promotional,
    promotional_fee_end: sportingEvents.promotional_fee_end,
    promotional_fee_payment_due_date: sportingEvents.promotional_fee_payment_due_date,
  };
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const activeEvents = await db
    .select(SELECT_QUERY)
    .from(sportingEvents)
    .where(gte(sportingEvents.date, yesterday.toISOString()))
    .orderBy(desc(sportingEvents.date));

  const comingSoonEvents = [];
  const openRegistrationEvents = [];
  const closedRegistrationEvents = [];

  for (const event of activeEvents) {
    if (event.registration_start && event.registration_end) {
      const start = new Date(event.registration_start);
      const end = new Date(event.registration_end);
      if (now >= start && now <= end) {
        openRegistrationEvents.push(event);
      } else if (now >= end) {
        closedRegistrationEvents.push(event);
      } else {
        comingSoonEvents.push(event);
      }
    } else {
      comingSoonEvents.push(event);
    }
  }

  const pastEvents = await db
    .select(SELECT_QUERY)
    .from(sportingEvents)
    .where(lt(sportingEvents.date, yesterday.toISOString()))
    .orderBy(desc(sportingEvents.date))
    .limit(5);

  return {
    comingSoon: comingSoonEvents,
    open: openRegistrationEvents,
    closed: closedRegistrationEvents,
    past: pastEvents,
  }
}

export const allSportingEventsList = async (db: DrizzleD1Database) => {
  const SELECT_QUERY = {
    id: sportingEvents.id,
    title: sportingEvents.title,
    description: sportingEvents.description,
    date: sportingEvents.date,
    registration_start: sportingEvents.registration_start,
    registration_end: sportingEvents.registration_end,
    location: sportingEvents.location,
    location_address: sportingEvents.location_address,
    fee_amount: sportingEvents.fee_amount,
    fee_currency: sportingEvents.fee_currency,
    fee_payment_due_date: sportingEvents.fee_payment_due_date,
    fee_amount_promotional: sportingEvents.fee_amount_promotional,
    promotional_fee_end: sportingEvents.promotional_fee_end,
    promotional_fee_payment_due_date: sportingEvents.promotional_fee_payment_due_date,
  };
  const events = []
  while (true) {
    const batch = await db
      .select(SELECT_QUERY)
      .from(sportingEvents)
      .orderBy(desc(sportingEvents.date))
      .limit(100)
      .offset(events.length);
    if (batch.length === 0) {
      break;
    }
    events.push(...batch);
    if (batch.length < 100) {
      break;
    }
  }
  return events;
}
