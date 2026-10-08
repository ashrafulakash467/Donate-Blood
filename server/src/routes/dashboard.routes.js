import { Router } from "express";
import { USER_ROLES } from "../constants/auth.js";
import { getStats, getTrends } from "../controllers/dashboard.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { verifyActiveUser } from "../middleware/verifyActiveUser.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { verifyRole } from "../middleware/verifyRole.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { donationTrendQuerySchema } from "../validators/dashboard.validator.js";

const dashboardRouter = Router();
dashboardRouter.use(
  verifyAuth,
  verifyActiveUser,
  verifyRole(USER_ROLES.ADMIN, USER_ROLES.VOLUNTEER),
);
dashboardRouter.get("/stats", asyncHandler(getStats));
dashboardRouter.get(
  "/donation-trends",
  validateRequest({ query: donationTrendQuerySchema }),
  asyncHandler(getTrends),
);

export default dashboardRouter;
