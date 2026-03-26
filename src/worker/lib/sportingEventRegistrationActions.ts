import { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, inArray, and, isNotNull, desc, gt } from 'drizzle-orm';
import {
  users,
  sportingEvents,
  sportingEventCircuits,
  sportingEventRegistrations,
  sportingEventClothing,
  sportingEventTransactions
} from '../db/schema'
import { M } from './messages';
import { authorizedOrg, authorizedAthMan } from '@shared/roles';
import { getNextChipId } from './chips';
import { DataResult, NoDataResult } from './utils';
import { getPendingToPayAmount } from './sportingEventRegistrations';


const isAuthorizedRegMultiple = async (db: DrizzleD1Database, reqUserId: string, userIds: string[]) => {
  const reqUser = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, reqUserId))
    .limit(1)
    .get();
  if (!reqUser) {
    return false;
  }
  if (authorizedOrg(reqUser.role)) {
    return true;
  }
  if (!authorizedAthMan(reqUser.role)) {
    return false;
  }
  for (let index = 0; index < userIds.length; index += 50) {
    const slicedUsers = userIds.slice(index, index + 50);
    const minUsersData = await db
      .select({ id: users.id })
      .from(users)
      .where(and(
        inArray(users.id, slicedUsers),
        eq(users.manager_id, reqUserId)
      ))
      .all();
    if (minUsersData.length === 0 || minUsersData.length !== slicedUsers.length) {
      return false;
    }
  }
  return true;
}

