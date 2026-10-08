import { getDashboardStatistics, getDonationTrends } from "../services/dashboard.service.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getStats = async (_request, response) =>
  sendSuccess(response, {
    message: "Dashboard statistics retrieved successfully",
    data: await getDashboardStatistics(),
  });

export const getTrends = async (request, response) =>
  sendSuccess(response, {
    message: "Donation trends retrieved successfully",
    data: await getDonationTrends(request.validated.query.period),
  });
