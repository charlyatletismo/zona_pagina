import { and, asc, count, eq, isNotNull, isNull, inArray } from 'drizzle-orm';
import {
  sportingEventClothing,
  sportingEventRegistrations,
  users,
} from '../db/schema';
import { isShirtSize, SHIRT_NOT_INCLUDED } from '@shared/types';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { NoDataResult } from './utils';
import { M } from './messages';


export const getAllSpClothing = async (db: DrizzleD1Database, eventId: number) => {
  // Only for admin and organizer roles
  const clothing = await db
    .select()
    .from(sportingEventClothing)
    .where(eq(sportingEventClothing.event_id, eventId))
    .all();
  return clothing;
}


export const getClothingStats = async (db: DrizzleD1Database, eventId: number) => {
  const clothing = await db
    .select({
      id: sportingEventClothing.id,
      clothing_type: sportingEventClothing.clothing_type,
      size: sportingEventClothing.size,
      purchased_quantity: sportingEventClothing.purchased_quantity,
    })
    .from(sportingEventClothing)
    .where(eq(sportingEventClothing.event_id, eventId))
    .all();
  const demanded = await db
    .select({
      demanded_clothing_id: sportingEventRegistrations.demanded_clothing_id,
      count: count(sportingEventClothing.id),
    })
    .from(sportingEventRegistrations)
    .where(eq(sportingEventRegistrations.event_id, eventId))
    .groupBy(sportingEventRegistrations.demanded_clothing_id)
    .all();
  const reserved = await db
    .select({
      reserved_clothing_id: sportingEventRegistrations.reserved_clothing_id,
      count: count(sportingEventClothing.id),
    })
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.event_id, eventId),
      eq(sportingEventRegistrations.status, "paid"),
      isNotNull(sportingEventRegistrations.reserved_clothing_id),
    ))
    .groupBy(sportingEventRegistrations.reserved_clothing_id)
    .all();
  const lacking = await db
    .select({
      demanded_clothing_id: sportingEventRegistrations.demanded_clothing_id,
      count: count(sportingEventClothing.id),
    })
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.event_id, eventId),
      eq(sportingEventRegistrations.status, "paid"),
      isNull(sportingEventRegistrations.reserved_clothing_id),
    ))
    .groupBy(sportingEventRegistrations.demanded_clothing_id)
    .all();
  const lackingMap = new Map(lacking.map(item => [item.demanded_clothing_id, item.count]));
  const reservedMap = new Map(reserved.map(item => [item.reserved_clothing_id, item.count]));
  const demandedMap = new Map(demanded.map(item => [item.demanded_clothing_id, item.count]));
  const clothingFull = clothing.map(c => {
    return {
      id: c.id,
      clothing_type: c.clothing_type,
      size: c.size,
      q_purchased: c.purchased_quantity,
      q_demanded: demandedMap.get(c.id) || 0,
      q_potential_lacking: Math.max(0, (demandedMap.get(c.id) || 0) - (c.purchased_quantity || 0)),
      q_reserved: reservedMap.get(c.id) || 0,
      q_lacking: lackingMap.get(c.id) || 0,
    };
  });
  return clothingFull;
}


export const updateRegistrationsClothingForNewClothing = async (
  db: DrizzleD1Database,
  eventId: number,
  newClothings: {
    id: number,
    size: string,
    purchased_quantity?: number,
  }[],
): Promise<void> => {
  // Update registrations that have demanded_clothing_id = null
  const regsToUpdateDemandedClothing = await db
    .select({
      id: sportingEventRegistrations.id,
      user_id: sportingEventRegistrations.user_id,
      reserved_clothing_id: sportingEventRegistrations.reserved_clothing_id,
      status: sportingEventRegistrations.status,
      clothing_shirt_size: users.clothing_shirt_size,
    })
    .from(sportingEventRegistrations)
    .innerJoin(users, eq(users.id, sportingEventRegistrations.user_id))
    .where(and(
      eq(sportingEventRegistrations.event_id, eventId),
      isNull(sportingEventRegistrations.demanded_clothing_id),
    ))
    .orderBy(asc(sportingEventRegistrations.full_payment_date))
    .all();
  for (const newClothing of newClothings) {
    const regsToUpdate = regsToUpdateDemandedClothing.filter(
      reg => reg.clothing_shirt_size === newClothing.size);
    await db
      .update(sportingEventRegistrations)
      .set({
        demanded_clothing_id: newClothing.id,
      })
      .where(inArray(
        sportingEventRegistrations.id,
        regsToUpdate.map(reg => reg.id)
      ));
  }
  // Update registrations that had demanded_clothing_id = null,
  // status = "paid" and reserved_clothing_id = null
  const regsPaid = regsToUpdateDemandedClothing.filter(reg => reg.status === "paid").filter(reg => !reg.reserved_clothing_id);
  for (const newClothing of newClothings) {
    if (!newClothing.purchased_quantity || newClothing.purchased_quantity <= 0) {
      continue;
    }
    const regsToUpdate = regsPaid
      .filter(
        reg => reg.clothing_shirt_size === newClothing.size)
      .slice(0, newClothing.purchased_quantity);
    await db
      .update(sportingEventRegistrations)
      .set({
        reserved_clothing_id: newClothing.id,
      })
      .where(inArray(
        sportingEventRegistrations.id,
        regsToUpdate.map(reg => reg.id)
      ));
  }
}


