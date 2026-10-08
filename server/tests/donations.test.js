import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyJWT: vi.fn(),
  findProfileByAuthUserId: vi.fn(),
  createDonationRequest: vi.fn(),
  listPublicDonationRequests: vi.fn(),
  getDonationRequestById: vi.fn(),
  listMyDonationRequests: vi.fn(),
  listManagedDonationRequests: vi.fn(),
  updateDonationRequestDetails: vi.fn(),
  deleteDonationRequest: vi.fn(),
  confirmDonationRequest: vi.fn(),
  changeDonationStatus: vi.fn(),
}));

vi.mock("../src/config/auth.js", () => ({
  auth: { api: { verifyJWT: mocks.verifyJWT } },
}));
vi.mock("../src/services/profile.service.js", () => ({
  findProfileByAuthUserId: mocks.findProfileByAuthUserId,
}));
vi.mock("../src/services/donation.service.js", () => ({
  createDonationRequest: mocks.createDonationRequest,
  listPublicDonationRequests: mocks.listPublicDonationRequests,
  getDonationRequestById: mocks.getDonationRequestById,
  listMyDonationRequests: mocks.listMyDonationRequests,
  listManagedDonationRequests: mocks.listManagedDonationRequests,
  updateDonationRequestDetails: mocks.updateDonationRequestDetails,
  deleteDonationRequest: mocks.deleteDonationRequest,
  confirmDonationRequest: mocks.confirmDonationRequest,
  changeDonationStatus: mocks.changeDonationStatus,
}));

import { errorHandler, notFoundHandler } from "../src/middleware/errorHandler.js";
import donationRouter from "../src/routes/donation.routes.js";
import { ApiError } from "../src/utils/ApiError.js";

const app = express();
app.use(express.json());
app.use("/api/v1/donations", donationRouter);
app.use(notFoundHandler);
app.use(errorHandler);

const id = "507f1f77bcf86cd799439011";
const tokenHeader = { Authorization: "Bearer valid.jwt.token" };
const donorProfile = {
  authUserId: "auth-user-1",
  name: "Donor User",
  email: "donor@example.com",
  bloodGroup: "A+",
  role: "donor",
  status: "active",
};
const validInput = {
  recipientName: "Patient Name",
  recipientDistrict: "Dhaka",
  recipientUpazila: "Savar",
  hospitalName: "General Hospital",
  fullAddress: "123 Hospital Road, Dhaka",
  bloodGroup: "A+",
  donationDate: "2027-01-15",
  donationTime: "14:30",
  requestMessage: "Urgently need blood for surgery.",
};
const pendingDonation = {
  _id: id,
  requesterUserId: "auth-user-1",
  ...validInput,
  donationStatus: "pending",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyJWT.mockResolvedValue({ payload: { sub: "auth-user-1" } });
  mocks.findProfileByAuthUserId.mockResolvedValue(donorProfile);
  mocks.getDonationRequestById.mockResolvedValue(pendingDonation);
  mocks.listPublicDonationRequests.mockResolvedValue({ items: [], pagination: {} });
  mocks.listMyDonationRequests.mockResolvedValue({ items: [], pagination: {} });
  mocks.listManagedDonationRequests.mockResolvedValue({ items: [], pagination: {} });
});

describe("donation request creation and validation", () => {
  it("lets an active donor create a request using the stored profile", async () => {
    mocks.createDonationRequest.mockResolvedValue(pendingDonation);
    const response = await request(app)
      .post("/api/v1/donations")
      .set(tokenHeader)
      .send(validInput)
      .expect(201);

    expect(mocks.createDonationRequest).toHaveBeenCalledWith(validInput, donorProfile);
    expect(response.body.data.donationStatus).toBe("pending");
  });

  it("prevents a blocked donor from creating a request", async () => {
    mocks.findProfileByAuthUserId.mockResolvedValue({ ...donorProfile, status: "blocked" });
    await request(app).post("/api/v1/donations").set(tokenHeader).send(validInput).expect(403);
    expect(mocks.createDonationRequest).not.toHaveBeenCalled();
  });

  it("rejects invalid fields and injected requester identity", async () => {
    const response = await request(app)
      .post("/api/v1/donations")
      .set(tokenHeader)
      .send({ ...validInput, bloodGroup: "X", requesterUserId: "attacker" })
      .expect(400);
    expect(response.body.message).toBe("Validation failed");
    expect(mocks.createDonationRequest).not.toHaveBeenCalled();
  });
});

