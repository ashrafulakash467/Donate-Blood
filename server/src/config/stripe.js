import Stripe from "stripe";
import { getEnvironment } from "./env.js";

let stripe;

export const getStripe = () => {
  const { STRIPE_SECRET_KEY } = getEnvironment();
  if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is required to use Stripe");
  if (!stripe) stripe = new Stripe(STRIPE_SECRET_KEY);
  return stripe;
};

export const getStripeWebhookSecret = () => {
  const { STRIPE_WEBHOOK_SECRET } = getEnvironment();
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required to verify Stripe webhooks");
  }
  return STRIPE_WEBHOOK_SECRET;
};
