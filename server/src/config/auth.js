import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { jwt } from "better-auth/plugins";
import {
  BLOOD_GROUPS,
  JWT_EXPIRATION,
  SESSION_EXPIRES_IN_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
  USER_ROLES,
  USER_STATUSES,
} from "../constants/auth.js";
import {
  createProfileForAuthUser,
  findProfileByAuthUserId,
  syncProfileFromAuthUser,
} from "../services/profile.service.js";
import { registrationSchema } from "../validators/auth.validator.js";
import { getDatabase, getMongoClient } from "./db.js";
import { getAllowedOrigins, getEnvironment } from "./env.js";

const environment = getEnvironment();

export const auth = betterAuth({
  appName: "Blood Donation Management System",
  baseURL: environment.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: environment.BETTER_AUTH_SECRET,
  trustedOrigins: getAllowedOrigins(),
  database: mongodbAdapter(getDatabase(), { client: getMongoClient() }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: SESSION_EXPIRES_IN_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },
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
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            name: user.name.trim(),
            email: user.email.trim().toLowerCase(),
            district: user.district.trim(),
            upazila: user.upazila.trim(),
            role: USER_ROLES.DONOR,
            status: USER_STATUSES.ACTIVE,
          },
        }),
        after: createProfileForAuthUser,
      },
      update: {
        after: syncProfileFromAuthUser,
      },
    },
    session: {
      create: {
        before: async (session) => {
          const profile = await findProfileByAuthUserId(session.userId);
          if (profile?.status === USER_STATUSES.BLOCKED) {
            throw new APIError("FORBIDDEN", {
              message: "This user account is blocked",
            });
          }
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (context.path !== "/sign-up/email") return;

      const result = registrationSchema.safeParse(context.body);
      if (!result.success) {
        throw new APIError("BAD_REQUEST", {
          message: result.error.issues[0]?.message ?? "Invalid registration data",
        });
      }
    }),
  },
  advanced: {
    useSecureCookies: environment.NODE_ENV === "production",
    defaultCookieAttributes: {
      httpOnly: true,
      secure: environment.NODE_ENV === "production",
      sameSite: environment.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    },
  },
  plugins: [
    jwt({
      jwks: {
        keyPairConfig: { alg: "EdDSA", crv: "Ed25519" },
        rotationInterval: 60 * 60 * 24 * 30,
        gracePeriod: 60 * 60 * 24 * 30,
      },
      jwt: {
        issuer: environment.BETTER_AUTH_URL,
        audience: environment.BETTER_AUTH_URL,
        expirationTime: JWT_EXPIRATION,
        definePayload: ({ user }) => ({
          email: user.email,
          name: user.name,
        }),
      },
    }),
  ],
});
