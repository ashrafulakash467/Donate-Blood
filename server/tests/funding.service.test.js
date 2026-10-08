import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCollection: vi.fn(),
  initializeIndexes: vi.fn(),
  sessionCreate: vi.fn(),
}));
vi.mock("../src/config/db.js", () => ({ getCollection: mocks.getCollection }));
vi.mock("../src/config/indexes.js", () => ({ initializeIndexes: mocks.initializeIndexes }));
vi.mock("../src/config/env.js", () => ({ getAllowedOrigins: () => ["http://localhost:5173"] }));
vi.mock("../src/config/stripe.js", () => ({
  getStripe: () => ({ checkout: { sessions: { create: mocks.sessionCreate } } }),
}));

import {
  createFundingCheckout,
  listCompletedFundings,
  processFundingWebhookEvent,
  recordPaidFunding,
} from "../src/services/funding.service.js";

const profile = {
  authUserId: "auth-1",
  name: "Funding User",
  email: "funding@example.com",
};
const paidSession = {
  id: "cs_test_paid",
  payment_status: "paid",
  amount_total: 15000,
  currency: "bdt",
  payment_intent: "pi_test_1",
  metadata: {
    purpose: "blood-donation-funding",
    authUserId: "auth-1",
    userName: "Funding User",
    userEmail: "funding@example.com",
  },
};

let collection;
const makeCursor = (items) => {
  const cursor = { sort: vi.fn(), skip: vi.fn(), limit: vi.fn(), toArray: vi.fn().mockResolvedValue(items) };
  cursor.sort.mockReturnValue(cursor);
  cursor.skip.mockReturnValue(cursor);
  cursor.limit.mockReturnValue(cursor);
  return cursor;
};

beforeEach(() => {
  vi.clearAllMocks();
  collection = {
    updateOne: vi.fn().mockResolvedValue({ upsertedCount: 1 }),
    find: vi.fn(() => makeCursor([])),
    countDocuments: vi.fn().mockResolvedValue(0),
  };
  mocks.getCollection.mockResolvedValue(collection);
  mocks.initializeIndexes.mockResolvedValue(undefined);
  mocks.sessionCreate.mockResolvedValue({ id: "cs_test_1", url: "https://checkout.stripe.com/test" });
});

describe("Stripe funding service", () => {
  it("creates a BDT Checkout Session using minor units and stored identity", async () => {
    await expect(createFundingCheckout(100.25, profile)).resolves.toEqual({
      checkoutUrl: "https://checkout.stripe.com/test",
      sessionId: "cs_test_1",
    });
    expect(mocks.sessionCreate).toHaveBeenCalledWith(expect.objectContaining({
      mode: "payment",
      client_reference_id: "auth-1",
      customer_email: "funding@example.com",
      line_items: [expect.objectContaining({
        price_data: expect.objectContaining({ currency: "bdt", unit_amount: 10025 }),
      })],
      metadata: expect.objectContaining({ purpose: "blood-donation-funding", authUserId: "auth-1" }),
    }));
  });

  it("stores a valid paid Checkout event with an idempotent upsert", async () => {
    const result = await recordPaidFunding(paidSession, 1_700_000_000);
    expect(result).toEqual({ recorded: true, duplicate: false });
    expect(collection.updateOne).toHaveBeenCalledWith(
      { stripeSessionId: "cs_test_paid" },
      { $setOnInsert: expect.objectContaining({
        amountMinor: 15000,
        paymentStatus: "paid",
        stripePaymentIntentId: "pi_test_1",
      }) },
      { upsert: true },
    );
  });

  it("treats webhook retries as duplicates", async () => {
    collection.updateOne.mockResolvedValue({ upsertedCount: 0 });
    await expect(recordPaidFunding(paidSession, 1_700_000_000)).resolves.toEqual({
      recorded: false,
      duplicate: true,
    });
  });

  it("never records unpaid or unrelated Checkout Sessions", async () => {
    await expect(recordPaidFunding({ ...paidSession, payment_status: "unpaid" })).resolves.toEqual({
      recorded: false,
      reason: "ignored",
    });
    await processFundingWebhookEvent({ type: "checkout.session.expired", data: { object: paidSession } });
    expect(collection.updateOne).not.toHaveBeenCalled();
  });

  it("lists paid funding only with pagination and display amounts", async () => {
    const cursor = makeCursor([{ userName: "Funding User", amountMinor: 15000, currency: "bdt" }]);
    collection.find.mockReturnValue(cursor);
    collection.countDocuments.mockResolvedValue(1);
    const result = await listCompletedFundings({ page: 2, limit: 5 });
    expect(collection.find).toHaveBeenCalledWith(
      { paymentStatus: "paid" },
      expect.any(Object),
    );
    expect(cursor.skip).toHaveBeenCalledWith(5);
    expect(result.items[0].amount).toBe(150);
    expect(result.pagination).toEqual({ page: 2, limit: 5, total: 1, totalPages: 1 });
  });
});
