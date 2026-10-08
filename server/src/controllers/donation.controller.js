import { USER_ROLES } from "../constants/auth.js";
import {
  changeDonationStatus,
  confirmDonationRequest,
  createDonationRequest,
  deleteDonationRequest,
  getDonationRequestById,
  listManagedDonationRequests,
  listMyDonationRequests,
  listPublicDonationRequests,
  updateDonationRequestDetails,
} from "../services/donation.service.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/apiResponse.js";

const requireDonation = async (id) => {
  const donation = await getDonationRequestById(id);
  if (!donation) throw new ApiError(404, "Donation request not found");
  return donation;
};

const requireOwnerOrAdmin = (donation, profile) => {
  if (profile.role !== USER_ROLES.ADMIN && donation.requesterUserId !== profile.authUserId) {
    throw new ApiError(403, "You do not have permission to modify this donation request");
  }
};

export const createDonation = async (request, response) => {
  const donation = await createDonationRequest(request.validated.body, request.profile);
  return sendSuccess(response, {
    statusCode: 201,
    message: "Donation request created successfully",
    data: donation,
  });
};

export const getPublicDonations = async (request, response) =>
  sendSuccess(response, {
    message: "Pending donation requests retrieved successfully",
    data: await listPublicDonationRequests(request.validated.query),
  });

export const getDonation = async (request, response) =>
  sendSuccess(response, {
    message: "Donation request retrieved successfully",
    data: await requireDonation(request.validated.params.id),
  });

export const getMyDonations = async (request, response) =>
  sendSuccess(response, {
    message: "Your donation requests retrieved successfully",
    data: await listMyDonationRequests(request.auth.userId, request.validated.query),
  });

export const getManagedDonations = async (request, response) =>
  sendSuccess(response, {
    message: "Donation requests retrieved successfully",
    data: await listManagedDonationRequests(request.validated.query),
  });

export const patchDonation = async (request, response) => {
  const existing = await requireDonation(request.validated.params.id);
  requireOwnerOrAdmin(existing, request.profile);
  const donation = await updateDonationRequestDetails(
    request.validated.params.id,
    request.validated.body,
  );
  return sendSuccess(response, {
    message: "Donation request updated successfully",
    data: donation,
  });
};

export const removeDonation = async (request, response) => {
  const existing = await requireDonation(request.validated.params.id);
  requireOwnerOrAdmin(existing, request.profile);
  const result = await deleteDonationRequest(request.validated.params.id);
  if (result.deletedCount !== 1) throw new ApiError(404, "Donation request not found");
  return sendSuccess(response, {
    message: "Donation request deleted successfully",
    data: { id: request.validated.params.id },
  });
};

export const confirmDonation = async (request, response) =>
  sendSuccess(response, {
    message: "Donation request confirmed successfully",
    data: await confirmDonationRequest(request.validated.params.id, request.profile),
  });

export const patchDonationStatus = async (request, response) =>
  sendSuccess(response, {
    message: "Donation status updated successfully",
    data: await changeDonationStatus(
      request.validated.params.id,
      request.validated.body.donationStatus,
      request.profile,
    ),
  });
