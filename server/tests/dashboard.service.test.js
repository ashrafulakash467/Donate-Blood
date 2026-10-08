import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCollection: vi.fn(),
  initializeIndexes: vi.fn(),
}));
vi.mock("../src/config/db.js", () => ({ getCollection: mocks.getCollection }));
vi.mock("../src/config/indexes.js", () => ({ initializeIndexes: mocks.initializeIndexes }));

import { getDashboardStatistics, getDonationTrends } from "../src/services/dashboard.service.js";

let profiles;
let donations;
let fundings;

beforeEach(() => {
  vi.clearAllMocks();
  profiles = { countDocuments: vi.fn() };
  donations = { countDocuments: vi.fn(), aggregate: vi.fn() };
  fundings = { aggregate: vi.fn() };
  mocks.getCollection.mockImplementation(async (name) => ({ profiles, donationRequests: donations, fundings })[name]);
  mocks.initializeIndexes.mockResolvedValue(undefined);
});

describe("dashboard data", () => {
  it("counts real profile/request states and only paid funding", async () => {
    profiles.countDocuments.mockImplementation(async (query) => query.role === "donor" ? 8 : 10);
    donations.countDocuments.mockImplementation(async (query) => {
      if (!query.donationStatus) return 20;
      return { pending: 5, inprogress: 4, done: 9, canceled: 2 }[query.donationStatus];
    });
    fundings.aggregate.mockReturnValue({ toArray: vi.fn().mockResolvedValue([{ total: 45600 }]) });

    await expect(getDashboardStatistics()).resolves.toEqual({
      totalUsers: 10,
      totalDonors: 8,
      totalDonationRequests: 20,
      pendingRequests: 5,
      inprogressRequests: 4,
      completedRequests: 9,
      canceledRequests: 2,
      totalFunding: 45600,
    });
    expect(fundings.aggregate).toHaveBeenCalledWith([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$amountMinor" } } },
    ]);
  });

  it.each([
    ["daily", 7, "day", "2026-10-08"],
    ["weekly", 8, "week", "2026-10-05"],
    ["monthly", 12, "month", "2026-10-01"],
  ])("builds zero-filled %s chart series", async (period, length, unit, latestBucket) => {
    donations.aggregate.mockReturnValue({
      toArray: vi.fn().mockResolvedValue([{ _id: new Date(`${latestBucket}T00:00:00.000Z`), value: 3 }]),
    });
    const result = await getDonationTrends(period, new Date("2026-10-08T12:00:00.000Z"));
    expect(result.labels).toHaveLength(length);
    expect(result.values).toHaveLength(length);
    expect(result.values.at(-1)).toBe(3);
    const pipeline = donations.aggregate.mock.calls[0][0];
    expect(pipeline[1].$group._id.$dateTrunc.unit).toBe(unit);
  });
});
