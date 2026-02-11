import { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, asc, inArray, and } from 'drizzle-orm';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import {
  users,
  sportingEvents,
  sportingEventCircuits,
  sportingEventSchedules,
  sportingEventRegistrations,
  sportingEventAthleteCategories,
  sportingEventClothing
} from '../db/schema'
import { userRegisteredInEvent } from './sportingEventRegistrations';
import { M, appendToMessage } from './messages';
import z from 'zod';
import {
  SportingEventDbSchema,
  SportingEventClothingSchema,
  SportingEventCircuitSchema,
  SportingEventScheduleSchema,
  SportingEventAthleteCategorySchema
} from '@shared/types';
import { ARSportingEventSchema } from '@shared/apiRespTypes';


interface DataResult {
  status: ContentfulStatusCode;
  message?: Record<string, string>;
  data?: any;
}
interface NoDataResult {
  status: ContentfulStatusCode;
  message: Record<string, string>;
}

export const getSpEventMin = async (
    db: DrizzleD1Database,
    eventId: number): Promise<DataResult> => {
  const event = await db
    .select({
      id: sportingEvents.id,
      title: sportingEvents.title,
      date: sportingEvents.date,
    })
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1)
    .get();
  if (!event) {
    return {
      status: 404,
      message: M.SPORTING_EVENT_NOT_FOUND
    };
  }
  return {
    status: 200,
    data: event,
  };
}

export const getSpEvent = async (
    db: DrizzleD1Database,
    eventId: number,
    userId?: string | null): Promise<DataResult> => {
  const event = await db
    .select()
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1)
  if (event.length === 0) {
    return {
      status: 404,
      message: M.SPORTING_EVENT_NOT_FOUND
    };
  }
  const circuits = await db
    .select()
    .from(sportingEventCircuits)
    .where(eq(sportingEventCircuits.event_id, eventId));;
  const schedules = await db
    .select()
    .from(sportingEventSchedules)
    .where(eq(sportingEventSchedules.event_id, eventId))
    .orderBy(asc(sportingEventSchedules.date));
  const athleteCategories = await db
    .select()
    .from(sportingEventAthleteCategories)
    .where(eq(sportingEventAthleteCategories.event_id, eventId))
    .orderBy(asc(sportingEventAthleteCategories.circuit_id), asc(sportingEventAthleteCategories.name));
  const athletesRegistered = await db
    .select()
    .from(sportingEventRegistrations)
    .where(eq(sportingEventRegistrations.event_id, eventId));
  const clothing = await db
    .select()
    .from(sportingEventClothing)
    .where(eq(sportingEventClothing.event_id, eventId));
  const athletesConfirmed = athletesRegistered.filter(
    ar => ar.status === 'paid' || ar.status === 'partially_paid');
  // console.log(event);
  const ev = {
    ...event[0],
    circuits: circuits.length > 0 ? circuits : null,
    schedules: schedules.length > 0 ? schedules : null,
    categories: athleteCategories.length > 0 ? athleteCategories : null,
    clothing: clothing.length > 0 ? clothing : null,
    athletes_registered: athletesRegistered.length,
    athletes_confirmed: athletesConfirmed.length,
    user_registration_status: {
      registration_status: 'not_registered',
      category_name: '',
      circuit_id: -1,
      pending_to_pay: 0,
    }, // not registered
  };
  if (userId) {
    ev.user_registration_status = await userRegisteredInEvent(db, eventId, userId);
  }
  return {
    status: 200,
    data: ev
  };
}

interface ReadSpEventResult extends DataResult {
  data?: z.infer<typeof SportingEventDbSchema>;
  schedules?: z.infer<typeof SportingEventScheduleSchema>[] | null;
  clothing?: z.infer<typeof SportingEventClothingSchema>[] | null;
  circuits?: z.infer<typeof SportingEventCircuitSchema>[] | null;
  categories?: z.infer<typeof SportingEventAthleteCategorySchema>[] | null;
}

