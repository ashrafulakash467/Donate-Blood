import { describe, expect, it, vi } from "vitest";
import { APPLICATION_COLLECTIONS } from "../src/constants/collections.js";
import { initializeIndexes } from "../src/config/indexes.js";

describe("initializeIndexes", () => {
  it("creates application collections and required indexes only once per instance", async () => {
    const createCollection = vi.fn().mockResolvedValue(undefined);
    const createIndexesByCollection = new Map(
      Object.values(APPLICATION_COLLECTIONS).map((name) => [
        name,
        vi.fn().mockResolvedValue([]),
      ]),
    );
    const database = {
      listCollections: vi.fn(() => ({
        toArray: vi.fn().mockResolvedValue([]),
      })),
      createCollection,
      collection: vi.fn((name) => ({
        createIndexes: createIndexesByCollection.get(name),
      })),
    };

    const [firstResult, secondResult] = await Promise.all([
      initializeIndexes(database),
      initializeIndexes(database),
    ]);

    expect(firstResult).toBe(database);
    expect(secondResult).toBe(database);
    expect(database.listCollections).toHaveBeenCalledTimes(1);
    expect(createCollection).toHaveBeenCalledTimes(4);

    const profileIndexes = createIndexesByCollection.get("profiles").mock.calls[0][0];
    expect(profileIndexes).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: { authUserId: 1 }, unique: true }),
      expect.objectContaining({
        key: { email: 1 },
        unique: true,
        collation: { locale: "en", strength: 2 },
      }),
      expect.objectContaining({ key: { bloodGroup: 1, district: 1, upazila: 1 } }),
    ]));

    const requestIndexes = createIndexesByCollection
      .get("donationRequests").mock.calls[0][0];
    expect(requestIndexes).toHaveLength(5);
    expect(requestIndexes).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: { createdAt: -1 } }),
      expect.objectContaining({ key: { requesterUserId: 1, createdAt: -1 } }),
      expect.objectContaining({ key: { donationStatus: 1, createdAt: -1 } }),
      expect.objectContaining({ key: { bloodGroup: 1, donationStatus: 1 } }),
      expect.objectContaining({ key: { donationDate: 1 } }),
    ]));

    const fundingIndexes = createIndexesByCollection.get("fundings").mock.calls[0][0];
    expect(fundingIndexes).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: { stripeSessionId: 1 }, unique: true }),
      expect.objectContaining({ key: { fundingDate: -1 } }),
      expect.objectContaining({ key: { paymentStatus: 1, fundingDate: -1 } }),
    ]));

    expect(createIndexesByCollection.get("contacts")).toHaveBeenCalledWith([
      expect.objectContaining({ key: { createdAt: -1 } }),
    ]);
  });
});
