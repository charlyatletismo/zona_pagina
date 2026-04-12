import { Hono } from "hono";
import { Env, Variables } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import {
  authorizedAthMan,
  authorizedOrg
} from '@shared/roles';
import {
  getSpIsHidden,
  getSpEvent,
  addSpEvent,
  updateSpEvent,
  delSpEvent,
  getSpEventMin,
  getSpEventPaymentMethods,
} from "./lib/sportingEvents";
import {
  deleteSpEventPhoto,
  getSpEventGallery,
  updateSpEventPhoto,
} from "./lib/sportingEventPhotos";
import {
  registerToSpEvent,
  deleteRegistrationToSpEvent,
  setRegistrationAsPaid,
  applyDiscountToRegistrations,
  dismissPendingAmountsRegistrations,
  cancelRegistrations,
  reactivateRegistrations,
  transferRegistration,
  updateSpEventRegClothingReserved,
  makeTeamSpEventRegistration,
} from "./lib/sportingEventRegistrationActions";
import {
  mainSportingEventsList,
  allSportingEventsList,
  getUserRegisteredSpEvents,
  getManagedUsersRegisteredSpEvents,
} from "./lib/sportingEventList";
import {
  getUserRegistration,
  getPaidRegistrations,
  updateSpEventRegistrationKitDeliveredStatus,
  getAllUsersRegistrations,
  getAllUsersRegistrationsSafe,
  getUserRegistrationWithEvent,
} from "./lib/sportingEventRegistrations";
import {
  getClothingStats,
  addClothingToSpEvent,
} from "./lib/sportingEventClothing";
import {
  userIsBanned
} from "./lib/checks";
import { buildItemId } from "./lib/utilsPayment";
import { ARSportingEventSchema } from "@shared/apiRespTypes";
import { M } from "./lib/messages";


