import { Router } from "express";
import { createCheckout, getFundings } from "../controllers/funding.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { verifyActiveUser } from "../middleware/verifyActiveUser.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { checkoutFundingSchema, fundingQuerySchema } from "../validators/funding.validator.js";

const fundingRouter = Router();
fundingRouter.get(
  "/",
  validateRequest({ query: fundingQuerySchema }),
  asyncHandler(getFundings),
);
fundingRouter.post(
  "/checkout",
  verifyAuth,
  verifyActiveUser,
  validateRequest({ body: checkoutFundingSchema }),
  asyncHandler(createCheckout),
);

export default fundingRouter;
