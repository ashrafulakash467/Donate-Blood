import { Router } from "express";
import { getEnvironment } from "../config/env.js";
import { sendSuccess } from "../utils/apiResponse.js";

const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  const { NODE_ENV } = getEnvironment();
  return sendSuccess(response, {
    message: "Service is healthy",
    data: { status: "ok", environment: NODE_ENV },
  });
});

export default healthRouter;
