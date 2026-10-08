import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  verifyJWT: vi.fn(),
  findProfileByAuthUserId: vi.fn(),
  getDashboardStatistics: vi.fn(),
  getDonationTrends: vi.fn(),
}));
vi.mock("../src/config/auth.js", () => ({ auth: { api: { verifyJWT: mocks.verifyJWT } } }));
vi.mock("../src/services/profile.service.js", () => ({
  findProfileByAuthUserId: mocks.findProfileByAuthUserId,
}));
vi.mock("../src/services/dashboard.service.js", () => ({
  getDashboardStatistics: mocks.getDashboardStatistics,
  getDonationTrends: mocks.getDonationTrends,
}));

import dashboardRouter from "../src/routes/dashboard.routes.js";
import { errorHandler } from "../src/middleware/errorHandler.js";

const app = express();
app.use(express.json());
app.use("/api/v1/dashboard", dashboardRouter);
app.use(errorHandler);
const tokenHeader = { Authorization: "Bearer valid.jwt.token" };
const profile = { authUserId: "user-1", status: "active", role: "admin" };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.verifyJWT.mockResolvedValue({ payload: { sub: "user-1" } });
  mocks.findProfileByAuthUserId.mockResolvedValue(profile);
  mocks.getDashboardStatistics.mockResolvedValue({ totalUsers: 10, totalFunding: 25000 });
  mocks.getDonationTrends.mockResolvedValue({ labels: ["Mon"], values: [2] });
});

describe("dashboard authorization and endpoints", () => {
  it.each(["admin", "volunteer"])("allows an active %s to view statistics", async (role) => {
    mocks.findProfileByAuthUserId.mockResolvedValue({ ...profile, role });
    const response = await request(app)
      .get("/api/v1/dashboard/stats")
      .set(tokenHeader)
      .expect(200);
    expect(response.body.data.totalUsers).toBe(10);
  });

  it("denies donor access", async () => {
    mocks.findProfileByAuthUserId.mockResolvedValue({ ...profile, role: "donor" });
    await request(app).get("/api/v1/dashboard/stats").set(tokenHeader).expect(403);
    expect(mocks.getDashboardStatistics).not.toHaveBeenCalled();
  });

  it.each(["daily", "weekly", "monthly"])("returns %s trend data", async (period) => {
    const response = await request(app)
      .get(`/api/v1/dashboard/donation-trends?period=${period}`)
      .set(tokenHeader)
      .expect(200);
    expect(mocks.getDonationTrends).toHaveBeenCalledWith(period);
    expect(response.body.data).toEqual({ labels: ["Mon"], values: [2] });
  });
});
