import { getStripe, getStripeWebhookSecret } from "../config/stripe.js";
import {
  createFundingCheckout,
  listCompletedFundings,
  processFundingWebhookEvent,
} from "../services/funding.service.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const getFundings = async (request, response) =>
  sendSuccess(response, {
    message: "Funding history retrieved successfully",
    data: await listCompletedFundings(request.validated.query),
  });

export const createCheckout = async (request, response) =>
  sendSuccess(response, {
    statusCode: 201,
    message: "Stripe Checkout Session created successfully",
    data: await createFundingCheckout(request.validated.body.amount, request.profile),
  });

export const handleFundingWebhook = async (request, response) => {
  const signature = request.get("stripe-signature");
  if (!signature) throw new ApiError(400, "Missing Stripe webhook signature");

  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      request.body,
      signature,
      getStripeWebhookSecret(),
    );
  } catch {
    throw new ApiError(400, "Invalid Stripe webhook signature");
  }

  const result = await processFundingWebhookEvent(event);
  return sendSuccess(response, {
    message: "Stripe webhook processed successfully",
    data: result,
  });
};