export const registerToSpEvent = async (
  db: DrizzleD1Database,
  eventId: number,
  reqUserId: string,
  reqIsOrganizer: boolean,
  userIds: string[],
  circuitId: number
): Promise<DataResult> => {
  if (!reqIsOrganizer) {
    const isAuthorized = await isAuthorizedRegMultiple(db, reqUserId, userIds);
    if (!isAuthorized) {
      return { status: 403, message: M.UNAUTHORIZED };
    }
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

  console.log(new Date().toISOString(), "Registering users to event", eventId, "User IDs:", userIds.length);
  for (let index = 0; index < userIds.length; index += 50) {
    const slicedUsers = userIds.slice(index, index + 50);
    const registrations = await db
      .select({
        id: sportingEventRegistrations.id,
        user_id: sportingEventRegistrations.user_id
      })
      .from(sportingEventRegistrations)
      .where(and(
        inArray(sportingEventRegistrations.user_id, slicedUsers),
        eq(sportingEventRegistrations.event_id, eventId),
      ))
      .all();
    if (registrations.length > 0) {
      console.log("Already registered users... Filtering out...")
      userIds = userIds.filter(uid => !registrations.some(r => r.user_id === uid));
    }
  }
  console.log(new Date().toISOString(), "Users to register after filtering already registered:", userIds.length);
  const usersData = []
  // console.log("Users to register:", userIds.length);
  for (let index = 0; index < userIds.length; index += 50) {
    const slicedUsers = userIds.slice(index, index + 50);
    const usersDataDb = await db
      .select({
        id: users.id,
        sex: users.sex,
        date_of_birth: users.date_of_birth,
        clothing_shirt_size: users.clothing_shirt_size,
        special_needs: users.special_needs,
        discount_percentage: users.discount_percentage,
        training_team_id: users.training_team_id,
      })
      .from(users)
      .where(inArray(users.id, slicedUsers))
      .all();
    usersData.push(...usersDataDb);
  }
  console.log(new Date().toISOString(), "Fetched users data:", usersData.length);
  if (usersData.length === 0 || usersData.length !== userIds.length) {
    return { status: 404, message: M.USER_NOT_FOUND };
  }
  if (usersData.some(u => !u.clothing_shirt_size)) {
    return { status: 400, message: M.USER_SHIRT_SIZE_NOT_SET };
  }
  if (usersData.some(u => !u.date_of_birth)) {
    return { status: 400, message: M.USER_DATE_OF_BIRTH_NOT_SET };
  }
  const calculateAge = (dateOfBirth: Date): number => {
    const eventDate = new Date(spEvent[0].date);
    const yearsDiff = eventDate.getFullYear() - dateOfBirth.getFullYear();
    if (
      eventDate.getMonth() < dateOfBirth.getMonth() ||
      (
        eventDate.getMonth() === dateOfBirth.getMonth()
        && eventDate.getDate() < dateOfBirth.getDate()
      )
    ) {
      return yearsDiff - 1;
    }
    return yearsDiff;
  };

  const uniqueClothingSizes = [...new Set(usersData.map(u => u.clothing_shirt_size!))];
  console.log(new Date().toISOString(), "Unique clothing sizes to reserve:", uniqueClothingSizes);
  const usersClothing = await db
    .select()
    .from(sportingEventClothing)
    .where(and(
      eq(sportingEventClothing.event_id, eventId),
      inArray(sportingEventClothing.size, uniqueClothingSizes),
    ))
    .all();

  console.log(new Date().toISOString(), "Fetched clothing data for sizes:", usersClothing.length);

  const promotional = (
      spEvent[0].fee_amount_promotional
      && spEvent[0].promotional_fee_end
    )
    ? (new Date(spEvent[0].promotional_fee_end) > new Date())
    : false;

  const dataToInsert = usersData.map(userData => ({
    user_id: userData.id,
    training_team_id: userData.training_team_id,
    event_id: eventId,
    circuit_id: circuitId,
    age_at_registration: calculateAge(new Date(userData.date_of_birth!)),
    discount_percentage: userData.discount_percentage || 0,
    discount_reason:
      userData.discount_percentage
      ? "Descuento automático para usuario (fijado en la configuración del usuario)"
      : null,
    // registration_date default to now in the database
    promotional_fee_applied: promotional ? 1 : 0,
    // paid_amount default to zero in the database
    status: "pending",
    demanded_clothing_id: usersClothing.find(uc => uc.size === userData.clothing_shirt_size)?.id || null,
    // reserved_clothing_id default to null in the database
    // chip_id default to null in the database
    created_by: reqUserId,
    updated_by: reqUserId,
  }))
  const rIds: {id: number, user_id: string}[] = [];
  for (let index = 0; index < dataToInsert.length; index += 7) {
    const dataSliced = dataToInsert.slice(index, index + 7);
    const r = await db
      .insert(sportingEventRegistrations)
      .values(dataSliced)
      .returning({
        id: sportingEventRegistrations.id,
        user_id: sportingEventRegistrations.user_id,
      });
    rIds.push(...r);
  }

  const regByUserId = new Map(rIds.map(reg => [reg.user_id, reg.id]));
  const results = usersData.map(userData => {
    const feeAmountAfterDiscount = feeAmount * (1 - (userData.discount_percentage || 0) / 100);
    const status = feeAmountAfterDiscount > 0 ? "pending" : "paid";
    return {
      id: regByUserId.get(userData.id)!,
      user_id: userData.id,
      status,
      circuit_id: circuitId,
      pending_to_pay: feeAmountAfterDiscount,
    }
  })
  const paidRegs = results.filter(r => r.status === 'paid');
  for (const reg of paidRegs) {
    await setRegistrationAsPaid(db, reg.id, reqUserId);
  }
  console.log(new Date().toISOString(), "Finished registering users to event", eventId, "Registrations created:", results.length);
  return {
    status: 200,
    message: M.SPORTING_EVENT_REGISTRATION_CREATED_SUCCESSFULLY,
    data: results,
  };
}

export const deleteRegistrationToSpEvent = async (
    db: DrizzleD1Database,
    eventId: number,
    reqUserId: string,
    reqIsOrganizer: boolean,
    userIds: string[]): Promise<NoDataResult> => {
  if (!reqIsOrganizer) {
    let now_str = new Date().toISOString();
    console.log(now_str, "Checking authorization for deleting registrations for users:", userIds.length);

    const isAuthorized = await isAuthorizedRegMultiple(db, reqUserId, userIds);
    if (!isAuthorized) {
      return { status: 403, message: M.UNAUTHORIZED };
    }
    now_str = new Date().toISOString();
    console.log(now_str, "Authorization results:", isAuthorized);
  }
  const registrations = []
  for (let index = 0; index < userIds.length; index += 50) {
    const slicedUsers = userIds.slice(index, index + 50);
    const regs = await db
      .select({
        id: sportingEventRegistrations.id,
        status: sportingEventRegistrations.status
      })
      .from(sportingEventRegistrations)
      .where(and(
        inArray(sportingEventRegistrations.user_id, slicedUsers),
        eq(sportingEventRegistrations.event_id, eventId),
      ))
      .all();
    registrations.push(...regs);
  }
  if (registrations.length === 0 || registrations.length !== userIds.length) {
    return { status: 404, message: M.SPORTING_EVENT_REGISTRATION_NOT_FOUND };
  }
  if (registrations.some(r => r.status !== 'pending') && !reqIsOrganizer) {
    return { status: 400, message: M.SPORTING_EVENT_REGISTRATION_CANNOT_BE_DELETED };
  }
  for (let index = 0; index < registrations.length; index += 50) {
    const slicedRegs = registrations.slice(index, index + 50);
    await db.delete(sportingEventRegistrations)
      .where(inArray(sportingEventRegistrations.id, slicedRegs.map(r => r.id)))
      .run();
  }
  console.log(new Date().toISOString(), "Deleted registrations for users:", userIds.length);
  return { status: 200, message: M.SPORTING_EVENT_REGISTRATION_DELETED_SUCCESSFULLY };
}


export const setRegistrationAsPaid = async (
  db: DrizzleD1Database,
  registrationId: number,
  updatedBy: string,
  paidAmount?: number
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
    status: sportingEventRegistrations.status,
    paid_amount: sportingEventRegistrations.paid_amount,
    user_id: sportingEventRegistrations.user_id,
    demanded_clothing_id: sportingEventRegistrations.demanded_clothing_id,
    chip_id: sportingEventRegistrations.chip_id,
    bib_number: sportingEventRegistrations.bib_number,
    reserved_clothing_id: sportingEventRegistrations.reserved_clothing_id,
  })
  .from(sportingEventRegistrations)
  .where(eq(sportingEventRegistrations.id, registrationId))
  .limit(1)
  .get();
  if (!registration) {
    console.error("Registration not found for id", registrationId);
    throw new Error("Registration not found for id " + registrationId);
  }
  if (registration.status === 'paid') {
    console.log(`Registration ${registrationId} is already marked as paid`);
    return {
      bib_number: registration.bib_number,
      chip_id: registration.chip_id,
      reserved_clothing_id: registration.reserved_clothing_id,
    };
  }
  const latestBibFromRegistrations = await db
    .select({ bib: sportingEventRegistrations.bib_number })
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.status, 'paid'),
      eq(sportingEventRegistrations.circuit_id, registration.circuit_id!),
      isNotNull(sportingEventRegistrations.bib_number)
    ))
    .orderBy(desc(sportingEventRegistrations.bib_number))
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

  // BIB Assignment
  let nextBibNumber = (latestBibFromRegistrations && latestBibFromRegistrations.bib)
    ? latestBibFromRegistrations.bib + 1
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
      .orderBy(desc(sportingEventRegistrations.bib_number))
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
    const latestChipIdFromRegistrations = await db
      .select({ chip_id: sportingEventRegistrations.chip_id })
      .from(sportingEventRegistrations)
      .where(and(
        eq(sportingEventRegistrations.status, 'paid'),
        isNotNull(sportingEventRegistrations.chip_id)
      ))
      .orderBy(desc(sportingEventRegistrations.chip_id))
      .limit(1)
      .get();

    try {
      chipId = await getNextChipId(db, latestChipIdFromRegistrations?.chip_id || null);
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

  const totalPaidAmount = (registration.paid_amount || 0) + (paidAmount || 0);

  await db.update(sportingEventRegistrations)
    .set({
      status: 'paid',
      full_payment_date: new Date().toISOString(),
      reserved_clothing_id: clothingCanBeReserved
        ? registration.demanded_clothing_id
        : null,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
      bib_number: nextBibNumber,
      chip_id: chipId,
      paid_amount: totalPaidAmount,
    })
    .where(eq(
      sportingEventRegistrations.id,
      registrationId
    ));

  return {
    bib_number: nextBibNumber,
    chip_id: chipId,
    reserved_clothing_id: clothingCanBeReserved ? registration.demanded_clothing_id : null,
  }
}

