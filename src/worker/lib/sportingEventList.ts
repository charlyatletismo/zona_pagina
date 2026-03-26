import { DrizzleD1Database } from 'drizzle-orm/d1';
import { SelectedFields } from 'drizzle-orm/sqlite-core';
import { lt, gte, desc, eq, inArray } from 'drizzle-orm';
import { users, sportingEvents, sportingEventRegistrations } from '../db/schema';
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

export const getUserRegisteredSpEvents = async (db: DrizzleD1Database, userId: string) => {
  const SELECT_QUERY = SportingEventBasicInfoSchema
    .keyof().options
    .reduce((acc, field) => {
        acc[field] = sportingEvents[field];
        return acc;
      },
      {} as SelectedFields
    )
  const events = []
  let offsetRegs = 0;
  while (true) {
    const registrations = await db
      .select({
        event_id: sportingEventRegistrations.event_id,
      })
      .from(sportingEventRegistrations)
      .where(eq(sportingEventRegistrations.user_id, userId))
      .limit(100)
      .offset(offsetRegs)
      .all();
    const batch = await db
      .select(SELECT_QUERY)
      .from(sportingEvents)
      .where(inArray(
        sportingEvents.id,
        registrations.filter(r => r.event_id !== null).map(r => r.event_id) as number[]
      ));
    events.push(...batch);
    if (registrations.length < 100) {
      break;
    }
    offsetRegs += 100;
  }
  return events.sort(
    (a, b) =>
      new Date(b.date as string).getTime()
      - new Date(a.date as string).getTime()
  );
}

export const getManagedUsersRegisteredSpEvents = async (db: DrizzleD1Database, managerId: string) => {
  const eventIds: number[] = []
  const managedUsers = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.manager_id, managerId))
    .all();
  const usersIds = managedUsers.map(u => u.id);
  for (let index = 0; index < usersIds.length; index += 50) {
    const usersSlice = usersIds.slice(index, index + 50);
    let offsetRegs = 0;
    while (true) {
      const evInRegs = await db
        .select({
          event_id: sportingEventRegistrations.event_id,
        })
        .from(sportingEventRegistrations)
        .where(inArray(sportingEventRegistrations.user_id, usersSlice))
        .limit(100)
        .offset(offsetRegs)
        .all();
      eventIds.push(...evInRegs.map(r => r.event_id).filter(r => r !== null));
      if (evInRegs.length < 100) {
        break;
      }
      offsetRegs += 100;
    }
  }
  const SELECT_QUERY = SportingEventBasicInfoSchema
    .keyof().options
    .reduce((acc, field) => {
        acc[field] = sportingEvents[field];
        return acc;
      },
      {} as SelectedFields
    )
  const eventIdsUnique = Array.from(new Set(eventIds));
  const events = []
  for (let index = 0; index < eventIdsUnique.length; index += 50) {
    const slicedEventsIds = eventIdsUnique.slice(index, index + 50);
    const batch = await db
      .select(SELECT_QUERY)
      .from(sportingEvents)
      .where(inArray(
        sportingEvents.id,
        slicedEventsIds
      ));
    events.push(...batch);
  }
  return events.sort(
    (a, b) =>
      new Date(b.date as string).getTime()
      - new Date(a.date as string).getTime()
  );
}