export const sportingEventsRoute = new Hono<{ Bindings: Env, Variables: Variables }>()
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const res = await mainSportingEventsList(db);
    return c.json({ data: res });
  })
  .get("/all", async (c) => {
    const db = drizzle(c.env.DB);
    const res = await allSportingEventsList(
      db,
      authorizedOrg(c.get('jwtPayload')?.role),
    );
    return c.json({ data: res });
  })
  .get("/myEvents", async (c) => {
    const db = drizzle(c.env.DB);
    const userId: string = c.get('jwtPayload').id;
    const res = await getUserRegisteredSpEvents(db, userId);
    return c.json({ data: res });
  })
  .get("/myManagedUsersEvents", async (c) => {
    const db = drizzle(c.env.DB);
    const managerId: string = c.get('jwtPayload').id;
    const res = await getManagedUsersRegisteredSpEvents(db, managerId);
    return c.json({ data: res });
  })
  .get("/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const isHidden = await getSpIsHidden(db, Number(id));
    if (isHidden && !authorizedOrg(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.SPORTING_EVENT_NOT_FOUND }, 404);
    }
    const userId: string | null = c.get('jwtPayload')?.id || null;
    const res = await getSpEvent(db, Number(id), userId);
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ data: res.data });
  })
  .get("/exists/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const isHidden = await getSpIsHidden(db, Number(id));
    if (isHidden && !authorizedOrg(c.get('jwtPayload')?.role)) {
      return c.json({ message: M.SPORTING_EVENT_NOT_FOUND }, 404);
    }
    const res = await getSpEventMin(db, Number(id));
    return c.json(res, res.status);
  })
  .get("/:id/paymentMethodsInfo", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const result = await getSpEventPaymentMethods(db, Number(id));
    if (!result) {
      return c.json({ message: M.SPORTING_EVENT_NOT_FOUND }, 404);
    }
    return c.json({ data: result });
  })
  .get("/:id/clothing", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const result = await getClothingStats(db, Number(id));
    return c.json({ data: result });
  })
  .post("/:id/addClothing", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { data }: { data: {
      size: string,
      purchased_quantity: number,
    }[] } = await c.req.json();
    const res = await addClothingToSpEvent(db, Number(id), data);
    return c.json({ message: res.message }, res.status);
  })
  .post("/:id/register", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { circuitId, userIds }
      : {circuitId: number, userIds: string[]} = await c.req.json();
    if (!circuitId) {
      return c.json({ message: M.SPORTING_EVENT_CIRCUIT_ID_REQUIRED }, 400);
    }
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return c.json({ message: M.SPORTING_EVENT_USER_ID_REQUIRED }, 400);
    }
    const reqUserId: string = c.get('jwtPayload')?.id;
    if (await userIsBanned(db, reqUserId)) {
      return c.json({ message: M.USER_BANNED }, 403);
    }
    const res = await registerToSpEvent(
      db,
      Number(id),
      reqUserId,
      authorizedOrg(c.get('jwtPayload').role),
      userIds,
      circuitId);
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: res.message, data: res.data });
  })
  .post("/:id/unregister", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { userIds }
      : {userIds: string[]} = await c.req.json();
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return c.json({ message: M.SPORTING_EVENT_USER_ID_REQUIRED }, 400);
    }
    const reqUserId: string = c.get('jwtPayload')?.id;
    const res = await deleteRegistrationToSpEvent(
      db,
      Number(id),
      reqUserId,
      authorizedOrg(c.get('jwtPayload').role),
      userIds);
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: res.message });
  })
  .get("/:id/registration", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const userId: string = c.get('jwtPayload').id;
    const res = await getUserRegistration(db, Number(id), userId);
    if (!res) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_NOT_FOUND }, 404);
    }
    return c.json({ data: res });
  })
  .get("/:id/paidRegistrations", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { partialUserId, bib } = c.req.query();
    const res = await getPaidRegistrations(db, Number(id), partialUserId, bib);
    return c.json({ data: res });
  })
  .post("/:id/registrations/applyDiscount", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { registrationIds, discount, reason }
      : { registrationIds: number[], discount: number, reason: string } = await c.req.json();
    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_IDS_REQUIRED }, 400);
    }
    if (typeof discount !== 'number' || discount < 0) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_DISCOUNT_INVALID }, 400);
    }
    const res = await applyDiscountToRegistrations(
      db,
      Number(id),
      registrationIds,
      discount,
      reason,
      c.get('jwtPayload').id
    );
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: res.message, data: res.data });
  })
  .post("/:id/registrations/dismissPending", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { registrationIds }
      : { registrationIds: number[] } = await c.req.json();
    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_IDS_REQUIRED }, 400);
    }
    const res = await dismissPendingAmountsRegistrations(
      db,
      Number(id),
      registrationIds,
      c.get('jwtPayload').id,
    );
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: res.message, data: res.data });
  })
  .post("/:id/registrations/cancel", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { registrationIds }
      : { registrationIds: number[] } = await c.req.json();
    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_IDS_REQUIRED }, 400);
    }
    const res = await cancelRegistrations(
      db,
      Number(id),
      registrationIds,
      c.get('jwtPayload').id,
    );
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: res.message, data: res.data });
  })
  .post("/:id/registrations/reactivate", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { registrationIds }
      : { registrationIds: number[] } = await c.req.json();
    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_IDS_REQUIRED }, 400);
    }
    const res = await reactivateRegistrations(
      db,
      Number(id),
      registrationIds,
      c.get('jwtPayload').id,
    );
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: res.message, data: res.data });
  })
  .post("/:id/registrations/transfer", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { fromRegistrationId, benefUserId }
      : { fromRegistrationId: number, benefUserId: string } = await c.req.json();
    if (!fromRegistrationId) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_ID_REQUIRED }, 400);
    }
    if (!benefUserId) {
      return c.json({ message: M.SPORTING_EVENT_BENEFICIARY_USER_ID_REQUIRED }, 400);
    }
    const r = await transferRegistration(
      db,
      Number(id),
      fromRegistrationId,
      benefUserId,
      c.get('jwtPayload').id,
    );
    if (r.status !== 200) {
      return c.json({ message: r.message }, r.status);
    }
    return c.json({ message: r.message });
  })
  .post("/:id/registrations/makeTeam", async (c) => {
    // Make team with another registered user in the same event
    const { reqId, destId } : { reqId: string, destId: string } = await c.req.json();
    const reqUserId = c.get('jwtPayload').id;
    if (reqId !== reqUserId && !authorizedAthMan(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    let managerId = null;
    if (reqId !== reqUserId && !authorizedOrg(c.get('jwtPayload').role)) {
      managerId = reqUserId;
      const evData = await getSpEventMin(db, Number(id));
      if (!evData || evData.status !== 200) {
        return c.json({ message: M.SPORTING_EVENT_NOT_FOUND }, 404);
      }
      const now = new Date();
      const evDate = new Date((evData.data as { date: string }).date);
      // if it is 15 days or less to the event,
      // athletes nor athlete managers cannot make/modify teams
      if (evDate.getTime() - now.getTime() <= 15 * 24 * 60 * 60 * 1000) {
        return c.json({ message: M.SPORTING_EVENT_REGISTRATION_EVENT_TEAMS_CANT_BE_MODIFIED }, 403);
      }
    }
    const res = await makeTeamSpEventRegistration(db, Number(id), reqId, destId, managerId);
    if (res.status !== 200) {
      return c.json({ message: res.message }, 400);
    }
    return c.json({ message: res.message });
  })
  .post("/:id/registrations/:regId/deliveredKit/:flag", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id, regId, flag } = c.req.param();
    const delivered = flag === 'true';
    await updateSpEventRegistrationKitDeliveredStatus(db, Number(id), Number(regId), delivered);
    return c.json({ message: M.SPORTING_EVENT_REGISTRATION_KIT_DELIVERY_STATUS_UPDATED_SUCCESSFULLY });
  })
  .post("/:id/registrations/assignAnotherClothingSize", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { registrationId, size } : { registrationId: number, size: string } = await c.req.json();
    if (!registrationId) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_ID_REQUIRED }, 400);
    }
    if (!size) {
      return c.json({ message: M.SPORTING_EVENT_CLOTHING_INVALID_DATA }, 400);
    }
    const res = await updateSpEventRegClothingReserved(db, Number(id), registrationId, size);
    if (!res) {
      return c.json({ message: M.SPORTING_EVENT_CLOTHING_UNAVAILABLE }, 400);
    }
    return c.json({ data: { clothingId: res } });
  })
  .get("/:id/allRegistrations", async (c) => {
    if (!authorizedAthMan(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    let managerId: string | undefined = undefined;
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      // athlete manager
      managerId = c.get('jwtPayload').id;
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const res = await getAllUsersRegistrations(db, Number(id), managerId);
    return c.json({ data: res });
  })
  .post("/:id/pay", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.get('jwtPayload').id;
    const { id } = c.req.param();
    const evPaymentMethodsInfo = await getSpEventPaymentMethods(db, Number(id));
    if (!evPaymentMethodsInfo) {
      return c.json({ message: M.SPORTING_EVENT_NOT_FOUND }, 404);
    }
    if (evPaymentMethodsInfo.mercadopago_enabled === 0) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_PAYMENT_METHOD_NOT_AVAILABLE }, 400);
    }
    const data = await getUserRegistrationWithEvent(db, Number(id), userId);
    if (!data || !data.registration) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_NOT_FOUND }, 403);
    }
    if (data.registration.status === 'paid') {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_ALREADY_PAID }, 400);
    }
    if ((data.payment?.pending_to_pay || 0) <= 0) {
      // update registration status to paid (this MUST NEVER happen)
      console.error(`Registration ${data.registration.id} for event `
        + `${id} has no pending amount to pay but is not marked `
        + `as paid. Marking as paid to avoid blocking the user.`);
      await setRegistrationAsPaid(db, data.registration.id, userId);
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_ALREADY_PAID }, 400);
    }
    // console.log("Using MercadoPago access token:", c.env.MERCADOPAGO_ACCESS_TOKEN);
    if (!c.env.MERCADOPAGO_ACCESS_TOKEN) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_PAYMENT_PROCESSING_ERROR }, 500);
    }
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.MERCADOPAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items: [
          {
            id: buildItemId(id, userId, data.registration.id),
            title: data.event.title,
            quantity: 1,
            unit_price: data.payment?.pending_to_pay || 0,
          }
        ],
        back_urls: {
          success: `${c.env.BASE_URL}/sportingEvents/${id}/registration`,
          failure: `${c.env.BASE_URL}/sportingEvents/${id}/registration`,
          pending: `${c.env.BASE_URL}/sportingEvents/${id}/registration`,
        },
        auto_return: "approved",
        // notification_url: `${c.env.BASE_URL}/api/webhook/mercadoPago/payment`,
      })
    });
    if (!response.ok) {
      console.error(`HTTP ${response.status}: ${await response.text()}`);
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_PAYMENT_PROCESSING_ERROR }, 500);
    }
    // console.log("MercadoPago preference creation response:", res);
    // console.log("MercadoPago preference creation error:", err);

    const res: {
      id: string | null,
      init_point: string | null,
    } = await response.json();
    return c.json({
      data: {
        init_point: res.init_point,
        preference_id: res.id,
      }
    });
  })
  .post("/:id/payMultipleRegs", async (c) => {
    if (!authorizedAthMan(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    let managerId: string | undefined = undefined;
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      // athlete manager
      managerId = c.get('jwtPayload').id;
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const evPaymentMethodsInfo = await getSpEventPaymentMethods(db, Number(id));
    if (!evPaymentMethodsInfo) {
      return c.json({ message: M.SPORTING_EVENT_NOT_FOUND }, 404);
    }
    if (evPaymentMethodsInfo.mercadopago_enabled === 0) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_PAYMENT_METHOD_NOT_AVAILABLE }, 400);
    }
    const { registrationIds } : { registrationIds: number[] } = await c.req.json();
    const data = await getAllUsersRegistrationsSafe(db, Number(id), managerId, registrationIds);
    if (!data || data.length !== registrationIds.length) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_NOT_FOUND }, 403);
    }
    const paid = data.filter(d => d.status === 'paid');
    if (paid.length > 0) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_ALREADY_PAID }, 400);
    }
    const notPending = data.filter(d => d.pending_to_pay <= 0);
    if (notPending.length > 0) {
      // update registration status to paid (this MUST NEVER happen)
      console.error(`Registrations '${notPending.map(d => d.id).join(', ')}' for event `
        + `${id} has no pending amount to pay but is not marked `
        + `as paid. Marking as paid to avoid blocking the user.`);
      await Promise.all(notPending.map(async (d) =>
        await setRegistrationAsPaid(db, d.id, c.get('jwtPayload').id)
      ));
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_ALREADY_PAID }, 400);
    }
    // console.log("Using MercadoPago access token:", c.env.MERCADOPAGO_ACCESS_TOKEN);
    if (!c.env.MERCADOPAGO_ACCESS_TOKEN) {
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_PAYMENT_PROCESSING_ERROR }, 500);
    }
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${c.env.MERCADOPAGO_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        items: data.map((d) =>
          ({
            id: buildItemId(id, d.user_id, d.id),
            title: d.user_full_name,
            quantity: 1,
            unit_price: d.pending_to_pay || 0,
          })
        ),
        back_urls: {
          success: `${c.env.BASE_URL}/sportingEvents/${id}/registerAthletes`,
          failure: `${c.env.BASE_URL}/sportingEvents/${id}/registerAthletes`,
          pending: `${c.env.BASE_URL}/sportingEvents/${id}/registerAthletes`,
        },
        auto_return: "approved",
        // notification_url: `${c.env.BASE_URL}/api/webhook/mercadoPago/payment`,
      })
    });
    if (!response.ok) {
      console.error(`HTTP ${response.status}: ${await response.text()}`);
      return c.json({ message: M.SPORTING_EVENT_REGISTRATION_PAYMENT_PROCESSING_ERROR }, 500);
    }
    // console.log("MercadoPago preference creation response:", res);
    // console.log("MercadoPago preference creation error:", err);

    const res: {
      id: string | null,
      init_point: string | null,
    } = await response.json();
    return c.json({
      data: {
        init_point: res.init_point,
        preference_id: res.id,
      }
    });
  })
  .get("/:id/gallery", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const res = await getSpEventGallery(db, Number(id));
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ data: res.data });
  })
  .post("/:id/updatePhoto", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const formData = await c.req.formData();
    if (!formData) {
      return c.json({ message: M.SPORTING_EVENT_PHOTO_REQUIRED }, 400);
    }
    if (!c.env.CLOUDFLARE_ACCOUNT_ID || !c.env.CLOUDFLARE_IMAGES_API_TOKEN) {
      return c.json({ message: M.SPORTING_EVENT_PHOTO_UPDATE_ERROR }, 500);
    }
    const userId: string = c.get('jwtPayload').id;
    const res = await updateSpEventPhoto(
      db,
      Number(id),
      formData,
      userId,
      c.env.CLOUDFLARE_ACCOUNT_ID,
      c.env.CLOUDFLARE_IMAGES_API_TOKEN,
    );
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: M.SPORTING_EVENT_PHOTO_UPDATED_SUCCESSFULLY });
  })
  .post("/:id/deletePhoto", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    if (!c.env.CLOUDFLARE_ACCOUNT_ID || !c.env.CLOUDFLARE_IMAGES_API_TOKEN) {
      return c.json({ message: M.SPORTING_EVENT_PHOTO_UPDATE_ERROR }, 500);
    }
    const userId: string = c.get('jwtPayload').id;
    const res = await deleteSpEventPhoto(
      db,
      Number(id),
      userId,
      c.env.CLOUDFLARE_ACCOUNT_ID,
      c.env.CLOUDFLARE_IMAGES_API_TOKEN,
    );
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: M.SPORTING_EVENT_PHOTO_DELETED_SUCCESSFULLY });
  })
  .post("/create", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const userId: string = c.get('jwtPayload').id;
    const db = drizzle(c.env.DB);
    const eventData = ARSportingEventSchema.omit({id: true}).safeParse(await c.req.json());
    if (!eventData.success) {
      return c.json({ message: M.SPORTING_EVENT_MISSING_REQUIRED_FIELDS }, 400);
    }
    const res = await addSpEvent(db, eventData.data, userId);
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({
      data: res.data,
      message: M.SPORTING_EVENT_CREATED_SUCCESSFULLY
    });
  })
  .post("/update/:id", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const userId: string = c.get('jwtPayload').id;
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const eventData = ARSportingEventSchema.safeParse(await c.req.json());
    if (!eventData.success) {
      return c.json({ message: M.SPORTING_EVENT_MISSING_REQUIRED_FIELDS }, 400);
    }
    const res = await updateSpEvent(db, Number(id), eventData.data, userId);
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: M.SPORTING_EVENT_UPDATED_SUCCESSFULLY });
  })
  .post("/delete/:id", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const res = await delSpEvent(db, Number(id));
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: M.SPORTING_EVENT_DELETED_SUCCESSFULLY });
  });
