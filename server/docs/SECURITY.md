# Security Model

## Authentication and sessions

- Better Auth exclusively handles password hashing, credentials, sessions,
  logout, and authentication cookies.
- Passwords and session tokens are never copied to application profiles.
- New users receive server-owned `donor` and `active` defaults.
- Production cookies are HTTP-only, Secure, `SameSite=None`, and scoped to `/`.
- Better Auth trusted origins and Express CORS use the same exact allowlist.
- Private application APIs require a Better Auth-issued JWT. The server calls
  Better Auth verification; it does not trust decoded claims without signature,
  issuer, audience, and expiration verification.
- The verified JWT subject is resolved to the current database profile for each
  request. Blocked users are denied even if an earlier JWT still exists.

## Authorization

- Role decisions use the stored profile loaded from the verified auth user ID.
- Only admins can list/manage users, roles, and account status.
- Volunteer permissions are limited to viewing all donation requests, filtering,
  status updates, and dashboard statistics.
- Donation edit/delete checks ownership in the database. Requester identity and
  donor identity never come from client bodies.
- Confirmation uses an atomic `pending` and `donorUserId:null` condition to stop
  double assignment.
- Update schemas are strict allowlists; protected fields cannot be mass-assigned.

## Input and database safety

- Zod validates bodies, parameters, and query strings before controllers run.
- Schemas reject unknown keys, invalid ObjectIds, invalid dates/times, invalid
  blood groups, oversized text, and non-scalar filter input.
- Query objects are assembled by server code rather than accepting MongoDB
  operators from request bodies.
- MongoDB credentials come only from environment variables. Connection failures
  are replaced with a sanitized error and the connection URI is never returned.
- One `MongoClient` and connection promise are reused per warm process/function.
- Unique indexes protect profile identity/email and Stripe Checkout sessions.

## HTTP protection

- Helmet provides security headers and Express's identifying header is disabled.
- CORS allows only configured origins and supports credentialed Better Auth
  requests.
- General API traffic and contact submissions have rate limits.
- JSON/form bodies are limited to 1 MB.
- Centralized 404 and error middleware returns consistent JSON and hides internal
  errors, secrets, connection strings, and stack traces.

## Stripe

- Secret and webhook keys exist only in server environment variables.
- Checkout amount, currency, product, authenticated identity, metadata, success
  URL, and payment mode are constructed on the server.
- Payment status is never accepted from the browser.
- The webhook is mounted before JSON parsing and verifies the exact raw body with
  `Stripe-Signature` and the endpoint secret.
- Only paid BDT Checkout sessions tagged with this application's funding purpose
  are persisted. Unpaid and unrelated events do not affect totals.
- Retry safety uses an idempotent upsert plus a unique `stripeSessionId` index.

## Secrets and operations

- `.env`, `.env.local`, Vercel state, logs, coverage, and `node_modules` are
  ignored by Git.
- Production startup requires HTTPS auth/client origins and both Stripe secrets.
- Never commit admin credentials, Atlas users, Stripe keys, session cookies, or
  JWTs. Rotate a secret immediately if it appears in history or logs.
- Use separate test and production Atlas databases and Stripe modes.
- Promote the initial admin manually by exact normalized email, verify the auth
  user/profile relationship, and never store the admin password in the repo.

## Known boundaries

- Email verification and social login are intentionally not enabled.
- JWTs are short lived; blocking is enforced immediately on application APIs by
  checking the profile, while Better Auth session cookies remain managed by
  Better Auth.
- Rate limiting is per warm instance unless backed by an external shared store.
  For high-volume or adversarial deployments, add Vercel Firewall or a shared
  rate-limit store.
- Automated tests use mocks and an in-memory Better Auth database. Live Atlas,
  Stripe, DNS, and deployed CORS behavior require post-deployment smoke tests.
