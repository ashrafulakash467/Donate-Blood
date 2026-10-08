import { USER_ROLES } from "../constants/auth.js";
import { APPLICATION_COLLECTIONS } from "../constants/collections.js";
import { DONATION_STATUSES } from "../constants/donation.js";
import { FUNDING_PAYMENT_STATUS } from "../constants/funding.js";
import { getCollection } from "../config/db.js";
import { initializeIndexes } from "../config/indexes.js";

const getDashboardCollections = async () => {
  await initializeIndexes();
  const [profiles, donations, fundings] = await Promise.all([
    getCollection(APPLICATION_COLLECTIONS.PROFILES),
    getCollection(APPLICATION_COLLECTIONS.DONATION_REQUESTS),
    getCollection(APPLICATION_COLLECTIONS.FUNDINGS),
  ]);
  return { profiles, donations, fundings };
};

export const getDashboardStatistics = async () => {
  const { profiles, donations, fundings } = await getDashboardCollections();
  const [
    totalUsers,
    totalDonors,
    totalDonationRequests,
    pendingRequests,
    inprogressRequests,
    completedRequests,
    canceledRequests,
    fundingTotals,
  ] = await Promise.all([
    profiles.countDocuments({}),
    profiles.countDocuments({ role: USER_ROLES.DONOR }),
    donations.countDocuments({}),
    donations.countDocuments({ donationStatus: DONATION_STATUSES.PENDING }),
    donations.countDocuments({ donationStatus: DONATION_STATUSES.IN_PROGRESS }),
    donations.countDocuments({ donationStatus: DONATION_STATUSES.DONE }),
    donations.countDocuments({ donationStatus: DONATION_STATUSES.CANCELED }),
    fundings.aggregate([
      { $match: { paymentStatus: FUNDING_PAYMENT_STATUS.PAID } },
      { $group: { _id: null, total: { $sum: "$amountMinor" } } },
    ]).toArray(),
  ]);

  return {
    totalUsers,
    totalDonors,
    totalDonationRequests,
    pendingRequests,
    inprogressRequests,
    completedRequests,
    canceledRequests,
    totalFunding: fundingTotals[0]?.total ?? 0,
  };
};

const startOfUtcDay = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const startOfUtcWeek = (date) => {
  const start = startOfUtcDay(date);
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  return start;
};

const startOfUtcMonth = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const buildBuckets = (period, now) => {
  const settings = {
    daily: { count: 7, unit: "day", start: startOfUtcDay },
    weekly: { count: 8, unit: "week", start: startOfUtcWeek },
    monthly: { count: 12, unit: "month", start: startOfUtcMonth },
  }[period];
  const latest = settings.start(now);

  return Array.from({ length: settings.count }, (_, index) => {
    const offset = index - settings.count + 1;
    const bucket = new Date(latest);
    if (period === "daily") bucket.setUTCDate(bucket.getUTCDate() + offset);
    if (period === "weekly") bucket.setUTCDate(bucket.getUTCDate() + offset * 7);
    if (period === "monthly") bucket.setUTCMonth(bucket.getUTCMonth() + offset);
    return bucket;
  });
};

const bucketKey = (date) => new Date(date).toISOString().slice(0, 10);

const bucketLabel = (date, period) => {
  if (period === "daily") {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  }
  if (period === "weekly") {
    return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}`;
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
};

export const getDonationTrends = async (period, now = new Date()) => {
  await initializeIndexes();
  const donations = await getCollection(APPLICATION_COLLECTIONS.DONATION_REQUESTS);
  const buckets = buildBuckets(period, now);
  const dateTrunc = { date: "$createdAt", unit: period === "daily" ? "day" : period.slice(0, -2) };
  if (period === "weekly") dateTrunc.startOfWeek = "monday";

  const rows = await donations.aggregate([
    { $match: { createdAt: { $gte: buckets[0] } } },
    { $group: { _id: { $dateTrunc: dateTrunc }, value: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]).toArray();
  const counts = new Map(rows.map((row) => [bucketKey(row._id), row.value]));

  return {
    labels: buckets.map((bucket) => bucketLabel(bucket, period)),
    values: buckets.map((bucket) => counts.get(bucketKey(bucket)) ?? 0),
  };
};
