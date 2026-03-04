import { eq, and, inArray, like } from 'drizzle-orm';
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
  trainingTeams,
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
  if (registration.status === 'pending') {
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


const getCategory = (
  ageRanges: number[],
  ageAtRegistration: number | null,
  userSex: string | null,
  circuitIsCompetitive: boolean | null,
  circuitKm: number | null
) => {
  let category: string | null = null;
  if (!circuitIsCompetitive) {
    // Non-competitive circuit, only one category
    category = "General"
  } else if (ageAtRegistration && ageRanges.length > 0) {
    const age = ageAtRegistration;
    const firstMax = ageRanges.find(r => r > age) || 0;
    if (ageRanges.indexOf(firstMax) === 0) {
      category = `<${firstMax}/${userSex}/${circuitKm}KM`;
    } else {
      const minAge = firstMax === 0
        ? ageRanges[ageRanges.length - 1]
        : ageRanges[ageRanges.indexOf(firstMax) - 1];
      category = `${minAge}${firstMax === 0 ? "+" : `-${firstMax - 1}`}/${userSex}/${circuitKm}KM`;
    }
  }
  return category;
}

export const getPendingToPayAmount = (
  event: {
    fee_amount: number | null,
    fee_amount_promotional: number | null,
    promotional_fee_payment_due_date: string | null,
  },
  registration: {
    status: string,
    promotional_fee_applied: boolean,
    discount_percentage?: number | null,
    paid_amount?: number | null,
  }
) => {
  let current_fee_amount = event.fee_amount || 0;
  let current_fee_is_promotional = false;
  if (registration.status === 'pending') {
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
  if (registration.status === 'pending') {
    pending_to_pay = current_fee_amount - discount_amount - (registration.paid_amount as number);
    if (pending_to_pay < 0) {
      pending_to_pay = 0;
    }
  }
  return {
    current_fee_amount,
    current_fee_is_promotional,
    discount_amount,
    pending_to_pay,
  };
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
  userSex: string | null,
  demandedClothingRemaining?: number,
) => {
  const {
    current_fee_amount,
    current_fee_is_promotional,
    discount_amount,
    pending_to_pay
  } = getPendingToPayAmount(event, registration);

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
  const category = getCategory(
    a_ranges,
    registration.age_at_registration,
    userSex,
    circuit_km !== null ? true : null, // TODO: maybe change this logic
    circuit_km
  );

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

  const userData = await db
    .select({
      sex: users.sex,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
    .get();

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
    userData?.sex ?? null,
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
    .select({
      id: sportingEventCircuits.id,
      name: sportingEventCircuits.name,
      distance_km: sportingEventCircuits.distance_km,
      competitive: sportingEventCircuits.competitive,
    })
    .from(sportingEventCircuits)
    .where(and(
      eq(sportingEventCircuits.event_id, eventId),
      // eq(sportingEventCircuits.competitive, 1)
    ))
    .all();
  const usersData = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      phone: users.phone,
      email: users.email,
      sex: users.sex,
    })
    .from(users)
    .where(inArray(users.id, registrations.map(r => r.user_id as string)))
    .all();
  const trainingTeamsData = await db
    .select({
      id: trainingTeams.id,
      name: trainingTeams.name,
    })
    .from(trainingTeams)
    .where(inArray(trainingTeams.id, registrations.map(r => r.training_team_id as number)))
    .all();

  const a_ranges = event.age_ranges
    ? event.age_ranges.split(',')
      .map(r => Number(r.trim()))
      .sort((a,b) => a-b)
    : [];

  const result = registrations.map(r => {
    const regParsed = ARSportingEventRegistrationSchema.shape.registration.parse(r);
    const circuit = circuits.find(c => c.id === regParsed.circuit_id);
    const user = usersData.find(u => u.id === r.user_id);

    const circuitIsCompetitive = circuit ? circuit.competitive === 1 : null;
    const category = getCategory(
      a_ranges,
      regParsed.age_at_registration,
      user?.sex ?? null,
      circuitIsCompetitive,
      circuit?.distance_km || null
    );

    const {
      // current_fee_amount,
      // current_fee_is_promotional,
      // discount_amount,
      pending_to_pay
    } = getPendingToPayAmount(event, regParsed);

    return {
      ...regParsed,
      category: category,
      circuit_name: circuit?.name,
      circuit_distance_km: circuit?.distance_km,
      circuit_competitive: circuitIsCompetitive,
      user_full_name: user ? `${user.name} ${user.surname}` : null,
      user_phone: user?.phone || null,
      user_email: user?.email || null,
      user_training_team_name: trainingTeamsData.find(t => t.id === regParsed.training_team_id)?.name || null,
      demanded_clothing_size: clothingParsed.find(c => c.id === regParsed.demanded_clothing_id)?.size || null,
      reserved_clothing_size: clothingParsed.find(c => c.id === regParsed.reserved_clothing_id)?.size || null,
      pending_to_pay,
    }
  })
  return result;
}


export const getPaidRegistrations = async (db: DrizzleD1Database, eventId: number, partialUserId?: string, bib?: string) => {
  const evData = await getEventData(db, eventId);
  if (!evData) {
    return null;
  }
  const { clothing } = evData;
  const clothingParsed = z.array(SpClothingMinSchema).parse(clothing);
  const whereClause = and(
    eq(sportingEventRegistrations.event_id, eventId),
    eq(sportingEventRegistrations.status, 'paid'),
    partialUserId ? like(sportingEventRegistrations.user_id, `%${partialUserId}%`) : undefined,
    bib ? eq(sportingEventRegistrations.bib_number, Number(bib)) : undefined,
  );
  const registrations = await db
    .select({
      id: sportingEventRegistrations.id,
      user_id: sportingEventRegistrations.user_id,
      bib_number: sportingEventRegistrations.bib_number,
      chip_id: sportingEventRegistrations.chip_id,
      reserved_clothing_id: sportingEventRegistrations.reserved_clothing_id,
      kit_delivered: sportingEventRegistrations.kit_delivered,
    })
    .from(sportingEventRegistrations)
    .where(whereClause)
    .all();
  
  const usersData = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
    })
    .from(users)
    .where(inArray(users.id, registrations.map(r => r.user_id as string)))
    .all();

  const regs = registrations.map(r => ({
    ...r,
    clothing_size: clothingParsed.find(c => c.id === r.reserved_clothing_id)?.size || null,
    full_name: `${usersData.find(u => u.id === r.user_id)?.name || ''} ${usersData.find(u => u.id === r.user_id)?.surname || ''}`.trim(),
  }))
  return regs;
}


export const updateSpEventRegistrationKitDeliveredStatus = async (
  db: DrizzleD1Database,
  eventId: number,
  registrationId: number,
  deliveredKit: boolean
) => {
  await db
    .update(sportingEventRegistrations)
    .set({ kit_delivered: deliveredKit ? 1 : 0 })
    .where(and(
      eq(sportingEventRegistrations.event_id, eventId),
      eq(sportingEventRegistrations.id, registrationId),
    ))
    .run();
}