const checkAndAddNewClothingSizesToSpEvent = async (
  db: DrizzleD1Database,
  eventId: number,
  data: {
    size: string,
    purchased_quantity: number,
  }[],
): Promise<boolean | null> => {
  const clothing = await db
    .select()
    .from(sportingEventClothing)
    .where(eq(sportingEventClothing.event_id, eventId))
    .all();

  if (!clothing || clothing.length === 0) {
    // No clothing yet, user must add clothing type and initial
    // data in event creation/edition
    return null;
  }

  const clothingType = clothing[0].clothing_type;

  // check if not included size is present in the db data, if not,
  // add it to db. This is for backwards compatibility, if the
  // event was created before the "not included" size was added,
  // we need to add it to the db
  if (
    !data.find(item => item.size === SHIRT_NOT_INCLUDED)
    && !clothing.find(item => item.size === SHIRT_NOT_INCLUDED)
  ) {
    await db
      .insert(sportingEventClothing)
      .values({
        event_id: eventId,
        clothing_type: clothingType,
        size: SHIRT_NOT_INCLUDED,
        purchased_quantity: 0,
      }).returning({
        id: sportingEventClothing.id,
      });
  }

  const newSizes = data.filter(
    (item) =>
    (!clothing.find(c => c.size === item.size)
      && isShirtSize(item.size))
  );
  if (newSizes.length === 0) {
    return false;
  }
  const createdClothing = await db
    .insert(sportingEventClothing)
    .values(newSizes.map(newSize => ({
        event_id: eventId,
        clothing_type: clothingType,
        size: newSize.size,
        purchased_quantity: 0,
      })))
    .returning({
      id: sportingEventClothing.id,
      size: sportingEventClothing.size,
    });
  console.log(`New sizes ${newSizes.map(ns => ns.size).join(', ')} added for event ${eventId}`);

  await updateRegistrationsClothingForNewClothing(
    db, eventId, createdClothing
  )

  return true;
}


export const addClothingToSpEvent = async (
  db: DrizzleD1Database,
  eventId: number,
  data: {
    size: string,
    purchased_quantity: number,
  }[]
): Promise<NoDataResult> => {
  const createdNewClothing = await checkAndAddNewClothingSizesToSpEvent(
    db, eventId, data);

  if (createdNewClothing === null) {
    // No clothing yet, user must add clothing type and initial
    // data in event creation/edition
    return {
      status: 400,
      message: M.SPORTING_EVENT_CLOTHING_NOT_INITIALIZED,
    };
  }

  const clothing = await db
    .select()
    .from(sportingEventClothing)
    .where(eq(sportingEventClothing.event_id, eventId))
    .all();

  const updates = data.map((item) => {
    const existing = clothing.find(c => c.size === item.size);
    if (existing) {
      return {
        id: existing.id,
        purchased_quantity: existing.purchased_quantity + item.purchased_quantity,
        new_purchase_quantity: item.purchased_quantity,
      }
    }
    // invalid size, check if it's valid
    if (!isShirtSize(item.size)) {
      console.error(`Size ${item.size} is not valid, skipping...`);
    }
    return null;
  }).filter(e => e !== null);

  for (const update of updates) {
    await db
      .update(sportingEventClothing)
      .set({ purchased_quantity: update.purchased_quantity })
      .where(eq(sportingEventClothing.id, update.id));
  }

  const regsToUpdate = await db
    .select({
      id: sportingEventRegistrations.id,
      demanded_clothing_id: sportingEventRegistrations.demanded_clothing_id,
    })
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.event_id, eventId),
      eq(sportingEventRegistrations.status, "paid"),
      isNull(sportingEventRegistrations.reserved_clothing_id),
    ))
    .orderBy(asc(sportingEventRegistrations.full_payment_date))
    .all();

  const clothingMap = new Map(clothing.map(c => [c.id, c]));
  for (const reg of regsToUpdate) {
    const demandedClothing = clothingMap.get(reg.demanded_clothing_id!);
    if (!demandedClothing) continue;
    const update = updates.find(u => u.id === demandedClothing.id);
    if (!update) continue;
    if (update.new_purchase_quantity > 0) {
      await db
        .update(sportingEventRegistrations)
        .set({ reserved_clothing_id: reg.demanded_clothing_id })
        .where(eq(sportingEventRegistrations.id, reg.id));
      update.new_purchase_quantity -= 1;
    }
  }

  return { status: 200, message: M.SPORTING_EVENT_CLOTHING_UPDATED_SUCCESSFULLY };
};
