import { auth } from "../config/auth.js";
import { findProfileByAuthUserId } from "../services/profile.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) return null;
  const [scheme, token, extra] = authorizationHeader.trim().split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token || extra) return null;
  return token;
};

export const verifyAuth = asyncHandler(async (request, _response, next) => {
  const token = getBearerToken(request.get("authorization"));
  if (!token) throw new ApiError(401, "A valid Bearer token is required");

  let verification;
  try {
    verification = await auth.api.verifyJWT({ body: { token } });
  } catch {
    throw new ApiError(401, "Invalid or expired authentication token");
  }

  const payload = verification?.payload;
  if (!payload || typeof payload.sub !== "string") {
    throw new ApiError(401, "Invalid or expired authentication token");
  }

  const profile = await findProfileByAuthUserId(payload.sub);
  if (!profile) throw new ApiError(401, "Authenticated user profile was not found");

  request.auth = { userId: payload.sub, token, payload };
  request.profile = profile;
  next();
});
