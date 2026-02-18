import { eq, and, inArray } from 'drizzle-orm';
import {
  ARSportingEventSchema,
  ARSportingEventRegistrationSchema,
  SpClothingMinSchema,
} from '@shared/apiRespTypes';
import {
  sportingEvents,
  sportingEventRegistrations,
  sportingEventClothing,
  users
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
  clothing: z.infer<typeof SpClothingMinSchema>[]
) => {
  let pending_to_pay = 0;
  if (registration.status === 'pending' || registration.status === 'partially_paid') {
    if (registration.promotional_fee_applied && event.promotional_fee_payment_due_date && new Date() < new Date(event.promotional_fee_payment_due_date)) {
      pending_to_pay = event.fee_amount_promotional! - (registration.paid_amount as number);
    } else {
      pending_to_pay = (event.fee_amount || 0) - (registration.paid_amount as number);
    }
  }
  const discount_amount =
    registration.discount_percentage
    ? Math.round((event.fee_amount || 0) * ((registration.discount_percentage as number) / 100))
    : 0;
  if (discount_amount > 0) {
    pending_to_pay = Math.max(0, pending_to_pay - discount_amount);
  }

  return {
    registration,
    demanded_clothing: clothing.find(c => c.id === registration.demanded_clothing_id) || null,
    reserved_clothing: clothing.find(c => c.id === registration.reserved_clothing_id) || null,
    payment: {
      fee_amount: event.fee_amount,
      fee_currency: event.fee_currency,
      fee_payment_due_date: event.fee_payment_due_date,
      fee_amount_promotional: event.fee_amount_promotional,
      promotional_fee_payment_due_date: event.promotional_fee_payment_due_date,
      paid_amount: registration.paid_amount,
      discount_amount: discount_amount,
      pending_to_pay: pending_to_pay,
    }
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
  return buildUserRegistration(regParsed, event, clothing);
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
        clothingParsed
      ),
      user: usersData.find(u => u.id === r.user_id) || null,
    }))
  );
}


export const setRegistrationAsPaid = async (
  db: DrizzleD1Database,
  registrationId: number,
  userId: string,
) => {
  await db.update(sportingEventRegistrations)
    .set({
      status: 'paid',
      full_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: userId,
    })
    .where(eq(
      sportingEventRegistrations.id,
      registrationId
    ));
}
