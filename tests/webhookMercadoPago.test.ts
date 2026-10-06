import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { sportingEventTransactions } from "../src/worker/db/schema";
import {
  db,
  FEE,
  createEvent,
  createRegistration,
  getRegistration,
  getTransactions,
  mpPayment,
  notifyPayment,
} from "./fixtures";


// Payment responses served by the mocked MercadoPago API, keyed by payment id
let mpPayments: Record<string, ReturnType<typeof mpPayment>> = {};

beforeEach(() => {
  mpPayments = {};
  const realFetch = globalThis.fetch;
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = new Request(input, init).url;
    const match = url.match(/^https:\/\/api\.mercadopago\.com\/v1\/payments\/(.+)$/);
    if (!match) {
      return realFetch(input, init);
    }
    const payment = mpPayments[match[1]];
    if (!payment) {
      return new Response("not found", { status: 404 });
    }
    return Response.json(payment);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});


// Unique ids per test: storage is shared by all tests in this file
let seq = 0;
const nextId = (prefix: string) => `${prefix}${Date.now() % 1_000_000}${++seq}`;


const setup = async (athletes = 1) => {
  const { eventId, circuitId } = await createEvent();
  const regs = [];
  for (let i = 0; i < athletes; i++) {
    regs.push(await createRegistration(eventId, circuitId, nextId("2")));
  }
  return { eventId, regs };
}


describe("MercadoPago webhook: transactions by external payment id", () => {
  it("creates an inflow and a fee row tagged with mp-<paymentId>", async () => {
    const { eventId, regs: [reg] } = await setup();
    const paymentId = nextId("9");
    mpPayments[paymentId] = mpPayment("approved", [{ itemId: reg.itemId, amount: FEE }], 0.9);

    const res = await notifyPayment(paymentId);
    expect(res.status).toBe(200);

    const rows = await getTransactions(`mp-${paymentId}`);
    expect(rows).toHaveLength(2);
    const inflow = rows.find((r) => r.category === "registration_payment")!;
    const fee = rows.find((r) => r.category === "mercado_pago_fee")!;
    expect(inflow).toMatchObject({
      event_id: eventId,
      registration_id: reg.regId,
      user_id: reg.userId,
      transaction_type: "inflow",
      amount: FEE,
      payment_method: "mercado_pago_checkout_pro",
      status: "completed",
    });
    expect(fee).toMatchObject({
      registration_id: reg.regId,
      transaction_type: "outflow",
      payment_method: "mercado_pago_checkout_pro",
      status: "completed",
    });
    expect(fee.amount).toBeCloseTo(FEE * 0.1);

    const registration = await getRegistration(reg.regId);
    expect(registration?.status).toBe("paid");
    expect(registration?.bib_number).not.toBeNull();
  });

  it("updates the same rows when the same payment is notified again", async () => {
    const { regs: [reg] } = await setup();
    const paymentId = nextId("9");
    mpPayments[paymentId] = mpPayment("approved", [{ itemId: reg.itemId, amount: FEE }]);

    await notifyPayment(paymentId);
    const first = await getTransactions(`mp-${paymentId}`);
    // Make the update observable regardless of clock resolution
    await db.update(sportingEventTransactions)
      .set({ updated_at: "2000-01-01T00:00:00.000Z" })
      .where(eq(sportingEventTransactions.external_payment_id, `mp-${paymentId}`));

    await notifyPayment(paymentId);
    await notifyPayment(paymentId);
    const after = await getTransactions(`mp-${paymentId}`);

    expect(after).toHaveLength(2);
    expect(after.map((r) => r.id)).toEqual(first.map((r) => r.id));
    for (const [i, row] of after.entries()) {
      expect(row.created_at).toBe(first[i].created_at);
      expect(row.transaction_date).toBe(first[i].transaction_date);
      expect(row.updated_at).not.toBe("2000-01-01T00:00:00.000Z");
    }
  });

  it("updates amounts in place when MercadoPago reports new values", async () => {
    const { regs: [reg] } = await setup();
    const paymentId = nextId("9");
    mpPayments[paymentId] = mpPayment("approved", [{ itemId: reg.itemId, amount: FEE }], 0.9);
    await notifyPayment(paymentId);

    mpPayments[paymentId] = mpPayment("approved", [{ itemId: reg.itemId, amount: FEE }], 0.8);
    await notifyPayment(paymentId);

    const rows = await getTransactions(`mp-${paymentId}`);
    expect(rows).toHaveLength(2);
    const fee = rows.find((r) => r.category === "mercado_pago_fee")!;
    expect(fee.amount).toBeCloseTo(FEE * 0.2);
  });

  it("keeps one inflow and one fee row per registration in a bulk payment", async () => {
    const { regs } = await setup(2);
    const paymentId = nextId("9");
    mpPayments[paymentId] = mpPayment(
      "approved",
      regs.map((r) => ({ itemId: r.itemId, amount: FEE })),
    );

    await notifyPayment(paymentId);
    expect(await getTransactions(`mp-${paymentId}`)).toHaveLength(4);

    await notifyPayment(paymentId);
    const rows = await getTransactions(`mp-${paymentId}`);
    expect(rows).toHaveLength(4);
    for (const reg of regs) {
      const regRows = rows.filter((r) => r.registration_id === reg.regId);
      expect(regRows.map((r) => r.category).sort())
        .toEqual(["mercado_pago_fee", "registration_payment"]);
      expect((await getRegistration(reg.regId))?.status).toBe("paid");
    }
  });

  it("creates separate rows for different payment ids", async () => {
    const { regs: [reg] } = await setup();
    const paymentA = nextId("9");
    const paymentB = nextId("9");
    mpPayments[paymentA] = mpPayment("approved", [{ itemId: reg.itemId, amount: FEE }]);
    mpPayments[paymentB] = mpPayment("approved", [{ itemId: reg.itemId, amount: FEE }]);

    await notifyPayment(paymentA);
    await notifyPayment(paymentB);

    expect(await getTransactions(`mp-${paymentA}`)).toHaveLength(2);
    expect(await getTransactions(`mp-${paymentB}`)).toHaveLength(2);
  });

  it("never touches manual transactions of the same registration", async () => {
    const { eventId, regs: [reg] } = await setup();
    const manual = await db.insert(sportingEventTransactions).values({
      event_id: eventId,
      transaction_type: "inflow",
      category: "registration_payment",
      amount: 500,
      transaction_date: new Date("2029-01-01").toISOString(),
      user_id: reg.userId,
      registration_id: reg.regId,
      payment_method: "bank_transfer",
      status: "completed",
      updated_at: "2000-01-01T00:00:00.000Z",
    }).returning().get();
    const paymentId = nextId("9");
    mpPayments[paymentId] = mpPayment("approved", [{ itemId: reg.itemId, amount: FEE }]);

    await notifyPayment(paymentId);
    await notifyPayment(paymentId);

    const manualAfter = await db.select()
      .from(sportingEventTransactions)
      .where(eq(sportingEventTransactions.id, manual.id))
      .get();
    expect(manualAfter).toEqual(manual);
    expect(await getTransactions(`mp-${paymentId}`)).toHaveLength(2);
  });
});


