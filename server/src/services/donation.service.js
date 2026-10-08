import { ObjectId } from "mongodb";
import { USER_ROLES } from "../constants/auth.js";
import { APPLICATION_COLLECTIONS } from "../constants/collections.js";
import { DONATION_STATUSES } from "../constants/donation.js";
import { getCollection } from "../config/db.js";
import { initializeIndexes } from "../config/indexes.js";
import { ApiError } from "../utils/ApiError.js";

const getDonationsCollection = async () => {
  await initializeIndexes();
  return getCollection(APPLICATION_COLLECTIONS.DONATION_REQUESTS);
};

const pagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

const paginatedFind = async (collection, query, { page, limit, sort, projection }) => {
  const skip = (page - 1) * limit;
  let cursor = collection.find(query, projection ? { projection } : undefined).sort(sort).skip(skip).limit(limit);
  const [items, total] = await Promise.all([cursor.toArray(), collection.countDocuments(query)]);
  return { items, pagination: pagination(page, limit, total) };
};

export const createDonationRequest = async (input, profile) => {
  const donations = await getDonationsCollection();
  const now = new Date();
  const donation = {
    requesterUserId: profile.authUserId,
    requesterName: profile.name,
    requesterEmail: profile.email,
    ...input,
    donationStatus: DONATION_STATUSES.PENDING,
    donorUserId: null,
    donorName: null,
    donorEmail: null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await donations.insertOne(donation);
  return { _id: result.insertedId, ...donation };
};

export const listPublicDonationRequests = async ({ page, limit, ...filters }) => {
  const donations = await getDonationsCollection();
  const query = { donationStatus: DONATION_STATUSES.PENDING };
  if (filters.bloodGroup) query.bloodGroup = filters.bloodGroup;
  if (filters.district) query.recipientDistrict = filters.district;
  if (filters.upazila) query.recipientUpazila = filters.upazila;
  if (filters.donationDate) query.donationDate = filters.donationDate;

  return paginatedFind(donations, query, {
    page,
    limit,
    sort: { createdAt: -1, _id: 1 },
    projection: {
      _id: 1,
      recipientName: 1,
      recipientDistrict: 1,
      recipientUpazila: 1,
      bloodGroup: 1,
      donationDate: 1,
      donationTime: 1,
    },
  });
};

export const getDonationRequestById = async (id) => {
  const donations = await getDonationsCollection();
  return donations.findOne({ _id: new ObjectId(id) });
};

export const listMyDonationRequests = async (authUserId, { page, limit, status }) => {
  const donations = await getDonationsCollection();
  const query = { requesterUserId: authUserId };
  if (status) query.donationStatus = status;
  return paginatedFind(donations, query, {
    page,
    limit,
    sort: { createdAt: -1, _id: 1 },
  });
};

export const listManagedDonationRequests = async ({ page, limit, status, bloodGroup, sort }) => {
  const donations = await getDonationsCollection();
  const query = {};
  if (status) query.donationStatus = status;
  if (bloodGroup) query.bloodGroup = bloodGroup;
  return paginatedFind(donations, query, {
    page,
    limit,
    sort: { createdAt: sort === "oldest" ? 1 : -1, _id: 1 },
  });
};

export const updateDonationRequestDetails = async (id, updates) => {
  const donations = await getDonationsCollection();
  return donations.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
};

export const deleteDonationRequest = async (id) => {
  const donations = await getDonationsCollection();
  return donations.deleteOne({ _id: new ObjectId(id) });
};

export const confirmDonationRequest = async (id, profile) => {
  const donations = await getDonationsCollection();
  const objectId = new ObjectId(id);
  const existing = await donations.findOne({ _id: objectId });
  if (!existing) throw new ApiError(404, "Donation request not found");
  if (existing.requesterUserId === profile.authUserId) {
    throw new ApiError(409, "You cannot confirm your own donation request");
  }
  if (existing.bloodGroup !== profile.bloodGroup) {
    throw new ApiError(403, "Your blood group is not eligible for this request");
  }
  if (existing.donationStatus !== DONATION_STATUSES.PENDING || existing.donorUserId) {
    throw new ApiError(409, "This donation request is no longer available");
  }

  const donation = await donations.findOneAndUpdate(
    {
      _id: objectId,
      donationStatus: DONATION_STATUSES.PENDING,
      donorUserId: null,
      requesterUserId: { $ne: profile.authUserId },
      bloodGroup: profile.bloodGroup,
    },
    {
      $set: {
        donationStatus: DONATION_STATUSES.IN_PROGRESS,
        donorUserId: profile.authUserId,
        donorName: profile.name,
        donorEmail: profile.email,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  if (!donation) throw new ApiError(409, "Another donor already confirmed this request");
  return donation;
};

const isAllowedTransition = (currentStatus, nextStatus, profile, donation) => {
  const managesAll = [USER_ROLES.ADMIN, USER_ROLES.VOLUNTEER].includes(profile.role);
  const isOwner = donation.requesterUserId === profile.authUserId;
  if (!managesAll && !isOwner) return { authorized: false, allowed: false };

  if (currentStatus === DONATION_STATUSES.IN_PROGRESS) {
    return {
      authorized: true,
      allowed: [DONATION_STATUSES.DONE, DONATION_STATUSES.CANCELED].includes(nextStatus),
    };
  }
  if (managesAll && currentStatus === DONATION_STATUSES.PENDING) {
    return { authorized: true, allowed: nextStatus === DONATION_STATUSES.CANCELED };
  }
  return { authorized: true, allowed: false };
};

export const changeDonationStatus = async (id, nextStatus, profile) => {
  const donations = await getDonationsCollection();
  const objectId = new ObjectId(id);
  const existing = await donations.findOne({ _id: objectId });
  if (!existing) throw new ApiError(404, "Donation request not found");

  const transition = isAllowedTransition(existing.donationStatus, nextStatus, profile, existing);
  if (!transition.authorized) {
    throw new ApiError(403, "You do not have permission to update this donation request");
  }
  if (!transition.allowed) {
    throw new ApiError(
      409,
      `Donation status cannot change from ${existing.donationStatus} to ${nextStatus}`,
    );
  }

  const donation = await donations.findOneAndUpdate(
    { _id: objectId, donationStatus: existing.donationStatus },
    { $set: { donationStatus: nextStatus, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!donation) throw new ApiError(409, "Donation status changed before this update completed");
  return donation;
};
