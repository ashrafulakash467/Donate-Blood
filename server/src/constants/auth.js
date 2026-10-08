export const BLOOD_GROUPS = Object.freeze([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);

export const USER_ROLES = Object.freeze({
  DONOR: "donor",
  VOLUNTEER: "volunteer",
  ADMIN: "admin",
});

export const USER_STATUSES = Object.freeze({
  ACTIVE: "active",
  BLOCKED: "blocked",
});

export const JWT_EXPIRATION = "15m";
export const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;
