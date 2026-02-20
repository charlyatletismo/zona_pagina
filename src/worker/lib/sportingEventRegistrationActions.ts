import { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, inArray, and } from 'drizzle-orm';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import {
  users,
  sportingEvents,
  sportingEventRegistrations,
  sportingEventClothing
} from '../db/schema'
import { M } from './messages';
import { authorizedOrg, authorizedAthMan } from '@shared/roles';


interface DataResult {
  status: ContentfulStatusCode;
  message?: Record<string, string>;
  data?: any;
}
interface NoDataResult {
  status: ContentfulStatusCode;
  message: Record<string, string>;
}


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

  await db.insert(sportingEventRegistrations).values({
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
    status,
    full_payment_date: status === "paid" ? new Date().toISOString() : null,
    demanded_clothing_id: userClothing.length > 0 ? userClothing[0].id : null,
    // reserved_clothing_id default to null in the database
    // chip_id default to null in the database
    created_by: reqUserId,
    updated_by: reqUserId,
  });
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
