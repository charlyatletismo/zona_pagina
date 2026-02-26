import { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, inArray, and, isNotNull, desc, gt } from 'drizzle-orm';
import {
  users,
  sportingEvents,
  sportingEventCircuits,
  sportingEventRegistrations,
  sportingEventClothing
} from '../db/schema'
import { M } from './messages';
import { authorizedOrg, authorizedAthMan } from '@shared/roles';
import { getNextChipId } from './chips';
import { DataResult, NoDataResult } from './utils';


const isAuthorizedReg = async (db: DrizzleD1Database, reqUserId: string, userId: string) => {
  const usersRel = await db
    .select({
      id: users.id,
      manager_id: users.manager_id,
      role: users.role,
    })
    .from(users)
    .where(inArray(users.id, [reqUserId, userId]))
    .all();
  const reqUserRel = usersRel.find(u => u.id === reqUserId);
  const targetUserRel = usersRel.find(u => u.id === userId);
  if (!reqUserRel || !targetUserRel) {
    return false;
  }
  if (!authorizedOrg(reqUserRel.role)) {
    if (!authorizedAthMan(reqUserRel.role)) {
      return false;
    }
    if (targetUserRel.manager_id !== reqUserId) {
      return false;
    }
  }
  return true;
}


export const registerToSpEvent = async (
    db: DrizzleD1Database,
    eventId: number,
    reqUserId: string,
    userId: string,
    circuitId: number): Promise<DataResult> => {
  if (userId !== reqUserId && !(await isAuthorizedReg(db, reqUserId, userId))) {
    return { status: 403, message: M.UNAUTHORIZED };
  }
  const spEvent = await db.select()
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1);
  if (spEvent.length === 0) {
    return { status: 404, message: M.SPORTING_EVENT_NOT_FOUND };
  }
  if (spEvent[0].registration_start
    && new Date(spEvent[0].registration_start) > new Date()
  ) {
    return { status: 400, message: M.SPORTING_EVENT_REGISTRATION_NOT_STARTED };
  }
  if (spEvent[0].registration_end
    && new Date(spEvent[0].registration_end) < new Date()
  ) {
    return { status: 400, message: M.SPORTING_EVENT_REGISTRATION_ENDED };
  }
  let feeAmount = spEvent[0].fee_amount;
  if (spEvent[0].fee_amount_promotional
    && spEvent[0].promotional_fee_end
    && new Date(spEvent[0].promotional_fee_end) > new Date()
  ) {
    feeAmount = spEvent[0].fee_amount_promotional;
  }
  if (feeAmount === null || feeAmount === undefined) {
    return { status: 400, message: M.SPORTING_EVENT_FEE_NOT_SET};
  }

  const registration = await db.select({id: sportingEventRegistrations.id})
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.user_id, userId),
      eq(sportingEventRegistrations.event_id, eventId),
    ))
    .limit(1);
  if (registration.length > 0) {
    return { status: 400, message: M.SPORTING_EVENT_ALREADY_REGISTERED };
  }
  const userData = await db
    .select({
      sex: users.sex,
      date_of_birth: users.date_of_birth,
      clothing_shirt_size: users.clothing_shirt_size,
      special_needs: users.special_needs,
      discount_percentage: users.discount_percentage,
      training_team_id: users.training_team_id,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (userData.length === 0) {
    return { status: 404, message: M.USER_NOT_FOUND };
  }

  if (!userData[0].clothing_shirt_size) {
    return { status: 400, message: M.USER_SHIRT_SIZE_NOT_SET };
  }
  if (!userData[0].date_of_birth) {
    return { status: 400, message: M.USER_DATE_OF_BIRTH_NOT_SET };
  }
  const calculateAge = (dateOfBirth: Date): number => {
    const today = new Date();
    const yearsDiff = today.getFullYear() - dateOfBirth.getFullYear();
    if (
      today.getMonth() < dateOfBirth.getMonth() ||
      (
        today.getMonth() === dateOfBirth.getMonth()
        && today.getDate() < dateOfBirth.getDate()
      )
    ) {
      return yearsDiff - 1;
    }
    return yearsDiff;
  };

  const userClothing = await db
    .select()
    .from(sportingEventClothing)
    .where(and(
      eq(sportingEventClothing.event_id, eventId),
      eq(sportingEventClothing.size, userData[0].clothing_shirt_size),
    ))
    .limit(1);

  const feeAmountAfterDiscount = feeAmount * (1 - (userData[0].discount_percentage || 0) / 100);
  const status = feeAmountAfterDiscount > 0 ? "pending" : "paid";

  const promotional = (
      spEvent[0].fee_amount_promotional
      && spEvent[0].promotional_fee_end
    )
    ? (new Date(spEvent[0].promotional_fee_end) > new Date())
    : false;

  const r = await db.insert(sportingEventRegistrations).values({
    user_id: userId,
    training_team_id: userData[0].training_team_id,
    event_id: eventId,
    circuit_id: circuitId,
    age_at_registration: calculateAge(new Date(userData[0].date_of_birth)),
    discount_percentage: userData[0].discount_percentage || 0,
    discount_reason:
      userData[0].discount_percentage
      ? "Descuento automático para usuario (fijado en la configuración del usuario)"
      : null,
    // registration_date default to now in the database
    promotional_fee_applied: promotional ? 1 : 0,
    // paid_amount default to zero in the database
    status: "pending",
    demanded_clothing_id: userClothing.length > 0 ? userClothing[0].id : null,
    // reserved_clothing_id default to null in the database
    // chip_id default to null in the database
    created_by: reqUserId,
    updated_by: reqUserId,
  }).returning({ id: sportingEventRegistrations.id });

  if (status === 'paid') {
    await setRegistrationAsPaid(db, r[0].id, reqUserId);
  }

  return {
    status: 200,
    message: M.SPORTING_EVENT_REGISTRATION_CREATED_SUCCESSFULLY,
    data: {
      registration_status: status,
      circuit_id: circuitId,
      pending_to_pay: feeAmountAfterDiscount,
    }
  };
}

export const deleteRegistrationToSpEvent = async (
    db: DrizzleD1Database,
    eventId: number,
    reqUserId: string,
    userId: string): Promise<NoDataResult> => {
  if (userId !== reqUserId && !(await isAuthorizedReg(db, reqUserId, userId))) {
    return { status: 403, message: M.UNAUTHORIZED };
  }
  const registration = await db.select({id: sportingEventRegistrations.id, status: sportingEventRegistrations.status})
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.user_id, userId),
      eq(sportingEventRegistrations.event_id, eventId),
    ))
    .limit(1);
  if (registration.length === 0) {
    return { status: 404, message: M.SPORTING_EVENT_REGISTRATION_NOT_FOUND };
  }
  if (registration[0].status !== 'pending') {
    return { status: 400, message: M.SPORTING_EVENT_REGISTRATION_CANNOT_BE_DELETED };
  }
  await db.delete(sportingEventRegistrations)
    .where(eq(sportingEventRegistrations.id, registration[0].id))
    .run();
  return { status: 200, message: M.SPORTING_EVENT_REGISTRATION_DELETED_SUCCESSFULLY };
}


