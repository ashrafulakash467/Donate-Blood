import "dotenv/config";
import { z } from "zod";

const httpUrl = z.url().refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
  message: "URL must use HTTP or HTTPS",
});

const environmentSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DB_NAME: z.string().min(1).default("bloodDonationDB"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: httpUrl.transform((value) => new URL(value).origin),
  CLIENT_URL: z.string().min(1, "CLIENT_URL is required").refine(
    (value) => value.split(",").every((origin) => {
      if (!URL.canParse(origin.trim())) return false;
      return ["http:", "https:"].includes(new URL(origin.trim()).protocol);
    }),
    "CLIENT_URL must contain valid comma-separated origins",
  ),
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
}).superRefine((environment, context) => {
  if (environment.NODE_ENV !== "production") return;

  if (new URL(environment.BETTER_AUTH_URL).protocol !== "https:") {
    context.addIssue({
      code: "custom",
      path: ["BETTER_AUTH_URL"],
      message: "BETTER_AUTH_URL must use HTTPS in production",
    });
  }
  for (const origin of environment.CLIENT_URL.split(",")) {
    if (new URL(origin.trim()).protocol !== "https:") {
      context.addIssue({
        code: "custom",
        path: ["CLIENT_URL"],
        message: "CLIENT_URL origins must use HTTPS in production",
      });
      break;
    }
  }
  if (!environment.STRIPE_SECRET_KEY) {
    context.addIssue({
      code: "custom",
      path: ["STRIPE_SECRET_KEY"],
      message: "STRIPE_SECRET_KEY is required in production",
    });
  }
  if (!environment.STRIPE_WEBHOOK_SECRET) {
    context.addIssue({
      code: "custom",
      path: ["STRIPE_WEBHOOK_SECRET"],
      message: "STRIPE_WEBHOOK_SECRET is required in production",
    });
  }
});

let cachedEnvironment;

export const getEnvironment = () => {
  if (cachedEnvironment) return cachedEnvironment;

  const result = environmentSchema.safeParse(process.env);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  cachedEnvironment = result.data;
  return cachedEnvironment;
};

export const getAllowedOrigins = () =>
  getEnvironment().CLIENT_URL.split(",")
    .map((origin) => new URL(origin.trim()).origin)
    .filter(Boolean);
