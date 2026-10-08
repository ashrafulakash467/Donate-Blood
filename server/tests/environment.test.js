import { afterEach, describe, expect, it, vi } from "vitest";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
  vi.resetModules();
});

const setBaseEnvironment = () => {
  process.env.PORT = "5000";
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/test";
  process.env.MONGODB_DB_NAME = "bloodDonationTest";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";
};

describe("environment security", () => {
  it("normalizes exact allowlisted origins", async () => {
    setBaseEnvironment();
    process.env.NODE_ENV = "test";
    process.env.BETTER_AUTH_URL = "http://localhost:5000/";
    process.env.CLIENT_URL = "http://localhost:5173/, https://preview.example.com/path";
    const { getAllowedOrigins, getEnvironment } = await import("../src/config/env.js");
    expect(getEnvironment().BETTER_AUTH_URL).toBe("http://localhost:5000");
    expect(getAllowedOrigins()).toEqual([
      "http://localhost:5173",
      "https://preview.example.com",
    ]);
  });

  it("requires HTTPS origins and Stripe secrets in production", async () => {
    setBaseEnvironment();
    process.env.NODE_ENV = "production";
    process.env.BETTER_AUTH_URL = "http://api.example.com";
    process.env.CLIENT_URL = "http://app.example.com";
    process.env.STRIPE_SECRET_KEY = "";
    process.env.STRIPE_WEBHOOK_SECRET = "";
    const { getEnvironment } = await import("../src/config/env.js");
    expect(() => getEnvironment()).toThrow(/BETTER_AUTH_URL must use HTTPS in production/);
    expect(() => getEnvironment()).toThrow(/STRIPE_SECRET_KEY is required in production/);
  });

  it("accepts complete HTTPS production configuration", async () => {
    setBaseEnvironment();
    process.env.NODE_ENV = "production";
    process.env.BETTER_AUTH_URL = "https://api.example.com";
    process.env.CLIENT_URL = "https://app.example.com";
    process.env.STRIPE_SECRET_KEY = "sk_test_example";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_example";
    const { getEnvironment } = await import("../src/config/env.js");
    expect(getEnvironment()).toMatchObject({
      NODE_ENV: "production",
      BETTER_AUTH_URL: "https://api.example.com",
      CLIENT_URL: "https://app.example.com",
    });
  });
});