const readSpEvent = (
  eventData: z.infer<typeof ARSportingEventSchema>
): ReadSpEventResult => {
// main event data validation
  const ev = ARSportingEventSchema.omit({id: true}).parse(eventData);

  // circuits validation
  let circuits = null;
  if (ev.circuits && ev.circuits.length > 0) {
    try {
      circuits = ev.circuits.map(item =>
        SportingEventCircuitSchema.omit({id: true}).parse(item)
      );
    } catch (error) {
      // Handle parsing error if needed
      console.log("Error parsing sporting event circuit data:", error)
      return {
        status: 400,
        message: M.SPORTING_EVENT_CIRCUIT_INVALID_DATA,
      };
    }
  }

  // schedules validation
  let schedules = null;
  if (ev.schedules && ev.schedules.length > 0) {
    try {
      schedules = ev.schedules.map(item =>
        SportingEventScheduleSchema.omit({id: true}).parse(item)
      );
    } catch (error) {
      // Handle parsing error if needed
      console.log("Error parsing sporting event schedule data:", error)
      return {
        status: 400,
        message: M.SPORTING_EVENT_SCHEDULE_INVALID_DATA,
      };
    }
  }

  // clothing validation
  let clothing = null;
  if (ev.clothing && ev.clothing.length > 0) {
    try {
      clothing = ev.clothing.map(item =>
        SportingEventClothingSchema.omit({id: true}).parse(item)
      );
    } catch (error) {
      // Handle parsing error if needed
      console.log("Error parsing sporting event clothing data:", error)
      return {
        status: 400,
        message: M.SPORTING_EVENT_CLOTHING_INVALID_DATA,
      };
    }
  }

  let categories = null;
  if (ev.categories && ev.categories.length > 0) {
    try {
      categories = ev.categories.map(item =>
        SportingEventAthleteCategorySchema.omit({id: true}).parse(item)
      );
    } catch (error) {
      // Handle parsing error if needed
      console.log("Error parsing sporting event athlete category data:", error)
      return {
        status: 400,
        message: M.SPORTING_EVENT_ATHLETE_CATEGORY_INVALID_DATA,
      };
    }
  }

  const data = SportingEventDbSchema.parse(ev);

  return {
    status: 200,
    data,
    schedules,
    clothing,
    circuits,
    categories,
  }
}


