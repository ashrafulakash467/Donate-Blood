import express, { Router } from "express";
import { handleFundingWebhook } from "../controllers/funding.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const fundingWebhookRouter = Router();
fundingWebhookRouter.post(
  "/",
  express.raw({ type: "application/json", limit: "1mb" }),
  asyncHandler(handleFundingWebhook),
);

export default fundingWebhookRouter;
