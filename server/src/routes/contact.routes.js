import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createContact } from "../controllers/contact.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createContactSchema } from "../validators/contact.validator.js";

const contactRouter = Router();
const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_request, response) => response.status(429).json({
    success: false,
    message: "Too many contact messages. Please try again later.",
    errors: [],
  }),
});

contactRouter.post(
  "/",
  contactRateLimit,
  validateRequest({ body: createContactSchema }),
  asyncHandler(createContact),
);

export default contactRouter;
