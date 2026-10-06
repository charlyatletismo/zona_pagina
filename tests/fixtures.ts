import { env } from "cloudflare:workers";
import { createExecutionContext } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import {
  locations,
  users,
  sportingEvents,
  sportingEventCircuits,
  sportingEventRegistrations,
  sportingEventTransactions,
} from "../src/worker/db/schema";
import { buildItemId } from "../src/worker/lib/utilsPayment";
import worker from "../src/worker/index";


export const db = drizzle(env.DB);

export const LOCATION_ID = "Villa Constitución, Santa Fe, Argentina";
export const ORGANIZER_ID = "11111111";
export const FEE = 10000;


export const createEvent = async () => {
  await db.insert(locations).values({
    id: LOCATION_ID,
    locality: "Villa Constitución",
    province: "Santa Fe",
    country: "Argentina",
  }).onConflictDoNothing();
  await db.insert(users).values({
    id: ORGANIZER_ID,
    name: "Org",
    surname: "Anizer",
    role: "organizer",
  }).onConflictDoNothing();
  const event = await db.insert(sportingEvents).values({
    title: "Test race",
    date: new Date("2030-01-01").toISOString(),
    event_type: "marathon",
    mercadopago_enabled: 1,
    fee_amount: FEE,
    created_by: ORGANIZER_ID,
    updated_by: ORGANIZER_ID,
  }).returning({ id: sportingEvents.id }).get();
  // Non-competitive, so paying assigns a bib but no chip
  const circuit = await db.insert(sportingEventCircuits).values({
    event_id: event.id,
    name: "10K",
    distance_km: 10,
    competitive: 0,
    bib_number_start: 100,
    bib_number_end: 200,
  }).returning({ id: sportingEventCircuits.id }).get();
  return { eventId: event.id, circuitId: circuit.id };
}


export const createRegistration = async (
  eventId: number,
  circuitId: number,
  userId: string,
) => {
  await db.insert(users).values({
    id: userId,
    name: "Athlete",
    surname: userId,
    role: "athlete",
  });
  const reg = await db.insert(sportingEventRegistrations).values({
    user_id: userId,
    event_id: eventId,
    circuit_id: circuitId,
    age_at_event_date: 30,
  }).returning({ id: sportingEventRegistrations.id }).get();
  return { regId: reg.id, userId, itemId: buildItemId(eventId, userId, reg.id) };
}


export const getRegistration = (regId: number) => db
  .select()
  .from(sportingEventRegistrations)
  .where(eq(sportingEventRegistrations.id, regId))
  .get();


export const getTransactions = (externalPaymentId: string) => db
  .select()
  .from(sportingEventTransactions)
  .where(eq(sportingEventTransactions.external_payment_id, externalPaymentId))
  .orderBy(sportingEventTransactions.id)
  .all();


export type MPItem = { itemId: string, amount: number };

// Builds the subset of GET /v1/payments/:id that the webhook reads
export const mpPayment = (
  status: string,
  items: MPItem[],
  netReceivedRatio = 0.9,
) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return {
    status,
    additional_info: {
      items: items.map((item) => ({
        id: item.itemId,
        quantity: 1,
        title: "Inscripción",
        unit_price: String(item.amount),
      })),
    },
    transaction_details: {
      installment_amount: total,
      net_received_amount: total * netReceivedRatio,
      overpaid_amount: 0,
      total_paid_amount: total,
    },
  };
}


const hmacHex = async (secret: string, message: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}


// Sends a notification the way MercadoPago does, with a valid x-signature
export const notifyPayment = async (paymentId: string) => {
  const requestId = crypto.randomUUID();
  const ts = Date.now().toString();
  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
  const v1 = await hmacHex(env.MERCADOPAGO_SECRET_KEY, manifest);
  const request = new Request(
    `https://example.com/api/webhook/mercadoPago/payment?data.id=${paymentId}&type=payment`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-signature": `ts=${ts},v1=${v1}`,
        "x-request-id": requestId,
      },
      body: JSON.stringify({ type: "payment", data: { id: paymentId } }),
    },
  );
  return worker.fetch(request, env, createExecutionContext());
}
