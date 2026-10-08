import { ObjectId } from "mongodb";
import { USER_ROLES, USER_STATUSES } from "../constants/auth.js";
import { APPLICATION_COLLECTIONS } from "../constants/collections.js";
import { getCollection } from "../config/db.js";
import { initializeIndexes } from "../config/indexes.js";

const getProfilesCollection = async () => {
  await initializeIndexes();
  return getCollection(APPLICATION_COLLECTIONS.PROFILES);
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const profileFieldsFromAuthUser = (user) => ({
  authUserId: user.id,
  name: user.name,
  email: normalizeEmail(user.email),
  avatar: user.avatar ?? user.image ?? "",
  bloodGroup: user.bloodGroup,
  district: user.district,
  upazila: user.upazila,
  role: USER_ROLES.DONOR,
  status: USER_STATUSES.ACTIVE,
});

export const createProfileForAuthUser = async (user) => {
  const profiles = await getProfilesCollection();
  const now = new Date();
  await profiles.updateOne(
    { authUserId: user.id },
    {
      $setOnInsert: {
        ...profileFieldsFromAuthUser(user),
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );

  return profiles.findOne({ authUserId: user.id });
};

export const syncProfileFromAuthUser = async (user) => {
  const profiles = await getProfilesCollection();
  await profiles.updateOne(
    { authUserId: user.id },
    {
      $set: {
        name: user.name,
        email: normalizeEmail(user.email),
        avatar: user.avatar ?? user.image ?? "",
        bloodGroup: user.bloodGroup,
        district: user.district,
        upazila: user.upazila,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        role: USER_ROLES.DONOR,
        status: USER_STATUSES.ACTIVE,
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );

  return profiles.findOne({ authUserId: user.id });
};

export const findProfileByAuthUserId = async (authUserId) => {
  const profiles = await getProfilesCollection();
  return profiles.findOne({ authUserId });
};

export const updateOwnProfile = async (authUserId, updates) => {
  const profiles = await getProfilesCollection();
  return profiles.findOneAndUpdate(
    { authUserId },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
};

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

export const searchActiveDonors = async ({ page, limit, ...filters }) => {
  const profiles = await getProfilesCollection();
  const query = {
    role: USER_ROLES.DONOR,
    status: USER_STATUSES.ACTIVE,
    ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined)),
  };
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    profiles.find(query, {
      projection: {
        _id: 1,
        name: 1,
        avatar: 1,
        bloodGroup: 1,
        district: 1,
        upazila: 1,
      },
    }).sort({ updatedAt: -1, _id: 1 }).skip(skip).limit(limit).toArray(),
    profiles.countDocuments(query),
  ]);

  return { items, pagination: buildPagination(page, limit, total) };
};

export const listAllProfiles = async ({ page, limit, status }) => {
  const profiles = await getProfilesCollection();
  const query = status ? { status } : {};
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    profiles.find(query).sort({ createdAt: -1, _id: 1 }).skip(skip).limit(limit).toArray(),
    profiles.countDocuments(query),
  ]);

  return { items, pagination: buildPagination(page, limit, total) };
};

export const updateProfileStatus = async (profileId, status) => {
  const profiles = await getProfilesCollection();
  return profiles.findOneAndUpdate(
    { _id: new ObjectId(profileId) },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
};

export const updateProfileRole = async (profileId, role) => {
  const profiles = await getProfilesCollection();
  return profiles.findOneAndUpdate(
    { _id: new ObjectId(profileId) },
    { $set: { role, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
};
