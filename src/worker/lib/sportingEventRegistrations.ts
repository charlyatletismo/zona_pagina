import { eq, and, inArray } from 'drizzle-orm';
import {
  ARSportingEventSchema,
  ARSportingEventRegistrationSchema,
  SpClothingMinSchema,
} from '@shared/apiRespTypes';
import {
  sportingEvents,
  sportingEventRegistrations,
  sportingEventCircuits,
  sportingEventClothing,
  users,
} from '../db/schema'
import { SelectedFields } from 'drizzle-orm/sqlite-core';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import z from 'zod';


export const userRegisteredInEvent = async (
  db: DrizzleD1Database,
  eventId: number,
  userId: string,
  ev: z.infer<typeof ARSportingEventSchema>
) => {
  const registration = await db.select({
      circuit_id: sportingEventRegistrations.circuit_id,
      age_at_registration: sportingEventRegistrations.age_at_registration,
      status: sportingEventRegistrations.status,
      promotional_fee_applied: sportingEventRegistrations.promotional_fee_applied,
      paid_amount: sportingEventRegistrations.paid_amount,
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
      circuit_id: -1,
      pending_to_pay: 0,
    };
  }
  let pending_to_pay = 0;
  if (registration.status === 'pending' || registration.status === 'partially_paid') {
    if (registration.promotional_fee_applied && ev.promotional_fee_end && new Date() < new Date(ev.promotional_fee_end)) {
      pending_to_pay = ev.fee_amount_promotional! - registration.paid_amount;
    } else {
      pending_to_pay = (ev.fee_amount || 0) - registration.paid_amount;
    }
  }
  return {
    registration_status: registration.status,
    circuit_id: registration.circuit_id || -1,
    pending_to_pay: pending_to_pay,
  };
}


const getEventData = async (db: DrizzleD1Database, eventId: number) => {
  const event = await db
    .select({
      title: sportingEvents.title,
      age_ranges: sportingEvents.age_ranges,
      fee_amount: sportingEvents.fee_amount,
      fee_currency: sportingEvents.fee_currency,
      fee_payment_due_date: sportingEvents.fee_payment_due_date,
      fee_amount_promotional: sportingEvents.fee_amount_promotional,
      promotional_fee_payment_due_date: sportingEvents.promotional_fee_payment_due_date,
    })
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1)
    .get();
  if (!event) {
    return null;
  }
  const clothing = await db
    .select(
      SpClothingMinSchema.keyof().options
        .reduce((acc, field) => {
            acc[field] = sportingEventClothing[field];
            return acc;
          },
          {} as SelectedFields
        ),
    )
    .from(sportingEventClothing)
    .where(eq(sportingEventClothing.event_id, eventId))
    .all();
  return {
    event,
    clothing,
  }
}


