import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyJWT: vi.fn(),
  findProfileByAuthUserId: vi.fn(),
  createFundingCheckout: vi.fn(),
  listCompletedFundings: vi.fn(),
  processFundingWebhookEvent: vi.fn(),
  constructEvent: vi.fn(),
}));
vi.mock("../src/config/auth.js", () => ({ auth: { api: { verifyJWT: mocks.verifyJWT } } }));
vi.mock("../src/services/profile.service.js", () => ({
  findProfileByAuthUserId: mocks.findProfileByAuthUserId,
}));
vi.mock("../src/services/funding.service.js", () => ({
  createFundingCheckout: mocks.createFundingCheckout,
  listCompletedFundings: mocks.listCompletedFundings,
  processFundingWebhookEvent: mocks.processFundingWebhookEvent,
}));
vi.mock("../src/config/stripe.js", () => ({
  getStripe: () => ({ webhooks: { constructEvent: mocks.constructEvent } }),
  getStripeWebhookSecret: () => "whsec_test",
}));

import fundingRouter from "../src/routes/funding.routes.js";
import fundingWebhookRouter from "../src/routes/funding-webhook.routes.js";
import { errorHandler } from "../src/middleware/errorHandler.js";

const app = express();
app.use("/api/v1/fundings/webhook", fundingWebhookRouter);
app.use(express.json());
app.use("/api/v1/fundings", fundingRouter);
app.use(errorHandler);

const tokenHeader = { Authorization: "Bearer valid.jwt.token" };
const profile = {
  authUserId: "auth-1",
  name: "Funding User",
  email: "funding@example.com",
  status: "active",
  role: "donor",
};
const event = {
  type: "checkout.session.completed",
  data: { object: { id: "cs_test_1", payment_status: "paid" } },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyJWT.mockResolvedValue({ payload: { sub: "auth-1" } });
  mocks.findProfileByAuthUserId.mockResolvedValue(profile);
  mocks.createFundingCheckout.mockResolvedValue({ checkoutUrl: "https://checkout.stripe.com/test" });
  mocks.listCompletedFundings.mockResolvedValue({ items: [], pagination: {} });
  mocks.constructEvent.mockReturnValue(event);
  mocks.processFundingWebhookEvent.mockResolvedValue({ processed: true, recorded: true });
});

describe("funding APIs", () => {
  it("creates Checkout for an authenticated active user", async () => {
    const response = await request(app)
      .post("/api/v1/fundings/checkout")
      .set(tokenHeader)
      .send({ amount: 150 })
      .expect(201);
    expect(mocks.createFundingCheckout).toHaveBeenCalledWith(150, profile);
    expect(response.body.data.checkoutUrl).toContain("checkout.stripe.com");
  });

  it("rejects invalid amounts", async () => {
    await request(app)
      .post("/api/v1/fundings/checkout")
      .set(tokenHeader)
      .send({ amount: 50 })
      .expect(400);
    expect(mocks.createFundingCheckout).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated checkout", async () => {
    await request(app).post("/api/v1/fundings/checkout").send({ amount: 150 }).expect(401);
  });

  it("returns completed funding history with pagination", async () => {
    await request(app).get("/api/v1/fundings?page=2&limit=5").expect(200);
    expect(mocks.listCompletedFundings).toHaveBeenCalledWith({ page: 2, limit: 5 });
  });
});

describe("Stripe webhook", () => {
  it("rejects an invalid signature", async () => {
    mocks.constructEvent.mockImplementation(() => { throw new Error("bad signature"); });
    const response = await request(app)
      .post("/api/v1/fundings/webhook")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", "invalid")
      .send(JSON.stringify(event))
      .expect(400);
    expect(response.body.message).toBe("Invalid Stripe webhook signature");
    expect(mocks.processFundingWebhookEvent).not.toHaveBeenCalled();
  });

  it("passes the untouched raw body from a valid signed event", async () => {
    await request(app)
      .post("/api/v1/fundings/webhook")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", "valid")
      .send(JSON.stringify(event))
      .expect(200);
    expect(Buffer.isBuffer(mocks.constructEvent.mock.calls[0][0])).toBe(true);
    expect(mocks.constructEvent).toHaveBeenCalledWith(expect.any(Buffer), "valid", "whsec_test");
    expect(mocks.processFundingWebhookEvent).toHaveBeenCalledWith(event);
  });
});