export const newPaymentForRegistration = async (
  db: DrizzleD1Database,
  registrationId: number,
  paidAmount: number,
) => {
  const registration = await db.select({
      id: sportingEventRegistrations.id,
      event_id: sportingEventRegistrations.event_id,
      user_id: sportingEventRegistrations.user_id,
      promotional_fee_applied: sportingEventRegistrations.promotional_fee_applied,
      paid_amount: sportingEventRegistrations.paid_amount,
      status: sportingEventRegistrations.status,
      discount_percentage: sportingEventRegistrations.discount_percentage,
    })
    .from(sportingEventRegistrations)
    .where(eq(sportingEventRegistrations.id, registrationId))
    .limit(1)
    .get();
  if (!registration) {
    return false;
  }
  const eventData = await db
    .select({
      fee_amount: sportingEvents.fee_amount,
      fee_amount_promotional: sportingEvents.fee_amount_promotional,
      promotional_fee_payment_due_date: sportingEvents.promotional_fee_payment_due_date,
    })
    .from(sportingEvents)
    .where(eq(sportingEvents.id, registration.event_id!))
    .limit(1)
    .get();
  if (!eventData) {
    return false;
  }
  if (registration.status === 'paid') {
    await db.update(sportingEventRegistrations)
      .set({
        paid_amount: (registration.paid_amount || 0) + paidAmount,
        updated_at: new Date().toISOString(),
      })
      .where(eq(
        sportingEventRegistrations.id,
        registrationId
      ));
    return true;
  }

  const {
    pending_to_pay
  } = getPendingToPayAmount(
    eventData,
    {
      ...registration,
      promotional_fee_applied: registration.promotional_fee_applied === 1
    }
  )

  if (paidAmount < pending_to_pay) {
    await db.update(sportingEventRegistrations)
      .set({
        paid_amount: (registration.paid_amount || 0) + paidAmount,
        updated_at: new Date().toISOString(),
      })
      .where(eq(
        sportingEventRegistrations.id,
        registrationId
      ));
    return true;
  }

  await setRegistrationAsPaid(db, registrationId, registration.user_id, paidAmount);
  return true;
}