const buildUserRegistration = (
  registration: z.infer<typeof ARSportingEventRegistrationSchema.shape.registration>,
  event: {
    title: string,
    age_ranges: string | null,
    fee_amount: number | null,
    fee_currency: string | null,
    fee_payment_due_date: string | null,
    fee_amount_promotional: number | null,
    promotional_fee_payment_due_date: string | null,
  },
  clothing: z.infer<typeof SpClothingMinSchema>[],
  circuit_km: number | null,
  demandedClothingRemaining?: number,
) => {
  let current_fee_amount = event.fee_amount || 0;
  let current_fee_is_promotional = false;
  if (registration.status === 'pending' || registration.status === 'partially_paid') {
    if (registration.promotional_fee_applied && event.promotional_fee_payment_due_date && new Date() < new Date(event.promotional_fee_payment_due_date)) {
      current_fee_amount = event.fee_amount_promotional!;
      current_fee_is_promotional = true;
    }
  }
  const discount_amount =
    registration.discount_percentage
    ? Math.round(current_fee_amount * ((registration.discount_percentage as number) / 100))
    : 0;
  let pending_to_pay = 0;
  if (registration.status === 'pending' || registration.status === 'partially_paid') {
    pending_to_pay = current_fee_amount - discount_amount - (registration.paid_amount as number);
    if (pending_to_pay < 0) {
      pending_to_pay = 0;
    }
  }

  const dem = clothing.find(c => c.id === registration.demanded_clothing_id)
  const demanded_clothing = dem ? {
    id: dem.id,
    clothing_type: dem.clothing_type,
    size: dem.size,
    remaining_quantity: demandedClothingRemaining || 0
  } : null;
  const resv = clothing.find(c => c.id === registration.reserved_clothing_id)
  const reserved_clothing = resv ? {
    id: resv.id,
    clothing_type: resv.clothing_type,
    size: resv.size,
  } : null;

  const a_ranges = event.age_ranges
    ? event.age_ranges.split(',')
      .map(r => Number(r.trim()))
      .sort((a,b) => a-b)
    : [];
  let category: string | null = null;
  if (circuit_km === null) {
    // Non-competitive circuit, only one category
    category = "General"
  } else if (registration.age_at_registration && a_ranges.length > 0) {
    const age = registration.age_at_registration;
    const firstMax = a_ranges.find(r => r > age) || 0;
    if (a_ranges.indexOf(firstMax) === 0) {
      category = `<${firstMax}/${circuit_km}KM`;
    } else {
      const minAge = firstMax === 0
        ? a_ranges[a_ranges.length - 1]
        : a_ranges[a_ranges.indexOf(firstMax) - 1];
      category = `${minAge}${firstMax === 0 ? "+" : `-${firstMax - 1}`}/${circuit_km}KM`;
    }
  }

  return {
    registration,
    demanded_clothing,
    reserved_clothing,
    payment: {
      fee_amount: event.fee_amount,
      fee_currency: event.fee_currency,
      fee_payment_due_date: event.fee_payment_due_date,
      fee_amount_promotional: event.fee_amount_promotional,
      promotional_fee_payment_due_date: event.promotional_fee_payment_due_date,
      current_fee_amount,
      current_fee_is_promotional,
      discount_amount: discount_amount,
      paid_amount: registration.paid_amount,
      pending_to_pay: pending_to_pay,
    },
    category,
  };
}

const getUserRegistrationFull = async (
  db: DrizzleD1Database,
  eventId: number,
  userId: string,
  event: {
    title: string,
    age_ranges: string | null,
    fee_amount: number | null,
    fee_currency: string | null,
    fee_payment_due_date: string | null,
    fee_amount_promotional: number | null,
    promotional_fee_payment_due_date: string | null,
  },
  clothing: z.infer<typeof SpClothingMinSchema>[]
) => {
  const registration = await db
    .select(
      ARSportingEventRegistrationSchema
        .shape.registration.keyof().options
          .reduce((acc, field) => {
              acc[field] = sportingEventRegistrations[field];
              return acc;
            },
            {} as SelectedFields
          ),
    )
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.user_id, userId),
      eq(sportingEventRegistrations.event_id, eventId),
    ))
    .limit(1)
    .get();
  if (!registration) {
    return null;
  }
  const regParsed = ARSportingEventRegistrationSchema.shape.registration.parse(registration);
  let demandedClothingRemaining = 0;
  const demandedClothing = clothing.find(c => c.id === regParsed.demanded_clothing_id);
  if (demandedClothing
      && demandedClothing.purchased_quantity
      && demandedClothing.purchased_quantity > 0
      && regParsed.demanded_clothing_id
      && regParsed.status !== 'paid') {
    const clothingInfo = await db
      .select({id: sportingEventRegistrations.id})
      .from(sportingEventRegistrations)
      .where(and(
        eq(sportingEventRegistrations.event_id, eventId),
        eq(sportingEventRegistrations.reserved_clothing_id, regParsed.demanded_clothing_id),
      ))
      .all();
    demandedClothingRemaining = demandedClothing.purchased_quantity - clothingInfo.length;
  }
  
  const circuit = await db
    .select({ distance_km: sportingEventCircuits.distance_km })
    .from(sportingEventCircuits)
    .where(and(
      eq(sportingEventCircuits.id, registration.circuit_id as number),
      eq(sportingEventCircuits.competitive, 1)
    ))
    .limit(1)
    .get();
  const circuit_km = circuit ? circuit.distance_km : null;
  return buildUserRegistration(
    regParsed,
    event,
    clothing,
    circuit_km,
    demandedClothingRemaining
  );
}


