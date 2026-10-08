import { Router } from "express";
import { USER_ROLES } from "../constants/auth.js";
import {
  getCurrentUser,
  getUsers,
  patchCurrentUser,
  patchUserRole,
  patchUserStatus,
  searchDonors,
} from "../controllers/user.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { verifyActiveUser } from "../middleware/verifyActiveUser.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import { verifyRole } from "../middleware/verifyRole.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  donorSearchQuerySchema,
  listUsersQuerySchema,
  mongoIdParamsSchema,
  updateOwnProfileSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "../validators/user.validator.js";

const userRouter = Router();

userRouter.use(verifyAuth, verifyActiveUser);

userRouter.get("/me", getCurrentUser);
userRouter.patch(
  "/me",
  validateRequest({ body: updateOwnProfileSchema }),
  asyncHandler(patchCurrentUser),
);
userRouter.get(
  "/search",
  validateRequest({ query: donorSearchQuerySchema }),
  asyncHandler(searchDonors),
);

userRouter.use(verifyRole(USER_ROLES.ADMIN));

userRouter.get(
  "/",
  validateRequest({ query: listUsersQuerySchema }),
  asyncHandler(getUsers),
);
userRouter.patch(
  "/:id/status",
  validateRequest({ params: mongoIdParamsSchema, body: updateUserStatusSchema }),
  asyncHandler(patchUserStatus),
);
userRouter.patch(
  "/:id/role",
  validateRequest({ params: mongoIdParamsSchema, body: updateUserRoleSchema }),
  asyncHandler(patchUserRole),
);

export default userRouter;