export const calculatePaidBasedOnTransactions = async (
  db: DrizzleD1Database,
  registrationId: number
) => {
  const registration = await db.select({
      id: sportingEventRegistrations.id,
      event_id: sportingEventRegistrations.event_id,
      user_id: sportingEventRegistrations.user_id,
      promotional_fee_applied: sportingEventRegistrations.promotional_fee_applied,
      paid_amount: sportingEventRegistrations.paid_amount,
      status: sportingEventRegistrations.status,
      discount_percentage: sportingEventRegistrations.discount_percentage,
    })
    .from(sportingEventRegistrations)
    .where(eq(sportingEventRegistrations.id, registrationId))
    .limit(1)
    .get();
  if (!registration) {
    return false;
  }
  const eventData = await db
    .select({
      fee_amount: sportingEvents.fee_amount,
      fee_amount_promotional: sportingEvents.fee_amount_promotional,
      promotional_fee_payment_due_date: sportingEvents.promotional_fee_payment_due_date,
    })
    .from(sportingEvents)
    .where(eq(sportingEvents.id, registration.event_id!))
    .limit(1)
    .get();
  if (!eventData) {
    return false;
  }

  const transactions = await db
    .select({ amount: sportingEventTransactions.amount })
    .from(sportingEventTransactions)
    .where(and(
      eq(sportingEventTransactions.registration_id, registrationId),
      eq(sportingEventTransactions.category, 'registration_payment'),
      eq(sportingEventTransactions.status, 'completed'),
    ))
    .all();
  const totalPaid = transactions.reduce((sum, t) => sum + t.amount, 0);

  const {
    pending_to_pay
  } = getPendingToPayAmount(
    eventData,
    {
      ...registration,
      paid_amount: totalPaid,
      promotional_fee_applied: registration.promotional_fee_applied === 1
    }
  )

  if (pending_to_pay <= 0) {
    await setRegistrationAsPaid(
      db,
      registrationId,
      registration.user_id,
      totalPaid - (registration.paid_amount || 0)
    );
  } else {
    await db.update(sportingEventRegistrations)
      .set({
        status: 'pending',
        paid_amount: totalPaid,
        updated_at: new Date().toISOString(),
      })
      .where(eq(
        sportingEventRegistrations.id,
        registrationId
      ));
  }
}


