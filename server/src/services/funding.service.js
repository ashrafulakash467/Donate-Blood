import { getCollection } from "../config/db.js";
import { getAllowedOrigins } from "../config/env.js";
import { initializeIndexes } from "../config/indexes.js";
import { getStripe } from "../config/stripe.js";
import { APPLICATION_COLLECTIONS } from "../constants/collections.js";
import {
  CURRENCY_MINOR_UNIT_FACTOR,
  FUNDING_CURRENCY,
  FUNDING_PAYMENT_STATUS,
  FUNDING_PURPOSE,
} from "../constants/funding.js";
import { ApiError } from "../utils/ApiError.js";

const getFundingsCollection = async () => {
  await initializeIndexes();
  return getCollection(APPLICATION_COLLECTIONS.FUNDINGS);
};

export const createFundingCheckout = async (amount, profile) => {
  const amountMinor = Math.round(amount * CURRENCY_MINOR_UNIT_FACTOR);
  const metadata = {
    purpose: FUNDING_PURPOSE,
    authUserId: profile.authUserId,
    userName: profile.name,
    userEmail: profile.email,
  };
  const clientOrigin = getAllowedOrigins()[0];
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    client_reference_id: profile.authUserId,
    customer_email: profile.email,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: FUNDING_CURRENCY,
        unit_amount: amountMinor,
        product_data: { name: "Blood Donation Support Fund" },
      },
    }],
    metadata,
    payment_intent_data: { metadata },
    success_url: `${clientOrigin}/funding/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientOrigin}/funding`,
  });

  if (!session.url) throw new ApiError(502, "Stripe did not return a Checkout URL");
  return { checkoutUrl: session.url, sessionId: session.id };
};

export const listCompletedFundings = async ({ page, limit }) => {
  const fundings = await getFundingsCollection();
  const query = { paymentStatus: FUNDING_PAYMENT_STATUS.PAID };
  const skip = (page - 1) * limit;
  const [records, total] = await Promise.all([
    fundings.find(query, {
      projection: {
        userName: 1,
        amountMinor: 1,
        currency: 1,
        fundingDate: 1,
      },
    }).sort({ fundingDate: -1, _id: 1 }).skip(skip).limit(limit).toArray(),
    fundings.countDocuments(query),
  ]);

  return {
    items: records.map((record) => ({
      ...record,
      amount: record.amountMinor / CURRENCY_MINOR_UNIT_FACTOR,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

const paymentIntentId = (paymentIntent) =>
  typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id ?? null;

export const recordPaidFunding = async (session, eventCreatedAt) => {
  if (session.payment_status !== "paid" || session.metadata?.purpose !== FUNDING_PURPOSE) {
    return { recorded: false, reason: "ignored" };
  }

  const amountMinor = session.amount_total;
  const { authUserId, userName, userEmail } = session.metadata;
  if (
    !session.id ||
    !Number.isSafeInteger(amountMinor) ||
    amountMinor <= 0 ||
    session.currency !== FUNDING_CURRENCY ||
    !authUserId ||
    !userName ||
    !userEmail
  ) {
    throw new ApiError(400, "Paid Checkout Session is missing required funding data");
  }

  const fundings = await getFundingsCollection();
  const now = new Date();
  const fundingDate = eventCreatedAt ? new Date(eventCreatedAt * 1000) : now;
  try {
    const result = await fundings.updateOne(
      { stripeSessionId: session.id },
      {
        $setOnInsert: {
          authUserId,
          userName,
          userEmail,
          amountMinor,
          currency: session.currency,
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId(session.payment_intent),
          paymentStatus: FUNDING_PAYMENT_STATUS.PAID,
          fundingDate,
          createdAt: now,
        },
      },
      { upsert: true },
    );
    return { recorded: result.upsertedCount === 1, duplicate: result.upsertedCount !== 1 };
  } catch (error) {
    if (error?.code === 11000) return { recorded: false, duplicate: true };
    throw error;
  }
};

export const processFundingWebhookEvent = async (event) => {
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) {
    return { processed: false };
  }
  return { processed: true, ...(await recordPaidFunding(event.data.object, event.created)) };
};