// The webhook ignores MercadoPago's payment status for now (docs/12-known-issues.md).
// Unskip these when the status handling is implemented.
describe("MercadoPago webhook: payment status", () => {
  it.skip("records a pending payment without marking the registration paid", async () => {
    const { regs: [reg] } = await setup();
    const paymentId = nextId("9");
    mpPayments[paymentId] = mpPayment("pending", [{ itemId: reg.itemId, amount: FEE }]);

    await notifyPayment(paymentId);

    const rows = await getTransactions(`mp-${paymentId}`);
    const inflow = rows.find((r) => r.category === "registration_payment");
    expect(inflow?.status).toBe("pending");
    const registration = await getRegistration(reg.regId);
    expect(registration?.status).toBe("pending");
    expect(registration?.paid_amount).toBe(0);
    expect(registration?.bib_number).toBeNull();
  });

  it.skip("completes the same rows when a pending payment is approved", async () => {
    const { regs: [reg] } = await setup();
    const paymentId = nextId("9");
    mpPayments[paymentId] = mpPayment("pending", [{ itemId: reg.itemId, amount: FEE }]);
    await notifyPayment(paymentId);
    const pendingRows = await getTransactions(`mp-${paymentId}`);

    mpPayments[paymentId] = mpPayment("approved", [{ itemId: reg.itemId, amount: FEE }]);
    await notifyPayment(paymentId);

    const rows = await getTransactions(`mp-${paymentId}`);
    expect(rows.map((r) => r.id)).toEqual(pendingRows.map((r) => r.id));
    expect(rows.every((r) => r.status === "completed")).toBe(true);
    const registration = await getRegistration(reg.regId);
    expect(registration?.status).toBe("paid");
    expect(registration?.bib_number).not.toBeNull();
  });

  it.skip("marks a rejected payment as failed and leaves the registration unpaid", async () => {
    const { regs: [reg] } = await setup();
    const paymentId = nextId("9");
    mpPayments[paymentId] = mpPayment("rejected", [{ itemId: reg.itemId, amount: FEE }]);

    await notifyPayment(paymentId);

    const rows = await getTransactions(`mp-${paymentId}`);
    const inflow = rows.find((r) => r.category === "registration_payment");
    expect(inflow?.status).toBe("failed");
    expect((await getRegistration(reg.regId))?.status).toBe("pending");
  });

  it.skip("cancels the rows and unpays the registration when an approved payment is refunded", async () => {
    const { regs: [reg] } = await setup();
    const paymentId = nextId("9");
    mpPayments[paymentId] = mpPayment("approved", [{ itemId: reg.itemId, amount: FEE }]);
    await notifyPayment(paymentId);

    mpPayments[paymentId] = mpPayment("refunded", [{ itemId: reg.itemId, amount: FEE }]);
    await notifyPayment(paymentId);

    const rows = await getTransactions(`mp-${paymentId}`);
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.status === "cancelled")).toBe(true);
    const registration = await getRegistration(reg.regId);
    expect(registration?.status).toBe("pending");
    expect(registration?.paid_amount).toBe(0);
  });
});