const getRegistrations = async (
  db: DrizzleD1Database,
  eventId: number,
  registrationIds: number[],
) => {
  const registrations: {
    id: number,
    promotional_fee_applied: number,
    paid_amount: number,
    status: string,
    discount_percentage: number,
  }[] = [];
  for (let index = 0; index < registrationIds.length; index += 50) {
    const slicedRegs = registrationIds.slice(index, index + 50);
    const regs = await db
      .select({
        id: sportingEventRegistrations.id,
        promotional_fee_applied: sportingEventRegistrations.promotional_fee_applied,
        paid_amount: sportingEventRegistrations.paid_amount,
        status: sportingEventRegistrations.status,
        discount_percentage: sportingEventRegistrations.discount_percentage,
      })
      .from(sportingEventRegistrations)
      .where(and(
        eq(sportingEventRegistrations.event_id, eventId),
        inArray(sportingEventRegistrations.id, slicedRegs),
      ))
      .all();
    if (regs.length === 0 || regs.length !== slicedRegs.length) {
      return null;
    }
    registrations.push(...regs);
  }
  if (registrations.length === 0 || registrations.length !== registrationIds.length) {
    return null;
  }
  return registrations;
}


const getRegistrationsMin = async (
  db: DrizzleD1Database,
  eventId: number,
  registrationIds: number[],
) => {
  const registrations: {
    id: number,
    status: string,
  }[] = [];
  for (let index = 0; index < registrationIds.length; index += 50) {
    const slicedRegs = registrationIds.slice(index, index + 50);
    const regs = await db
      .select({
        id: sportingEventRegistrations.id,
        status: sportingEventRegistrations.status,
      })
      .from(sportingEventRegistrations)
      .where(and(
        eq(sportingEventRegistrations.event_id, eventId),
        inArray(sportingEventRegistrations.id, slicedRegs),
      ))
      .all();
    if (regs.length === 0 || regs.length !== slicedRegs.length) {
      return null;
    }
    registrations.push(...regs);
  }
  if (registrations.length === 0 || registrations.length !== registrationIds.length) {
    return null;
  }
  return registrations;
}


const getEventData = async (
  db: DrizzleD1Database,
  eventId: number,
) => {
  const eventData = await db
    .select({
      fee_amount: sportingEvents.fee_amount,
      fee_amount_promotional: sportingEvents.fee_amount_promotional,
      promotional_fee_payment_due_date: sportingEvents.promotional_fee_payment_due_date,
    })
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1)
    .get();
  return eventData;
}


export const applyDiscountToRegistrations = async (
  db: DrizzleD1Database,
  eventId: number,
  registrationIds: number[],
  discountPercentage: number,
  reason: string,
  updatedBy: string,
): Promise<DataResult> => {
  const registrations = await getRegistrations(db, eventId, registrationIds);
  if (registrations === null) {
    return { status: 404, message: M.SPORTING_EVENT_REGISTRATIONS_NOT_FOUND };
  }

  const eventData = await getEventData(db, eventId);
  if (!eventData) {
    return { status: 404, message: M.SPORTING_EVENT_NOT_FOUND };
  }

  const applyDiscount = Math.max(0, Math.min(100, discountPercentage));
  for (let index = 0; index < registrationIds.length; index += 50) {
    const slicedRegs = registrationIds.slice(index, index + 50);
    await db.update(sportingEventRegistrations)
      .set({
        discount_percentage: applyDiscount,
        discount_reason: applyDiscount > 0
          ? (reason || `Descuento manual aplicado por ${updatedBy.slice(-3)}`)
          : null,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      })
      .where(inArray(
        sportingEventRegistrations.id,
        slicedRegs
      ));
  }
  const results = registrations.map(r => {
    const {
      pending_to_pay
    } = getPendingToPayAmount(
      eventData,
      {
        ...r,
        promotional_fee_applied: r.promotional_fee_applied === 1,
        discount_percentage: applyDiscount,
      }
    );
    if (pending_to_pay <= 0) {
      return {
        id: r.id,
        status: 'paid',
        discount: applyDiscount,
        pending: 0,
      }
    }
    return {
      id: r.id,
      status: 'pending',
      discount: applyDiscount,
      pending: pending_to_pay,
    }
  })
  const paid = results.filter(r => r.status === 'paid');
  for (const registration of paid) {
    await setRegistrationAsPaid(db, registration.id, updatedBy, 0);
  }
  return {
    status: 200,
    message: M.SPORTING_EVENT_REGISTRATIONS_DISCOUNT_APPLIED_SUCCESSFULLY,
    data: results,
  }
}