export const addSpEvent = async (
  db: DrizzleD1Database,
  eventData: z.infer<typeof ARSportingEventSchema>,
  userId: string
): Promise<DataResult> => {

  const {
    status,
    message,
    data,
    schedules,
    clothing,
    circuits,
    // categories
  } = readSpEvent(eventData);

  if (status !== 200 || !data) {
    return {
      status: 400,
      message: message || {
        "es": "Error al leer los datos del evento deportivo",
        "en": "Error reading sporting event data",
      }
    };
  }

  const result = await db.insert(sportingEvents).values({
    ...data,
    date: data.date.toISOString(),
    registration_start: data.registration_start?.toISOString() || null,
    registration_end: data.registration_end?.toISOString() || null,
    created_by: userId,
    updated_by: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).returning();

  if (circuits && circuits.length > 0) {
    await db.insert(sportingEventCircuits).values(
      circuits.map(circuit => ({
        ...circuit,
        event_id: result[0].id,
      }))
    );
  }

  if (schedules && schedules.length > 0) {
    await db.insert(sportingEventSchedules).values(
      schedules.map(schedule => ({
        ...schedule,
        event_id: result[0].id,
        date: schedule.date.toISOString()
      }))
    );
  }

  if (clothing && clothing.length > 0) {
    await db.insert(sportingEventClothing).values(
      clothing.map(cloth => ({
        ...cloth,
        event_id: result[0].id,
      }))
    );
  }

  // TODO categories

  return {
    status: 200,
    data: result[0].id,
  };
}


export const crudArray = async <T = any>(
  eventId: number,
  array: any[] | null | undefined,
  dbArray: any[] | null | undefined
): Promise<{
  insert: T[];
  update: T[];
  delete: number[];
}> => {
  if (!array) {
    return {
      insert: [],
      update: [],
      delete: dbArray?.map(e => e.id) || [],
    }
  }
  if (!dbArray) {
    return {
      insert: array.map(element => ({
        event_id: eventId,
        ...element,
      })),
      update: [],
      delete: [],
    }
  }
  const arrayMap = new Map<number, any>();
  const newElements = [];
  const delElements = [];
  const updElements = [];
  for (const element of array) {
    if (element.id) {
      arrayMap.set(element.id, element);
    } else {
      newElements.push({
        event_id: eventId,
        ...element,
      });
    }
  }
  for (const dbElement of dbArray) {
    const formElement = arrayMap.get(dbElement.id);
    if (formElement) {
      // update
      updElements.push(formElement);
      arrayMap.delete(dbElement.id);
    } else {
      // delete
      delElements.push(dbElement.id);
    }
  }
  return {
    insert: newElements,
    update: updElements,
    delete: delElements,
  }
}


export const updateSpEvent = async (
    db: DrizzleD1Database,
    eventId: number,
    eventData: z.infer<typeof ARSportingEventSchema>,
    userId: string): Promise<NoDataResult> => {

  const {
    status,
    message,
    data,
    schedules,
    clothing,
    circuits,
    // categories
  } = readSpEvent(eventData);

  if (status !== 200 || !data) {
    return {
      status: 400,
      message: message || {
        "es": "Error al leer los datos del evento deportivo",
        "en": "Error reading sporting event data",
      }
    };
  }

  const finalData = SportingEventDbSchema.omit({
    id: true,
    created_at: true,
    created_by: true,
    updated_at: true,
    updated_by: true,
  }).parse(data)
  const res = await db.update(sportingEvents)
    .set({
      ...finalData,
      date: finalData.date.toISOString(),
      registration_start: finalData.registration_start?.toISOString() || null,
      registration_end: finalData.registration_end?.toISOString() || null,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .where(eq(sportingEvents.id, eventId))
    .run();
  if (res.meta.changes === 0) {
    return { status: 404, message: M.SPORTING_EVENT_NOT_FOUND };
  }

  // Update, delete or insert circuits
  // map by id the form circuits
  const dbCircuits = await db
    .select()
    .from(sportingEventCircuits)
    .where(eq(sportingEventCircuits.event_id, eventId));
  const resCircuits = await crudArray<z.infer<typeof SportingEventCircuitSchema>>(eventId, circuits, dbCircuits);
  const finalCircuitSchema = z.array(SportingEventCircuitSchema.omit({id: true}).required());
  // Insert new circuits
  if (resCircuits.insert.length > 0) {
    await db.insert(sportingEventCircuits).values(finalCircuitSchema.parse(resCircuits.insert));
  }
  // Update existing circuits
  for (const circuit of resCircuits.update) {
    await db.update(sportingEventCircuits)
      .set({
        name: circuit.name,
        description: circuit.description,
        distance_km: circuit.distance_km,
        map_url: circuit.map_url,
      })
      .where(eq(sportingEventCircuits.id, circuit.id!))
      .run();
  }
  // Delete removed circuits
  if (resCircuits.delete.length > 0) {
    await db.delete(sportingEventCircuits)
      .where(inArray(sportingEventCircuits.id, resCircuits.delete))
      .run();
  }

  // Update, delete or insert schedules
  // map by id the form schedules
  const dbSchedules = await db
    .select()
    .from(sportingEventSchedules)
    .where(eq(sportingEventSchedules.event_id, eventId));
  const resSchedules = await crudArray<z.infer<typeof SportingEventScheduleSchema>>(eventId, schedules, dbSchedules);
  const finalScheduleSchema = z.array(SportingEventScheduleSchema.omit({id: true}).required());
  // Insert new schedules
  if (resSchedules.insert.length > 0) {
    const tempSchedules = finalScheduleSchema.parse(resSchedules.insert);
    await db.insert(sportingEventSchedules).values(tempSchedules.map(
      schedule => ({
        ...schedule,
        date: schedule.date.toISOString(),
      })
    ));
  }
  // Update existing schedules
  for (const schedule of resSchedules.update) {
    await db.update(sportingEventSchedules)
      .set({
        date: schedule.date?.toISOString(),
        title: schedule.title,
        description: schedule.description,
        location: schedule.location,
        location_address: schedule.location_address,
        location_lat: schedule.location_lat,
        location_long: schedule.location_long,
      })
      .where(eq(sportingEventSchedules.id, schedule.id!))
      .run();
  }
  // Delete removed schedules
  if (resSchedules.delete.length > 0) {
    await db.delete(sportingEventSchedules)
      .where(inArray(sportingEventSchedules.id, resSchedules.delete))
      .run();
  }

  const dbClothing = await db
    .select()
    .from(sportingEventClothing)
    .where(eq(sportingEventClothing.event_id, eventId));
    const resClothing = await crudArray<z.infer<typeof SportingEventClothingSchema>>(eventId, clothing, dbClothing);
    const finalClothingSchema = z.array(SportingEventClothingSchema.omit({id: true}).required());
  // Insert new clothing
  if (resClothing.insert.length > 0) {
    await db.insert(sportingEventClothing).values(finalClothingSchema.parse(resClothing.insert));
  }
  // Update existing clothing
  for (const cloth of resClothing.update) {
    await db.update(sportingEventClothing)
      .set(cloth)
      .where(eq(sportingEventClothing.id, cloth.id!))
      .run();
  }
  // Delete removed clothing
  if (resClothing.delete.length > 0) {
    await db.delete(sportingEventClothing)
      .where(inArray(sportingEventClothing.id, resClothing.delete))
      .run();
  }

  // TODO categories

  return { status: 200, message: M.SPORTING_EVENT_UPDATED_SUCCESSFULLY };
}


export const registerToSpEvent = async (
    db: DrizzleD1Database,
    eventId: number,
    reqUserId: string,
    userId: string,
    circuitId: number): Promise<DataResult> => {
  const spEvent = await db.select()
    .from(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .limit(1);
  if (spEvent.length === 0) {
    return { status: 404, message: M.SPORTING_EVENT_NOT_FOUND };
  }
  const feeAmount = spEvent[0].fee_amount;
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
      manual_athlete_category: users.manual_athlete_category,
      training_team_id: users.training_team_id,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (userData.length === 0) {
    return { status: 404, message: M.USER_NOT_FOUND };
  }
  // determine athlete category
  const athleteCategories = await db
    .select()
    .from(sportingEventAthleteCategories)
    .where(and(
      eq(sportingEventAthleteCategories.event_id, eventId),
      eq(sportingEventAthleteCategories.circuit_id, circuitId)
    ));
  let categoryId: number | null = null;
  let categoryName: string | null = null;
  if (userData[0].manual_athlete_category) {
    // find category by name
    const matchingCategories = athleteCategories
      .filter(cat =>
        cat.name.toLowerCase()
          .startsWith(
            userData[0].manual_athlete_category!
              .toLowerCase())
    );
    if (matchingCategories.length === 0) {
      categoryId = null; // organizer will have to set it manually
      categoryName = null;
    } else {
      categoryId = matchingCategories[0].id;
      categoryName = matchingCategories[0].name;
    }
  } else {
    // try to find category based on age
    if (!userData[0].date_of_birth) {
      return { status: 400, message: M.USER_DATE_OF_BIRTH_NOT_SET };
    }
    const birthDate = new Date(userData[0].date_of_birth);
    const today = new Date();
    let age = today.getTime() - birthDate.getTime();
    age /= 1000 * 60 * 60 * 24;
    age = Math.floor(age / 365.25);
    const qualifiedCategories = athleteCategories.filter(cat => {
      if (cat.exclude_auto_qualify) {
        return false;
      }
      const minAgeOk = (cat.min_age === null || age >= cat.min_age);
      const maxAgeOk = (cat.max_age === null || age <= cat.max_age);
      const sexOk = (cat.sex === null || userData[0].sex === cat.sex);
      return minAgeOk && maxAgeOk && sexOk;
    });
    if (qualifiedCategories.length === 0) {
      return { status: 400, message: M.SPORTING_EVENT_USER_UNQUALIFIED_FOR_ANY_CATEGORY };
    } else if (qualifiedCategories.length > 1) {
      return {
        status: 400,
        message: appendToMessage(
          M.SPORTING_EVENT_USER_QUALIFIES_FOR_MULTIPLE_CATEGORIES_$APPEND,
          qualifiedCategories.map(cat => cat.name).join(', ')
        )
      };
    }
    categoryId = qualifiedCategories[0].id;
    categoryName = qualifiedCategories[0].name;
  }

  if (!userData[0].clothing_shirt_size) {
    return { status: 400, message: M.USER_SHIRT_SIZE_NOT_SET };
  }

  const userClothing = await db
    .select()
    .from(sportingEventClothing)
    .where(and(
      eq(sportingEventClothing.event_id, eventId),
      eq(sportingEventClothing.size, userData[0].clothing_shirt_size),
    ))
    .limit(1);

  const fee_amount_after_discount = feeAmount * (1 - (userData[0].discount_percentage || 0) / 100);
  const status = fee_amount_after_discount > 0 ? "pending" : "paid";

  await db.insert(sportingEventRegistrations).values({
    event_id: eventId,
    user_id: userId,
    category_id: categoryId,
    training_team_id: userData[0].training_team_id,
    discount_percentage: userData[0].discount_percentage || 0,
    discount_reason:
    userData[0].discount_percentage
    ? "Descuento automático para usuario (fijado en la configuración del usuario)"
    : null,
    fee_amount_original: feeAmount,
    fee_amount_after_discount,
    demanded_clothing_id: userClothing.length > 0 ? userClothing[0].id : null,
    status,
    paid_percentage: fee_amount_after_discount > 0 ? 0 : 100,
    created_by: reqUserId,
    updated_by: reqUserId,
  });
  return {
    status: 200,
    message: M.SPORTING_EVENT_REGISTRATION_CREATED_SUCCESSFULLY,
    data: {
      registration_status: status,
      category_name: categoryName,
      circuit_id: circuitId,
      pending_to_pay: fee_amount_after_discount,
    }
  };
}

export const delSpEvent = async (
    db: DrizzleD1Database,
    eventId: number): Promise<NoDataResult> => {
  const res = await db.delete(sportingEvents)
    .where(eq(sportingEvents.id, eventId))
    .run();
  if (res.meta.changes === 0) {
    return { status: 404, message: M.SPORTING_EVENT_NOT_FOUND };
  }
  return { status: 200, message: M.SPORTING_EVENT_DELETED_SUCCESSFULLY };
}