export const setRegistrationAsPaid = async (
  db: DrizzleD1Database,
  registrationId: number,
  userId: string,
) => {
  // Set registration as paid
  // Set full_payment_date to now
  // If the registration has a demanded clothing,
  // set the reserved_clothing_id to the same as demanded_clothing_id
  // if possible
  // Assign BIB
  // Assign Chip if the circuit is competitive
  const registration = await db.select({
    id: sportingEventRegistrations.id,
    event_id: sportingEventRegistrations.event_id,
    circuit_id: sportingEventRegistrations.circuit_id,
    user_id: sportingEventRegistrations.user_id,
    demanded_clothing_id: sportingEventRegistrations.demanded_clothing_id,
  })
  .from(sportingEventRegistrations)
  .where(eq(sportingEventRegistrations.id, registrationId))
  .limit(1)
  .get();
  if (!registration) {
    console.error("Registration not found for id", registrationId);
    throw new Error("Registration not found for id " + registrationId);
  }
  const latestRegistrationWithBib = await db
    .select({ bib: sportingEventRegistrations.bib_number })
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.status, 'paid'),
      eq(sportingEventRegistrations.circuit_id, registration.circuit_id!),
      isNotNull(sportingEventRegistrations.bib_number)
    ))
    .orderBy(desc(sportingEventRegistrations.registration_date))
    .limit(1)
    .get();
  const circuitData = await db
    .select({
      competitive: sportingEventCircuits.competitive,
      bib_start: sportingEventCircuits.bib_number_start,
      bib_end: sportingEventCircuits.bib_number_end,
    })
    .from(sportingEventCircuits)
    .where(eq(sportingEventCircuits.id, registration.circuit_id!))
    .limit(1)
    .get();
  if (!circuitData) {
    console.error("Circuit data not found for circuit_id", registration.circuit_id);
    throw new Error("Circuit data not found for circuit_id " + registration.circuit_id);
  }

  // BIB Assingment
  let nextBibNumber = (latestRegistrationWithBib && latestRegistrationWithBib.bib)
    ? latestRegistrationWithBib.bib + 1
    : circuitData.bib_start;
  if (nextBibNumber > circuitData.bib_end) {
    console.error("No more bib numbers available for circuit_id", registration.circuit_id);
    const maxBibForCircuit = await db
      .select({ end: sportingEventCircuits.bib_number_end })
      .from(sportingEventCircuits)
      .where(eq(sportingEventCircuits.event_id, registration.event_id!))
      .orderBy(desc(sportingEventCircuits.bib_number_end))
      .limit(1)
      .get();
    const latestRegistrationWithExceededBib = await db
      .select({ bib: sportingEventRegistrations.bib_number })
      .from(sportingEventRegistrations)
      .where(and(
        eq(sportingEventRegistrations.status, 'paid'),
        isNotNull(sportingEventRegistrations.bib_number),
        gt(sportingEventRegistrations.bib_number, maxBibForCircuit!.end) // only consider bib numbers that exceed the normal range
      ))
      .orderBy(desc(sportingEventRegistrations.registration_date))
      .limit(1)
      .get();
    nextBibNumber = latestRegistrationWithExceededBib
      ? latestRegistrationWithExceededBib.bib! + 1
      : maxBibForCircuit!.end + 1;
  }

  // Chip Assignment
  let chipId: string | null = null;
  if (circuitData.competitive) {
    // Assign chip
    const latestRegistrationWithChip = await db
      .select({ chip_id: sportingEventRegistrations.chip_id })
      .from(sportingEventRegistrations)
      .where(and(
        eq(sportingEventRegistrations.status, 'paid'),
        isNotNull(sportingEventRegistrations.chip_id)
      ))
      .orderBy(desc(sportingEventRegistrations.registration_date))
      .limit(1)
      .get();

    try {
      chipId = await getNextChipId(db, latestRegistrationWithChip?.chip_id || null);
    } catch (error) {
      console.error("Error getting next chip ID:", error);
    }
  }

  // Clothing reservation
  let clothingCanBeReserved = false;
  if (registration.demanded_clothing_id) {
    const alreadyReservedClothing = await db
      .select({id: sportingEventRegistrations.id})
      .from(sportingEventRegistrations)
      .where(and(
        eq(sportingEventRegistrations.event_id, registration.event_id!),
        eq(sportingEventRegistrations.reserved_clothing_id, registration.demanded_clothing_id),
      ))
      .all();
    const clothingInfo = await db
      .select({
        purchased_quantity: sportingEventClothing.purchased_quantity,
      })
      .from(sportingEventClothing)
      .where(eq(sportingEventClothing.id, registration.demanded_clothing_id))
      .limit(1)
      .get();
    if (clothingInfo
        && clothingInfo.purchased_quantity
        && alreadyReservedClothing.length < clothingInfo.purchased_quantity) {
      clothingCanBeReserved = true;
    } else {
      clothingCanBeReserved = false;
    }
  }

  await db.update(sportingEventRegistrations)
    .set({
      status: 'paid',
      full_payment_date: new Date().toISOString(),
      reserved_clothing_id: clothingCanBeReserved
        ? registration.demanded_clothing_id
        : null,
      updated_at: new Date().toISOString(),
      updated_by: userId,
      bib_number: nextBibNumber,
      chip_id: chipId,
    })
    .where(eq(
      sportingEventRegistrations.id,
      registrationId
    ));
}