describe("donation request queries", () => {
  it("keeps the pending list public and passes filters with pagination", async () => {
    await request(app)
      .get("/api/v1/donations?bloodGroup=A%2B&district=Dhaka&page=2&limit=3")
      .expect(200);
    expect(mocks.listPublicDonationRequests).toHaveBeenCalledWith({
      page: 2,
      limit: 3,
      bloodGroup: "A+",
      district: "Dhaka",
    });
  });

  it("requires authentication for private details", async () => {
    await request(app).get(`/api/v1/donations/${id}`).expect(401);
  });

  it("returns full private details to an authenticated user", async () => {
    const response = await request(app)
      .get(`/api/v1/donations/${id}`)
      .set(tokenHeader)
      .expect(200);
    expect(mocks.getDonationRequestById).toHaveBeenCalledWith(id);
    expect(response.body.data).toMatchObject({
      _id: id,
      requesterUserId: "auth-user-1",
      hospitalName: "General Hospital",
    });
  });

  it("lists only the authenticated requester's records with dashboard limit", async () => {
    await request(app)
      .get("/api/v1/donations/mine?status=inprogress&limit=3")
      .set(tokenHeader)
      .expect(200);
    expect(mocks.listMyDonationRequests).toHaveBeenCalledWith("auth-user-1", {
      page: 1,
      limit: 3,
      status: "inprogress",
    });
  });

  it("rejects malformed ObjectIds", async () => {
    await request(app).get("/api/v1/donations/not-an-id").set(tokenHeader).expect(400);
    expect(mocks.getDonationRequestById).not.toHaveBeenCalled();
  });
});

describe("ownership and role enforcement", () => {
  it.each(["patch", "delete"])("lets the owner %s a request", async (method) => {
    mocks.updateDonationRequestDetails.mockResolvedValue({ ...pendingDonation, hospitalName: "New Hospital" });
    mocks.deleteDonationRequest.mockResolvedValue({ deletedCount: 1 });
    const operation = request(app)[method](`/api/v1/donations/${id}`).set(tokenHeader);
    if (method === "patch") operation.send({ hospitalName: "New Hospital" });
    await operation.expect(200);
  });

  it.each(["donor", "volunteer"])("prevents a non-owner %s from editing or deleting", async (role) => {
    mocks.findProfileByAuthUserId.mockResolvedValue({ ...donorProfile, role, authUserId: "other-user" });
    await request(app)
      .patch(`/api/v1/donations/${id}`)
      .set(tokenHeader)
      .send({ hospitalName: "New Hospital" })
      .expect(403);
    await request(app).delete(`/api/v1/donations/${id}`).set(tokenHeader).expect(403);
  });

  it("lets an admin edit and delete any request", async () => {
    mocks.findProfileByAuthUserId.mockResolvedValue({ ...donorProfile, role: "admin", authUserId: "admin-1" });
    mocks.updateDonationRequestDetails.mockResolvedValue(pendingDonation);
    mocks.deleteDonationRequest.mockResolvedValue({ deletedCount: 1 });
    await request(app)
      .patch(`/api/v1/donations/${id}`)
      .set(tokenHeader)
      .send({ hospitalName: "Admin Updated Hospital" })
      .expect(200);
    await request(app).delete(`/api/v1/donations/${id}`).set(tokenHeader).expect(200);
  });

  it("allows only admins and volunteers to use the management list", async () => {
    await request(app).get("/api/v1/donations/manage").set(tokenHeader).expect(403);
    mocks.findProfileByAuthUserId.mockResolvedValue({ ...donorProfile, role: "volunteer" });
    await request(app)
      .get("/api/v1/donations/manage?status=pending&sort=oldest")
      .set(tokenHeader)
      .expect(200);
    expect(mocks.listManagedDonationRequests).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: "pending",
      sort: "oldest",
    });
  });
});

describe("confirmation and status APIs", () => {
  it("confirms a pending request as the active donor", async () => {
    mocks.confirmDonationRequest.mockResolvedValue({ ...pendingDonation, donationStatus: "inprogress" });
    const response = await request(app)
      .post(`/api/v1/donations/${id}/confirm`)
      .set(tokenHeader)
      .expect(200);
    expect(mocks.confirmDonationRequest).toHaveBeenCalledWith(id, donorProfile);
    expect(response.body.data.donationStatus).toBe("inprogress");
  });

  it("returns conflict errors from invalid transitions", async () => {
    mocks.changeDonationStatus.mockRejectedValue(new ApiError(409, "Invalid transition"));
    const response = await request(app)
      .patch(`/api/v1/donations/${id}/status`)
      .set(tokenHeader)
      .send({ donationStatus: "done" })
      .expect(409);
    expect(response.body.message).toBe("Invalid transition");
  });
});
