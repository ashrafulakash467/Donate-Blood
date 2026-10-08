import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";
import {
  listAllProfiles,
  searchActiveDonors,
  updateOwnProfile,
  updateProfileRole,
  updateProfileStatus,
} from "../services/profile.service.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getCurrentUser = (request, response) =>
  sendSuccess(response, {
    message: "User profile retrieved successfully",
    data: request.profile,
  });

export const patchCurrentUser = async (request, response) => {
  const headers = fromNodeHeaders(request.headers);
  const session = await auth.api.getSession({ headers });
  if (!session || session.user.id !== request.auth.userId) {
    throw new ApiError(401, "A matching Better Auth session is required");
  }

  try {
    await auth.api.updateUser({
      headers,
      body: request.validated.body,
    });
  } catch (error) {
    const statusCode = Number(error?.statusCode ?? error?.status) || 400;
    throw new ApiError(
      statusCode >= 400 && statusCode < 500 ? statusCode : 400,
      error?.message ?? "Unable to update the authentication profile",
    );
  }

  const profile = await updateOwnProfile(request.auth.userId, request.validated.body);
  if (!profile) throw new ApiError(404, "User profile not found");

  return sendSuccess(response, {
    message: "User profile updated successfully",
    data: profile,
  });
};

export const searchDonors = async (request, response) => {
  const result = await searchActiveDonors(request.validated.query);
  return sendSuccess(response, {
    message: "Donors retrieved successfully",
    data: result,
  });
};

export const getUsers = async (request, response) => {
  const result = await listAllProfiles(request.validated.query);
  return sendSuccess(response, {
    message: "Users retrieved successfully",
    data: result,
  });
};

export const patchUserStatus = async (request, response) => {
  const profile = await updateProfileStatus(
    request.validated.params.id,
    request.validated.body.status,
  );
  if (!profile) throw new ApiError(404, "User profile not found");

  return sendSuccess(response, {
    message: "User status updated successfully",
    data: profile,
  });
};

export const patchUserRole = async (request, response) => {
  const profile = await updateProfileRole(
    request.validated.params.id,
    request.validated.body.role,
  );
  if (!profile) throw new ApiError(404, "User profile not found");

  return sendSuccess(response, {
    message: "User role updated successfully",
    data: profile,
  });
};
