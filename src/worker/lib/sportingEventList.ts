import { DrizzleD1Database } from 'drizzle-orm/d1';
import { SelectedFields } from 'drizzle-orm/sqlite-core';
import { lt, gte, desc } from 'drizzle-orm';
import { sportingEvents } from '../db/schema';
import { SportingEventBasicInfoSchema } from '@shared/apiRespTypes';
import z from 'zod';


export const mainSportingEventsList = async (db: DrizzleD1Database) => {
  const SELECT_QUERY = SportingEventBasicInfoSchema
    .keyof().options
    .reduce((acc, field) => {
        acc[field] = sportingEvents[field];
        return acc;
      },
      {} as SelectedFields
    )
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

  const activeEventsParsed = z.array(SportingEventBasicInfoSchema)
    .parse(activeEvents);
  for (const event of activeEventsParsed) {
    if (event.registration_start && event.registration_end) {
      if (now >= event.registration_start && now <= event.registration_end) {
        openRegistrationEvents.push(event);
      } else if (now >= event.registration_end) {
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
  const pastEventsParsed = z.array(SportingEventBasicInfoSchema)
    .parse(pastEvents);

  return {
    comingSoon: comingSoonEvents,
    open: openRegistrationEvents,
    closed: closedRegistrationEvents,
    past: pastEventsParsed,
  }
}

export const allSportingEventsList = async (db: DrizzleD1Database) => {
  const SELECT_QUERY = SportingEventBasicInfoSchema
    .keyof().options
    .reduce((acc, field) => {
        acc[field] = sportingEvents[field];
        return acc;
      },
      {} as SelectedFields
    )
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
