import { and, asc, count, eq, isNull } from 'drizzle-orm';
import {
  sportingEventClothing,
  sportingEventRegistrations,
} from '../db/schema'
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
    ))
    .groupBy(sportingEventRegistrations.reserved_clothing_id)
    .all();
  const paidDemanded = await db
    .select({
      demanded_clothing_id: sportingEventRegistrations.demanded_clothing_id,
      count: count(sportingEventClothing.id),
    })
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.event_id, eventId),
      eq(sportingEventRegistrations.status, "paid"),
    ))
    .groupBy(sportingEventRegistrations.demanded_clothing_id)
    .all();
  const paidDemandedMap = new Map(paidDemanded.map(item => [item.demanded_clothing_id, item.count]));
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
      q_paid_demanded: paidDemandedMap.get(c.id) || 0,
      q_lacking: (paidDemandedMap.get(c.id) || 0) - (reservedMap.get(c.id) || 0),
    };
  });
  return clothingFull;
}


export const addClothingToSpEvent = async (
  db: DrizzleD1Database,
  eventId: number,
  data: {
    size: string,
    purchased_quantity: number,
  }[]
): Promise<NoDataResult> => {
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
    } else {
      console.error(`Size ${item.size} not found for event ${eventId}, skipping...`);
      return null;
    }
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
