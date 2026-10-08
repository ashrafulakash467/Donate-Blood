import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";
import { getAllowedOrigins } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import fundingWebhookRouter from "./routes/funding-webhook.routes.js";
import apiRouter from "./routes/index.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();
const allowedOrigins = getAllowedOrigins();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new ApiError(403, "Origin is not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_request, response) => response.status(429).json({
    success: false,
    message: "Too many requests. Please try again later.",
    errors: [],
  }),
}));

// Better Auth must receive the untouched request body.
app.all("/api/auth/*splat", toNodeHandler(auth));

// Stripe signature verification requires the untouched request bytes.
app.use("/api/v1/fundings/webhook", fundingWebhookRouter);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/api/v1", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
