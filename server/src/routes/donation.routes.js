import { Router } from "express";
import { USER_ROLES } from "../constants/auth.js";
import {
  cancelAssignment,
  confirmDonation,
  createDonation,
  getDonation,
  getManagedDonations,
  getMyDonations,
  getPublicDonations,
  patchDonation,
  patchDonationStatus,
  removeDonation,
} from "../controllers/donation.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { verifyActiveUser } from "../middleware/verifyActiveUser.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { verifyRole } from "../middleware/verifyRole.js";
import {
  createDonationSchema,
  donationIdParamsSchema,
  donationStatusSchema,
  manageDonationQuerySchema,
  myDonationQuerySchema,
  publicDonationQuerySchema,
  updateDonationSchema,
} from "../validators/donation.validator.js";

const donationRouter = Router();

donationRouter.get(
  "/",
  validateRequest({ query: publicDonationQuerySchema }),
  asyncHandler(getPublicDonations),
);
donationRouter.post(
  "/",
  verifyAuth,
  verifyActiveUser,
  verifyRole(USER_ROLES.DONOR),
  validateRequest({ body: createDonationSchema }),
  asyncHandler(createDonation),
);
donationRouter.get(
  "/mine",
  verifyAuth,
  verifyActiveUser,
  validateRequest({ query: myDonationQuerySchema }),
  asyncHandler(getMyDonations),
);
donationRouter.get(
  "/manage",
  verifyAuth,
  verifyActiveUser,
  verifyRole(USER_ROLES.ADMIN, USER_ROLES.VOLUNTEER),
  validateRequest({ query: manageDonationQuerySchema }),
  asyncHandler(getManagedDonations),
);
donationRouter.post(
  "/:id/confirm",
  verifyAuth,
  verifyActiveUser,
  verifyRole(USER_ROLES.DONOR),
  validateRequest({ params: donationIdParamsSchema }),
  asyncHandler(confirmDonation),
);
donationRouter.patch(
  "/:id/cancel-assignment",
  verifyAuth,
  verifyActiveUser,
  verifyRole(USER_ROLES.ADMIN, USER_ROLES.VOLUNTEER),
  validateRequest({ params: donationIdParamsSchema }),
  asyncHandler(cancelAssignment),
);
donationRouter.patch(
  "/:id/status",
  verifyAuth,
  verifyActiveUser,
  validateRequest({ params: donationIdParamsSchema, body: donationStatusSchema }),
  asyncHandler(patchDonationStatus),
);
donationRouter.get(
  "/:id",
  verifyAuth,
  verifyActiveUser,
  validateRequest({ params: donationIdParamsSchema }),
  asyncHandler(getDonation),
);
donationRouter.patch(
  "/:id",
  verifyAuth,
  verifyActiveUser,
  validateRequest({ params: donationIdParamsSchema, body: updateDonationSchema }),
  asyncHandler(patchDonation),
);
donationRouter.delete(
  "/:id",
  verifyAuth,
  verifyActiveUser,
  validateRequest({ params: donationIdParamsSchema }),
  asyncHandler(removeDonation),
);

export default donationRouter;
