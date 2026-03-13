import { Hono } from "hono";
import { Env, Variables } from "./index";
import { drizzle } from 'drizzle-orm/d1';
import {
  authorizedAthMan,
  authorizedOrg
} from '@shared/roles';
import {
  getSpEvent,
  addSpEvent,
  updateSpEvent,
  delSpEvent,
  getSpEventMin,
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
} from "./lib/sportingEventRegistrationActions";
import {
  mainSportingEventsList,
  allSportingEventsList,
  getUserRegisteredSpEvents,
} from "./lib/sportingEventList";
import {
  getUserRegistration,
  getPaidRegistrations,
  updateSpEventRegistrationKitDeliveredStatus,
  getManagedUsersRegistrations,
  getAllUsersRegistrations,
  getUserRegistrationWithEvent,
} from "./lib/sportingEventRegistrations";
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
    const res = await allSportingEventsList(db);
    return c.json({ data: res });
  })
  .get("/myEvents", async (c) => {
    const db = drizzle(c.env.DB);
    const userId: string = c.get('jwtPayload').id;
    const res = await getUserRegisteredSpEvents(db, userId);
    return c.json({ data: res });
  })
  .get("/:id", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
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
    const res = await getSpEventMin(db, Number(id));
    return c.json(res, res.status);
  })
  .post("/:id/register", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { circuitId, userId }
      : {circuitId: number, userId: string} = await c.req.json();
    if (!circuitId) {
      return c.json({ message: M.SPORTING_EVENT_CIRCUIT_ID_REQUIRED }, 400);
    }
    if (!userId) {
      return c.json({ message: M.SPORTING_EVENT_USER_ID_REQUIRED }, 400);
    }
    const reqUserId: string = c.get('jwtPayload')?.id;
    const res = await registerToSpEvent(
      db,
      Number(id),
      reqUserId,
      userId,
      circuitId);
    if (res.status !== 200) {
      return c.json({ message: res.message }, res.status);
    }
    return c.json({ message: res.message, data: res.data });
  })
  .post("/:id/unregister", async (c) => {
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const { userId }
      : {userId: string} = await c.req.json();
    if (!userId) {
      return c.json({ message: M.SPORTING_EVENT_USER_ID_REQUIRED }, 400);
    }
    const reqUserId: string = c.get('jwtPayload')?.id;
    const res = await deleteRegistrationToSpEvent(
      db,
      Number(id),
      reqUserId,
      userId);
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
    const { registrationIds, discount }
      : {registrationIds: number[], discount: number} = await c.req.json();
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
  .get("/:id/allRegistrations", async (c) => {
    if (!authorizedOrg(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const res = await getAllUsersRegistrations(db, Number(id));
    return c.json({ data: res });
  })
  .get("/:id/managedRegistrations", async (c) => {
    if (!authorizedAthMan(c.get('jwtPayload').role)) {
      return c.json({ message: M.UNAUTHORIZED }, 403);
    }
    const db = drizzle(c.env.DB);
    const { id } = c.req.param();
    const userId: string = c.get('jwtPayload').id;
    const res = await getManagedUsersRegistrations(db, Number(id), userId);
    return c.json({ data: res });
  })
  .post("/:id/pay", async (c) => {
    const db = drizzle(c.env.DB);
    const userId = c.get('jwtPayload').id;
    const { id } = c.req.param();
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
