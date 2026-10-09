import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

let vercelApp;

beforeAll(async () => {
  process.env.PORT = "5000";
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017";
  process.env.MONGODB_DB_NAME = "bloodDonationTest";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";
  process.env.BETTER_AUTH_URL = "http://localhost:5000";
  process.env.CLIENT_URL = "http://localhost:5173";
  ({ default: vercelApp } = await import("../src/app.js"));
});

describe("Vercel Express entrypoint", () => {
  it("default-exports Express and serves nested API routes without a listener", async () => {
    expect(typeof vercelApp).toBe("function");

    const response = await request(vercelApp).get("/api/v1/health").expect(200);
    expect(response.body.data).toMatchObject({ status: "ok", environment: "test" });
  });
});
