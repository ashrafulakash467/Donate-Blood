import { USER_STATUSES } from "../constants/auth.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyActiveUser = (request, _response, next) => {
  if (!request.profile) return next(new ApiError(401, "Authentication is required"));
  if (request.profile.status !== USER_STATUSES.ACTIVE) {
    return next(new ApiError(403, "This user account is blocked"));
  }

  return next();
};