export const dismissPendingAmountsRegistrations = async (
  db: DrizzleD1Database,
  eventId: number,
  registrationIds: number[],
  updatedBy: string,
): Promise<DataResult> => {
  const registrations = await getRegistrations(db, eventId, registrationIds);
  if (registrations === null) {
    return { status: 404, message: M.SPORTING_EVENT_REGISTRATIONS_NOT_FOUND };
  }

  const eventData = await getEventData(db, eventId);
  if (!eventData) {
    return { status: 404, message: M.SPORTING_EVENT_NOT_FOUND };
  }

  const notpaid = registrations.filter(r => r.status !== 'paid');
  for (const registration of notpaid) {
    await setRegistrationAsPaid(db, registration.id, updatedBy, 0);
  }
  return {
    status: 200,
    message: M.SPORTING_EVENT_REGISTRATIONS_DISMISSED_PENDING_AMOUNTS_SUCCESSFULLY,
    data: registrations.map(r => ({
      id: r.id,
      status: 'paid',
      discount: r.discount_percentage,
      pending: 0,
    })),
  }
}


export const cancelRegistrations = async (
  db: DrizzleD1Database,
  eventId: number,
  registrationIds: number[],
  updatedBy: string,
): Promise<DataResult> => {
  const registrations = await getRegistrationsMin(db, eventId, registrationIds);
  if (!registrations) {
    return { status: 404, message: M.SPORTING_EVENT_REGISTRATIONS_NOT_FOUND };
  }

  for (let index = 0; index < registrationIds.length; index += 50) {
    const slicedRegs = registrationIds.slice(index, index + 50);
    await db.update(sportingEventRegistrations)
      .set({
        status: 'cancelled',
        reserved_clothing_id: null,
        chip_id: null,
        bib_number: null,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      })
      .where(inArray(
        sportingEventRegistrations.id,
        slicedRegs
      ));
  }
  return {
    status: 200,
    message: M.SPORTING_EVENT_REGISTRATIONS_CANCELLED_SUCCESSFULLY,
  }
}


export const reactivateRegistrations = async (
  db: DrizzleD1Database,
  eventId: number,
  registrationIds: number[],
  updatedBy: string,
): Promise<DataResult> => {
  const registrations = await getRegistrations(db, eventId, registrationIds);
  if (registrations === null) {
    return { status: 404, message: M.SPORTING_EVENT_REGISTRATIONS_NOT_FOUND };
  }

  const eventData = await getEventData(db, eventId);
  if (!eventData) {
    return { status: 404, message: M.SPORTING_EVENT_NOT_FOUND };
  }

  const cancelledOrExpired = registrations
    .filter(r => ['cancelled', 'expired'].includes(r.status))
    .map(r => {
      const {
        pending_to_pay,
      } = getPendingToPayAmount(
        eventData,
        {
          ...r,
          status: 'pending',
          promotional_fee_applied: r.promotional_fee_applied === 1,
        }
      );
      if (pending_to_pay > 0) {
        return {
          id: r.id,
          status: 'pending',
          pending_to_pay,
        }
      }
      return {
        id: r.id,
        status: 'paid',
        pending_to_pay: 0,
      }
    });
  const pending = cancelledOrExpired.filter(r => r.status === 'pending');
  for (let index = 0; index < pending.length; index += 50) {
    const slicedPending = pending.slice(index, index + 50);
    await db.update(sportingEventRegistrations)
      .set({
        status: 'pending',
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      })
      .where(inArray(
        sportingEventRegistrations.id,
        slicedPending.map(r => r.id)
      ));
  }
  const paid = cancelledOrExpired.filter(r => r.status === 'paid');
  for (const registration of paid) {
    await setRegistrationAsPaid(db, registration.id, updatedBy, 0);
  }
  return {
    status: 200,
    message: M.SPORTING_EVENT_REGISTRATIONS_REACTIVATED_SUCCESSFULLY,
    // data: result,
  }
}


