import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyJWT: vi.fn(),
  getSession: vi.fn(),
  updateUser: vi.fn(),
  findProfileByAuthUserId: vi.fn(),
  updateOwnProfile: vi.fn(),
  searchActiveDonors: vi.fn(),
  listAllProfiles: vi.fn(),
  updateProfileStatus: vi.fn(),
  updateProfileRole: vi.fn(),
}));

vi.mock("../src/config/auth.js", () => ({
  auth: { api: {
    verifyJWT: mocks.verifyJWT,
    getSession: mocks.getSession,
    updateUser: mocks.updateUser,
  } },
}));

vi.mock("../src/services/profile.service.js", () => ({
  findProfileByAuthUserId: mocks.findProfileByAuthUserId,
  updateOwnProfile: mocks.updateOwnProfile,
  searchActiveDonors: mocks.searchActiveDonors,
  listAllProfiles: mocks.listAllProfiles,
  updateProfileStatus: mocks.updateProfileStatus,
  updateProfileRole: mocks.updateProfileRole,
}));

import { errorHandler, notFoundHandler } from "../src/middleware/errorHandler.js";
import userRouter from "../src/routes/user.routes.js";

const app = express();
app.use(express.json());
app.use("/api/v1/users", userRouter);
app.use(notFoundHandler);
app.use(errorHandler);

const tokenHeader = { Authorization: "Bearer valid.jwt.token" };
const donorProfile = {
  _id: "507f1f77bcf86cd799439011",
  authUserId: "auth-user-1",
  name: "Donor User",
  email: "donor@example.com",
  bloodGroup: "A+",
  district: "Dhaka",
  upazila: "Savar",
  role: "donor",
  status: "active",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyJWT.mockResolvedValue({ payload: { sub: "auth-user-1" } });
  mocks.getSession.mockResolvedValue({ user: { id: "auth-user-1" }, session: {} });
  mocks.updateUser.mockResolvedValue({ status: true });
  mocks.findProfileByAuthUserId.mockResolvedValue(donorProfile);
});

describe("user authentication and authorization", () => {
  it("rejects a missing JWT", async () => {
    const response = await request(app).get("/api/v1/users/me").expect(401);
    expect(response.body.message).toBe("A valid Bearer token is required");
  });

  it("rejects an invalid or expired JWT", async () => {
    mocks.verifyJWT.mockResolvedValue({ payload: null });
    const response = await request(app)
      .get("/api/v1/users/me")
      .set(tokenHeader)
      .expect(401);
    expect(response.body.message).toBe("Invalid or expired authentication token");
  });

  it("rejects blocked users", async () => {
    mocks.findProfileByAuthUserId.mockResolvedValue({
      ...donorProfile,
      status: "blocked",
    });
    const response = await request(app)
      .get("/api/v1/users/me")
      .set(tokenHeader)
      .expect(403);
    expect(response.body.message).toBe("This user account is blocked");
  });

  it.each(["donor", "volunteer"])("prevents a %s from managing users", async (role) => {
    mocks.findProfileByAuthUserId.mockResolvedValue({ ...donorProfile, role });
    await request(app).get("/api/v1/users").set(tokenHeader).expect(403);
    expect(mocks.listAllProfiles).not.toHaveBeenCalled();
  });
});

describe("current profile APIs", () => {
  it("retrieves the authenticated profile", async () => {
    const response = await request(app)
      .get("/api/v1/users/me")
      .set(tokenHeader)
      .expect(200);
    expect(response.body.data).toMatchObject({ authUserId: "auth-user-1" });
  });

  it("updates only allowlisted profile fields", async () => {
    mocks.updateOwnProfile.mockResolvedValue({ ...donorProfile, district: "Gazipur" });
    const response = await request(app)
      .patch("/api/v1/users/me")
      .set(tokenHeader)
      .send({ district: "Gazipur" })
      .expect(200);

    expect(mocks.updateOwnProfile).toHaveBeenCalledWith("auth-user-1", {
      district: "Gazipur",
    });
    expect(response.body.data.district).toBe("Gazipur");
    expect(mocks.updateUser).toHaveBeenCalledWith(expect.objectContaining({
      body: { district: "Gazipur" },
    }));
  });

  it("requires the persistent session to match the verified JWT for identity updates", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "different-user" }, session: {} });
    await request(app)
      .patch("/api/v1/users/me")
      .set(tokenHeader)
      .send({ name: "Updated Name" })
      .expect(401);
    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(mocks.updateOwnProfile).not.toHaveBeenCalled();
  });

  it("rejects attempts to update email or role", async () => {
    const response = await request(app)
      .patch("/api/v1/users/me")
      .set(tokenHeader)
      .send({ email: "changed@example.com", role: "admin" })
      .expect(400);

    expect(response.body.message).toBe("Validation failed");
    expect(mocks.updateOwnProfile).not.toHaveBeenCalled();
  });
});

describe("donor search", () => {
  it("passes validated filters and pagination to the active donor search", async () => {
    mocks.searchActiveDonors.mockResolvedValue({
      items: [donorProfile],
      pagination: { page: 2, limit: 5, total: 1, totalPages: 1 },
    });
    const response = await request(app)
      .get("/api/v1/users/search?bloodGroup=A%2B&district=Dhaka&upazila=Savar&page=2&limit=5")
      .set(tokenHeader)
      .expect(200);

    expect(mocks.searchActiveDonors).toHaveBeenCalledWith({
      bloodGroup: "A+",
      district: "Dhaka",
      upazila: "Savar",
      page: 2,
      limit: 5,
    });
    expect(response.body.data.items).toHaveLength(1);
  });

  it("rejects invalid blood groups", async () => {
    await request(app)
      .get("/api/v1/users/search?bloodGroup=X")
      .set(tokenHeader)
      .expect(400);
    expect(mocks.searchActiveDonors).not.toHaveBeenCalled();
  });
});

describe("admin user management", () => {
  beforeEach(() => {
    mocks.findProfileByAuthUserId.mockResolvedValue({ ...donorProfile, role: "admin" });
  });

  it("lists users with status filtering", async () => {
    mocks.listAllProfiles.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
    await request(app)
      .get("/api/v1/users?status=blocked")
      .set(tokenHeader)
      .expect(200);
    expect(mocks.listAllProfiles).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: "blocked",
    });
  });

  it("blocks or unblocks a user", async () => {
    mocks.updateProfileStatus.mockResolvedValue({ ...donorProfile, status: "blocked" });
    await request(app)
      .patch("/api/v1/users/507f1f77bcf86cd799439011/status")
      .set(tokenHeader)
      .send({ status: "blocked" })
      .expect(200);
    expect(mocks.updateProfileStatus).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      "blocked",
    );
  });

  it("promotes a donor to volunteer or admin", async () => {
    mocks.updateProfileRole.mockResolvedValue({ ...donorProfile, role: "volunteer" });
    await request(app)
      .patch("/api/v1/users/507f1f77bcf86cd799439011/role")
      .set(tokenHeader)
      .send({ role: "volunteer" })
      .expect(200);
    expect(mocks.updateProfileRole).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011",
      "volunteer",
    );
  });
});
