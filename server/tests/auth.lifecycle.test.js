import { beforeAll, describe, expect, it } from "vitest";
import { getTestInstance } from "better-auth/test";
import { jwt } from "better-auth/plugins";
import { BLOOD_GROUPS, USER_ROLES, USER_STATUSES } from "../src/constants/auth.js";

let instance;
let sessionHeaders;
const testUser = {
  name: "Lifecycle Donor",
  email: "lifecycle@example.com",
  password: "secure-password-123",
  avatar: "",
  bloodGroup: "O+",
  district: "Dhaka",
  upazila: "Savar",
};

beforeAll(async () => {
  instance = await getTestInstance({
    basePath: "/api/auth",
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      requireEmailVerification: false,
    },
    session: { expiresIn: 604800, updateAge: 86400 },
    user: {
      additionalFields: {
        avatar: { type: "string", required: false, defaultValue: "", input: true },
        bloodGroup: { type: BLOOD_GROUPS, required: true, input: true },
        district: { type: "string", required: true, input: true },
        upazila: { type: "string", required: true, input: true },
        role: {
          type: Object.values(USER_ROLES),
          required: false,
          defaultValue: USER_ROLES.DONOR,
          input: false,
        },
        status: {
          type: Object.values(USER_STATUSES),
          required: false,
          defaultValue: USER_STATUSES.ACTIVE,
          input: false,
        },
      },
    },
    plugins: [jwt({
      jwt: {
        issuer: "http://localhost:3000",
        audience: "http://localhost:3000",
        expirationTime: "15m",
      },
    })],
  }, { disableTestUser: true });
});

describe("Better Auth lifecycle", () => {
  it("registers with active donor defaults and creates a persistent session", async () => {
    sessionHeaders = new Headers();
    const result = await instance.client.signUp.email({
      ...testUser,
      fetchOptions: { onSuccess: instance.sessionSetter(sessionHeaders) },
    });

    expect(result.error).toBeNull();
    expect(result.data.user).toMatchObject({
      email: testUser.email,
      role: "donor",
      status: "active",
    });
    const session = await instance.auth.api.getSession({ headers: sessionHeaders });
    expect(session?.user.email).toBe(testUser.email);
  });

  it("issues and cryptographically verifies a JWT for the session", async () => {
    const tokenResponse = await instance.customFetchImpl(
      "http://localhost:3000/api/auth/token",
      { headers: sessionHeaders },
    );
    expect(tokenResponse.status).toBe(200);
    const { token } = await tokenResponse.json();
    const verification = await instance.auth.api.verifyJWT({ body: { token } });
    expect(verification.payload).toMatchObject({ sub: expect.any(String) });
  });

  it("logs out, rejects the old session, and supports a new login", async () => {
    await instance.auth.api.signOut({ headers: sessionHeaders });
    await expect(instance.auth.api.getSession({ headers: sessionHeaders })).resolves.toBeNull();

    const login = await instance.signInWithUser(testUser.email, testUser.password);
    expect(login.res.user.email).toBe(testUser.email);
    const session = await instance.auth.api.getSession({ headers: login.headers });
    expect(session?.user.email).toBe(testUser.email);
  });
});
