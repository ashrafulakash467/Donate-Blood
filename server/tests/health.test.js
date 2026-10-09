import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

let app;
let vercelApp;

beforeAll(async () => {
  process.env.PORT = "5000";
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017";
  process.env.MONGODB_DB_NAME = "bloodDonationTest";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";
  process.env.BETTER_AUTH_URL = "http://localhost:5000";
  process.env.CLIENT_URL = "http://localhost:5173";
  ({ default: app } = await import("../src/app.js"));
  ({ default: vercelApp } = await import("../index.js"));
});

describe("GET /api/v1/health", () => {
  it("returns the standardized health response", async () => {
    const response = await request(app).get("/api/v1/health").expect(200);
    expect(response.body).toEqual({
      success: true,
      message: "Service is healthy",
      data: { status: "ok", environment: "test" },
    });
  });
});

describe("GET /", () => {
  it("returns public API information", async () => {
    const response = await request(app).get("/").expect(200);
    expect(response.body).toEqual({
      success: true,
      message: "LifeFlow Blood Donation API is running",
      healthCheck: "/api/v1/health",
    });
  });
});

describe("Vercel Express entrypoint", () => {
  it("exports the same app and preserves nested API routes", async () => {
    expect(vercelApp).toBe(app);
    const response = await request(vercelApp).get("/api/v1/health").expect(200);
    expect(response.body.data).toMatchObject({ status: "ok", environment: "test" });
  });
});

describe("GET /api/auth/ok", () => {
  it("is handled by Better Auth under the required base path", async () => {
    const response = await request(app).get("/api/auth/ok").expect(200);
    expect(response.body).toEqual({ ok: true });
  });
});

describe("unknown routes", () => {
  it("returns a standardized 404 response", async () => {
    const response = await request(app).get("/api/v1/missing").expect(404);
    expect(response.body).toEqual({
      success: false,
      message: "Route not found: GET /api/v1/missing",
      errors: [],
    });
  });
});

describe("request middleware", () => {
  it("sets security headers and supports credentialed allowlisted preflight", async () => {
    const response = await request(app)
      .options("/api/v1/users/me")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "GET")
      .expect(204);

    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("rejects disallowed browser origins with the standard error shape", async () => {
    const response = await request(app)
      .get("/api/v1/health")
      .set("Origin", "https://not-allowed.example")
      .expect(403);

    expect(response.body).toEqual({
      success: false,
      message: "Origin is not allowed by CORS",
      errors: [],
    });
  });

  it("reports malformed JSON as a client error", async () => {
    const response = await request(app)
      .post("/api/v1/missing")
      .set("Content-Type", "application/json")
      .send('{"invalid"')
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid JSON body",
      errors: [],
    });
  });
});
