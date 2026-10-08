import { beforeAll, describe, expect, it, vi } from "vitest";
import { registrationSchema } from "../src/validators/auth.validator.js";

const mocks = vi.hoisted(() => ({
  createProfileForAuthUser: vi.fn(),
  syncProfileFromAuthUser: vi.fn(),
  findProfileByAuthUserId: vi.fn(),
}));

vi.mock("../src/config/db.js", () => ({
  getDatabase: vi.fn(() => ({})),
  getMongoClient: vi.fn(() => ({})),
}));

vi.mock("../src/services/profile.service.js", () => ({
  createProfileForAuthUser: mocks.createProfileForAuthUser,
  syncProfileFromAuthUser: mocks.syncProfileFromAuthUser,
  findProfileByAuthUserId: mocks.findProfileByAuthUserId,
}));

let auth;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017";
  process.env.MONGODB_DB_NAME = "bloodDonationTest";
  process.env.BETTER_AUTH_SECRET = "test-secret-that-is-at-least-32-characters-long";
  process.env.BETTER_AUTH_URL = "http://localhost:5000";
  process.env.CLIENT_URL = "http://localhost:5173";
  ({ auth } = await import("../src/config/auth.js"));
});

describe("Better Auth configuration", () => {
  it("enables email/password and persistent sessions", () => {
    expect(auth.options.emailAndPassword).toMatchObject({
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      requireEmailVerification: false,
    });
    expect(auth.options.session).toMatchObject({
      expiresIn: 604800,
      updateAge: 86400,
    });
  });

  it("keeps role and status server-owned with safe defaults", () => {
    expect(auth.options.user.additionalFields.role).toMatchObject({
      defaultValue: "donor",
      input: false,
    });
    expect(auth.options.user.additionalFields.status).toMatchObject({
      defaultValue: "active",
      input: false,
    });
  });

  it("uses Better Auth's JWT plugin with explicit claims configuration", () => {
    const jwtPlugin = auth.options.plugins.find((plugin) => plugin.id === "jwt");
    expect(jwtPlugin).toBeDefined();
    expect(jwtPlugin.options.jwt).toMatchObject({
      issuer: "http://localhost:5000",
      audience: "http://localhost:5000",
      expirationTime: "15m",
    });
    expect(jwtPlugin.options.jwks.keyPairConfig).toEqual({
      alg: "EdDSA",
      crv: "Ed25519",
    });
  });

  it("creates the application profile from the verified Better Auth user hook", async () => {
    const authUser = {
      id: "auth-1",
      name: "Donor",
      email: "donor@example.com",
      bloodGroup: "A+",
      district: "Dhaka",
      upazila: "Savar",
    };
    await auth.options.databaseHooks.user.create.after(authUser, null);
    expect(mocks.createProfileForAuthUser).toHaveBeenCalledWith(authUser, null);
  });

  it("prevents blocked profiles from creating new login sessions", async () => {
    mocks.findProfileByAuthUserId.mockResolvedValue({ status: "blocked" });
    await expect(
      auth.options.databaseHooks.session.create.before({ userId: "auth-1" }, null),
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});

describe("registration validation", () => {
  const validRegistration = {
    name: "Test Donor",
    email: "donor@example.com",
    password: "password123",
    avatar: "https://example.com/avatar.png",
    bloodGroup: "AB-",
    district: "Dhaka",
    upazila: "Savar",
  };

  it("accepts all required donor registration fields", () => {
    expect(registrationSchema.safeParse(validRegistration).success).toBe(true);
  });

  it("rejects invalid blood groups and self-assigned roles", () => {
    expect(registrationSchema.safeParse({
      ...validRegistration,
      bloodGroup: "X+",
    }).success).toBe(false);
    expect(registrationSchema.safeParse({
      ...validRegistration,
      role: "admin",
    }).success).toBe(false);
    expect(registrationSchema.safeParse({
      ...validRegistration,
      isAdmin: true,
    }).success).toBe(false);
  });
});
