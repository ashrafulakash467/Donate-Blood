import { ApiError } from "../utils/ApiError.js";

export const validateRequest = (schemas) => (request, _response, next) => {
  const validated = {};

  for (const [location, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(request[location]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: [location, ...issue.path].join("."),
        message: issue.message,
      }));
      return next(new ApiError(400, "Validation failed", errors));
    }
    validated[location] = result.data;
  }

  request.validated = { ...request.validated, ...validated };
  return next();
};
