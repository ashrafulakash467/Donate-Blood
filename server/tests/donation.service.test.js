import { ObjectId } from "mongodb";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCollection: vi.fn(),
  initializeIndexes: vi.fn(),
}));
vi.mock("../src/config/db.js", () => ({ getCollection: mocks.getCollection }));
vi.mock("../src/config/indexes.js", () => ({ initializeIndexes: mocks.initializeIndexes }));

import {
  cancelDonationAssignment,
  changeDonationStatus,
  confirmDonationRequest,
  createDonationRequest,
  listMyDonationRequests,
  listPublicDonationRequests,
} from "../src/services/donation.service.js";

const id = "507f1f77bcf86cd799439011";
const profile = {
  authUserId: "donor-2",
  name: "Second Donor",
  email: "second@example.com",
  bloodGroup: "A+",
  role: "donor",
};
const pending = {
  _id: new ObjectId(id),
  requesterUserId: "donor-1",
  bloodGroup: "A+",
  donationStatus: "pending",
  donorUserId: null,
};

const makeCursor = (items = []) => {
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

let collection;
beforeEach(() => {
  vi.clearAllMocks();
  collection = {
    insertOne: vi.fn().mockResolvedValue({ insertedId: new ObjectId(id) }),
    find: vi.fn(() => makeCursor()),
    countDocuments: vi.fn().mockResolvedValue(0),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    deleteOne: vi.fn(),
  };
  mocks.getCollection.mockResolvedValue(collection);
  mocks.initializeIndexes.mockResolvedValue(undefined);
});

describe("donation service", () => {
  it("derives requester identity and pending defaults when creating", async () => {
    const input = {
      recipientName: "Patient",
      bloodGroup: "A+",
    };
    const created = await createDonationRequest(input, profile);
    expect(collection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
      requesterUserId: "donor-2",
      requesterName: "Second Donor",
      requesterEmail: "second@example.com",
      requesterPhone: null,
      donationStatus: "pending",
      donorUserId: null,
      donorName: null,
      donorEmail: null,
    }));
    expect(created.donationStatus).toBe("pending");
  });

  it("forces public queries to pending and applies a safe projection", async () => {
    const cursor = makeCursor();
    collection.find.mockReturnValue(cursor);
    await listPublicDonationRequests({
      page: 2,
      limit: 3,
      bloodGroup: "A+",
      district: "Dhaka",
    });
    expect(collection.find).toHaveBeenCalledWith(
      { donationStatus: "pending", bloodGroup: "A+", recipientDistrict: "Dhaka" },
      { projection: expect.not.objectContaining({ requesterEmail: 1, requesterPhone: 1, donorEmail: 1 }) },
    );
    expect(cursor.skip).toHaveBeenCalledWith(3);
    expect(cursor.limit).toHaveBeenCalledWith(3);
  });

  it("scopes mine queries by verified auth user and status", async () => {
    const cursor = makeCursor();
    collection.find.mockReturnValue(cursor);
    await listMyDonationRequests("donor-2", { page: 1, limit: 3, status: "done" });
    expect(collection.find).toHaveBeenCalledWith(
      { requesterUserId: "donor-2", donationStatus: "done" },
      undefined,
    );
    expect(cursor.sort).toHaveBeenCalledWith({ createdAt: -1, _id: 1 });
  });

  it("atomically confirms a pending request and records stored donor identity", async () => {
    collection.findOne.mockResolvedValue(pending);
    collection.findOneAndUpdate.mockResolvedValue({ ...pending, donationStatus: "inprogress" });
    await confirmDonationRequest(id, profile);
    expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: expect.any(ObjectId),
        donationStatus: "pending",
        donorUserId: null,
        requesterUserId: { $ne: "donor-2" },
        bloodGroup: "A+",
      }),
      { $set: expect.objectContaining({
        donationStatus: "inprogress",
        donorUserId: "donor-2",
        donorName: "Second Donor",
        donorEmail: "second@example.com",
      }) },
      { returnDocument: "after" },
    );
  });

  it("reports a conflict when a concurrent donor wins confirmation", async () => {
    collection.findOne.mockResolvedValue(pending);
    collection.findOneAndUpdate.mockResolvedValue(null);
    await expect(confirmDonationRequest(id, profile)).rejects.toMatchObject({ statusCode: 409 });
  });

  it("allows a donor with any blood group", async () => {
    const abPositiveRequest = { ...pending, bloodGroup: "AB+" };
    collection.findOne.mockResolvedValue(abPositiveRequest);
    collection.findOneAndUpdate.mockResolvedValue({
      ...abPositiveRequest,
      donationStatus: "inprogress",
      donorUserId: profile.authUserId,
    });

    await expect(confirmDonationRequest(id, profile)).resolves.toMatchObject({
      donationStatus: "inprogress",
    });
    expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ bloodGroup: "AB+" }),
      expect.any(Object),
      { returnDocument: "after" },
    );
  });

  it("atomically cancels an active donor assignment and clears donor identity", async () => {
    const assigned = {
      ...pending,
      donationStatus: "inprogress",
      donorUserId: "donor-2",
      donorName: "Second Donor",
      donorEmail: "second@example.com",
    };
    collection.findOne.mockResolvedValue(assigned);
    collection.findOneAndUpdate.mockResolvedValue({
      ...assigned,
      donationStatus: "pending",
      donorUserId: null,
      donorName: null,
      donorEmail: null,
    });

    const result = await cancelDonationAssignment(id);

    expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: expect.any(ObjectId),
        donationStatus: "inprogress",
        donorUserId: "donor-2",
      },
      {
        $set: expect.objectContaining({
          donationStatus: "pending",
          donorUserId: null,
          donorName: null,
          donorEmail: null,
        }),
      },
      { returnDocument: "after" },
    );
    expect(result).toMatchObject({ donationStatus: "pending", donorUserId: null });
  });

  it("rejects cancel-assignment without an active assignment or after a concurrent change", async () => {
    collection.findOne.mockResolvedValue(pending);
    await expect(cancelDonationAssignment(id)).rejects.toMatchObject({ statusCode: 409 });

    collection.findOne.mockResolvedValue({
      ...pending,
      donationStatus: "inprogress",
      donorUserId: "donor-2",
    });
    collection.findOneAndUpdate.mockResolvedValue(null);
    await expect(cancelDonationAssignment(id)).rejects.toMatchObject({ statusCode: 409 });
  });

  it("prevents owners but permits a different donor blood group", async () => {
    collection.findOne.mockResolvedValue({ ...pending, requesterUserId: "donor-2" });
    await expect(confirmDonationRequest(id, profile)).rejects.toMatchObject({ statusCode: 409 });
    collection.findOne.mockResolvedValue({ ...pending, bloodGroup: "O-" });
    collection.findOneAndUpdate.mockResolvedValue({ ...pending, bloodGroup: "O-", donationStatus: "inprogress" });
    await expect(confirmDonationRequest(id, profile)).resolves.toMatchObject({ donationStatus: "inprogress" });
  });

  it("allows an owner to finish an in-progress request atomically", async () => {
    const owner = { ...profile, authUserId: "donor-1" };
    collection.findOne.mockResolvedValue({ ...pending, donationStatus: "inprogress" });
    collection.findOneAndUpdate.mockResolvedValue({ ...pending, donationStatus: "done" });
    await changeDonationStatus(id, "done", owner);
    expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: expect.any(ObjectId), donationStatus: "inprogress" },
      { $set: expect.objectContaining({ donationStatus: "done" }) },
      { returnDocument: "after" },
    );
  });

  it("allows an owner to cancel an in-progress request without reopening it", async () => {
    const owner = { ...profile, authUserId: "donor-1" };
    collection.findOne.mockResolvedValue({ ...pending, donationStatus: "inprogress" });
    collection.findOneAndUpdate.mockResolvedValue({ ...pending, donationStatus: "canceled" });
    await changeDonationStatus(id, "canceled", owner);
    expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: expect.any(ObjectId), donationStatus: "inprogress" },
      { $set: expect.objectContaining({ donationStatus: "canceled" }) },
      { returnDocument: "after" },
    );
  });

  it("allows another matching donor to confirm after staff cancel the assignment", async () => {
    const assigned = {
      ...pending,
      donationStatus: "inprogress",
      donorUserId: "donor-2",
      donorName: "Second Donor",
      donorEmail: "second@example.com",
    };
    const reopened = {
      ...assigned,
      donationStatus: "pending",
      donorUserId: null,
      donorName: null,
      donorEmail: null,
    };
    collection.findOne
      .mockResolvedValueOnce(assigned)
      .mockResolvedValueOnce(reopened);
    collection.findOneAndUpdate
      .mockResolvedValueOnce(reopened)
      .mockResolvedValueOnce({
        ...reopened,
        donationStatus: "inprogress",
        donorUserId: "donor-3",
      });

    await cancelDonationAssignment(id);
    const nextDonor = {
      ...profile,
      authUserId: "donor-3",
      name: "Third Donor",
      email: "third@example.com",
    };
    const reassigned = await confirmDonationRequest(id, nextDonor);

    expect(collection.findOneAndUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        donationStatus: "pending",
        donorUserId: null,
        requesterUserId: { $ne: "donor-3" },
      }),
      { $set: expect.objectContaining({ donorUserId: "donor-3" }) },
      { returnDocument: "after" },
    );
    expect(reassigned).toMatchObject({ donationStatus: "inprogress", donorUserId: "donor-3" });
  });

  it("allows volunteer cancellation but rejects invalid transitions", async () => {
    collection.findOne.mockResolvedValue(pending);
    collection.findOneAndUpdate.mockResolvedValue({ ...pending, donationStatus: "canceled" });
    await changeDonationStatus(id, "canceled", { ...profile, role: "volunteer" });
    collection.findOne.mockResolvedValue({ ...pending, donationStatus: "done" });
    await expect(
      changeDonationStatus(id, "canceled", { ...profile, role: "admin" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});
