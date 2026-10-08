import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getCollection: vi.fn(),
}));

vi.mock("../src/config/db.js", () => ({
  getCollection: dbMocks.getCollection,
}));

vi.mock("../src/config/indexes.js", () => ({
  initializeIndexes: vi.fn().mockResolvedValue(undefined),
}));

import {
  createProfileForAuthUser,
  searchActiveDonors,
} from "../src/services/profile.service.js";

const buildCursor = (items = []) => {
  const cursor = {
    sort: vi.fn(),
    skip: vi.fn(),
    limit: vi.fn(),
    toArray: vi.fn().mockResolvedValue(items),
  };
  cursor.sort.mockReturnValue(cursor);
  cursor.skip.mockReturnValue(cursor);
  cursor.limit.mockReturnValue(cursor);
  return cursor;
};

describe("profile service", () => {
  let collection;

  beforeEach(() => {
    vi.clearAllMocks();
    collection = {
      updateOne: vi.fn().mockResolvedValue({ upsertedCount: 1 }),
      findOne: vi.fn().mockResolvedValue({ authUserId: "auth-1" }),
      find: vi.fn(),
      countDocuments: vi.fn(),
    };
    dbMocks.getCollection.mockResolvedValue(collection);
  });

  it("creates an idempotent active donor profile without a password", async () => {
    const authUser = {
      id: "auth-1",
      name: "Test Donor",
      email: "DONOR@EXAMPLE.COM",
      avatar: "https://example.com/avatar.png",
      bloodGroup: "O+",
      district: "Dhaka",
      upazila: "Savar",
      password: "must-not-be-copied",
    };

    await createProfileForAuthUser(authUser);
    await createProfileForAuthUser(authUser);

    expect(collection.updateOne).toHaveBeenCalledTimes(2);
    const [filter, update, options] = collection.updateOne.mock.calls[0];
    expect(filter).toEqual({ authUserId: "auth-1" });
    expect(options).toEqual({ upsert: true });
    expect(update.$setOnInsert).toMatchObject({
      role: "donor",
      status: "active",
      email: "donor@example.com",
    });
    expect(update.$setOnInsert).not.toHaveProperty("password");
  });

  it("always restricts donor searches to active donor profiles", async () => {
    const cursor = buildCursor([{ authUserId: "auth-1" }]);
    collection.find.mockReturnValue(cursor);
    collection.countDocuments.mockResolvedValue(1);

    const result = await searchActiveDonors({
      bloodGroup: "O+",
      district: "Dhaka",
      page: 1,
      limit: 10,
    });

    const expectedQuery = {
      role: "donor",
      status: "active",
      bloodGroup: "O+",
      district: "Dhaka",
    };
    expect(collection.find).toHaveBeenCalledWith(expectedQuery, {
      projection: {
        _id: 1,
        name: 1,
        avatar: 1,
        bloodGroup: 1,
        district: 1,
        upazila: 1,
      },
    });
    expect(collection.countDocuments).toHaveBeenCalledWith(expectedQuery);
    expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
  });
});
