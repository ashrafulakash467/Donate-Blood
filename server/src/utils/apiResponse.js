export const sendSuccess = (
  response,
  { statusCode = 200, message = "Operation successful", data = {} } = {},
) => response.status(statusCode).json({ success: true, message, data });

export const sendError = (
  response,
  { statusCode = 500, message = "Internal server error", errors = [] } = {},
) => response.status(statusCode).json({ success: false, message, errors });