export const getUserRegistration = async (
  db: DrizzleD1Database,
  eventId: number,
  userId: string
) => {
  const evData = await getEventData(db, eventId);
  if (!evData) {
    return null;
  }
  const { event, clothing } = evData;
  const clothingParsed = z.array(SpClothingMinSchema).parse(clothing);
  return await getUserRegistrationFull(db, eventId, userId, event, clothingParsed);
}


export const getUserRegistrationWithEvent = async (
  db: DrizzleD1Database,
  eventId: number,
  userId: string
) => {
  const evData = await getEventData(db, eventId);
  if (!evData) {
    return null;
  }
  const { event, clothing } = evData;
  const clothingParsed = z.array(SpClothingMinSchema).parse(clothing);
  return {
    ...await getUserRegistrationFull(db, eventId, userId, event, clothingParsed),
    event,
  };
}


export const getManagedUsersRegistrations = async (
  db: DrizzleD1Database,
  eventId: number,
  managerId: string
) => {
  const evData = await getEventData(db, eventId);
  if (!evData) {
    return null;
  }
  const { event, clothing } = evData;
  const clothingParsed = z.array(SpClothingMinSchema).parse(clothing);
  // Only for admin and organizer roles
  const resUsers = await db
    .select({
      users: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        phone: users.phone,
        email: users.email,
        emergency_contact_phone: users.emergency_contact_phone,
      }
    })
    .from(users)
    .where(eq(users.manager_id, managerId))
    .innerJoin(sportingEventRegistrations, and(
      eq(sportingEventRegistrations.event_id, eventId),
      eq(sportingEventRegistrations.user_id, users.id)
    ))
    .all();

  const registrations = resUsers.map(async r => {
    return {
      ...await getUserRegistrationFull(db, eventId, r.users.id, event, clothingParsed),
      user: r.users,
    }
  })
  return await Promise.all(registrations);
}


export const getAllUsersRegistrations = async (db: DrizzleD1Database, eventId: number) => {
  // Only for admin and organizer roles
  const evData = await getEventData(db, eventId);
  if (!evData) {
    return null;
  }
  const { event, clothing } = evData;
  const clothingParsed = z.array(SpClothingMinSchema).parse(clothing);
  const registrations = await db
    .select(
      ARSportingEventRegistrationSchema
        .shape.registration.keyof().options
          .reduce((acc, field) => {
              acc[field] = sportingEventRegistrations[field];
              return acc;
            },
            {} as SelectedFields
          ),
    )
    .from(sportingEventRegistrations)
    .where(eq(sportingEventRegistrations.event_id, eventId))
    .all();
  const circuits = await db
    .select({ id: sportingEventCircuits.id, distance_km: sportingEventCircuits.distance_km })
    .from(sportingEventCircuits)
    .where(and(
      eq(sportingEventCircuits.event_id, eventId),
      eq(sportingEventCircuits.competitive, 1)
    ))
    .all();
  const usersData = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      phone: users.phone,
      email: users.email
    })
    .from(users)
    .where(inArray(users.id, registrations.map(r => r.user_id as string)))
    .all();
  return await Promise.all(
    registrations.map(r => ({
      ...buildUserRegistration(
        ARSportingEventRegistrationSchema.shape.registration.parse(r),
        event,
        clothingParsed,
        circuits.find(c => c.id === r.circuit_id)?.distance_km || null
      ),
      user: usersData.find(u => u.id === r.user_id) || null,
    }))
  );
}