export const transferRegistration = async (
  db: DrizzleD1Database,
  eventId: number,
  fromRegistrationId: number,
  toUserId: string,
  updatedBy: string,
): Promise<DataResult> => {
  const fromRegistration = await db.select({
    id: sportingEventRegistrations.id,
    status: sportingEventRegistrations.status,
    event_id: sportingEventRegistrations.event_id,
    user_id: sportingEventRegistrations.user_id,
    circuit_id: sportingEventRegistrations.circuit_id,
    bib_number: sportingEventRegistrations.bib_number,
    chip_id: sportingEventRegistrations.chip_id,
    paid_amount: sportingEventRegistrations.paid_amount,
    promotional_fee_applied: sportingEventRegistrations.promotional_fee_applied,
    discount_percentage: sportingEventRegistrations.discount_percentage,
  })
  .from(sportingEventRegistrations)
  .where(and(
    eq(sportingEventRegistrations.id, fromRegistrationId),
    eq(sportingEventRegistrations.event_id, eventId),
  ))
  .limit(1)
  .get();
  if (!fromRegistration) {
    return { status: 404, message: M.SPORTING_EVENT_REGISTRATION_NOT_FOUND };
  }
  if (fromRegistration.status !== 'paid') {
    return { status: 400, message: M.SPORTING_EVENT_REGISTRATION_TRANSFER_ONLY_PAID_ALLOWED };
  }
  const toUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, toUserId))
    .limit(1)
    .get();
  if (!toUser) {
    return { status: 404, message: M.USER_NOT_FOUND };
  }
  const toUserRegistration = await db
    .select({
      id: sportingEventRegistrations.id,
      status: sportingEventRegistrations.status,
      demanded_clothing_id: sportingEventRegistrations.demanded_clothing_id,
    })
    .from(sportingEventRegistrations)
    .where(and(
      eq(sportingEventRegistrations.user_id, toUserId),
      eq(sportingEventRegistrations.event_id, eventId),
    ))
    .limit(1)
    .get();
  if (!toUserRegistration) {
    return { status: 404, message: M.SPORTING_EVENT_BENEFICIARY_REGISTRATION_NOT_FOUND };
  }
  if (toUserRegistration.status === "paid") {
    return { status: 400, message: M.SPORTING_EVENT_BENEFICIARY_REGISTRATION_ALREADY_PAID };
  }
  if (toUserRegistration.status === "cancelled") {
    return { status: 400, message: M.SPORTING_EVENT_BENEFICIARY_REGISTRATION_CANCELLED };
  }

  await db.update(sportingEventRegistrations)
    .set({
      status: 'cancelled',
      chip_id: null,
      bib_number: null,
      reserved_clothing_id: null,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    })
    .where(eq(sportingEventRegistrations.id, fromRegistration.id));
  await db.update(sportingEventRegistrations)
    .set({
      status: 'paid',
      chip_id: fromRegistration.chip_id,
      bib_number: fromRegistration.bib_number,
      reserved_clothing_id: toUserRegistration.demanded_clothing_id,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    })
    .where(eq(sportingEventRegistrations.id, toUserRegistration.id));

  return {
    status: 200,
    message: M.SPORTING_EVENT_REGISTRATION_TRANSFERRED_SUCCESSFULLY,
  }
}
