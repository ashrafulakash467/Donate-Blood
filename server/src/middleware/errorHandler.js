import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { sendError } from "../utils/apiResponse.js";

export const notFoundHandler = (request, _response, next) => {
  next(new ApiError(404, `Route not found: ${request.method} ${request.originalUrl}`));
};

export const errorHandler = (error, _request, response, next) => {
  if (response.headersSent) return next(error);

  if (error instanceof ZodError) {
    return sendError(response, {
      statusCode: 400,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error instanceof SyntaxError && error.type === "entity.parse.failed") {
    return sendError(response, {
      statusCode: 400,
      message: "Invalid JSON body",
      errors: [],
    });
  }

  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message = error instanceof ApiError ? error.message : "Internal server error";
  const errors = error instanceof ApiError ? error.errors : [];

  if (statusCode >= 500 && process.env.NODE_ENV !== "test") {
    console.error("Unhandled API error", {
      name: error?.name ?? "Error",
      code: error?.code ?? "INTERNAL_ERROR",
    });
  }
  return sendError(response, { statusCode, message, errors });
};
