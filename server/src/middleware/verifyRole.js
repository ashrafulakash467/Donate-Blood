import { ApiError } from "../utils/ApiError.js";

export const verifyRole = (...allowedRoles) => (request, _response, next) => {
  if (!request.profile || !allowedRoles.includes(request.profile.role)) {
    return next(new ApiError(403, "You do not have permission to perform this action"));
  }

  return next();
};
