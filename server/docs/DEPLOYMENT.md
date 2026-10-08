# Deployment Guide

## Architecture

The root `index.js` default-exports the existing Express application. Local
startup remains in `src/index.js`, which initializes MongoDB and indexes before
calling `app.listen()`. Vercel imports the root entrypoint without opening a
listener and runs the app as one serverless Express function.

Current Vercel Express detection is zero-configuration, so no catch-all
`vercel.json` rewrite is used. All original request paths reach Express,
including `/api/auth/*`, `/api/v1/*`, and the Stripe raw-body webhook.

## Required production environment

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER/
MONGODB_DB_NAME=bloodDonationDB
BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters
BETTER_AUTH_URL=https://your-api.vercel.app
CLIENT_URL=https://your-frontend.example.com
STRIPE_SECRET_KEY=sk_live_or_test_value
STRIPE_WEBHOOK_SECRET=whsec_value
```

`CLIENT_URL` supports comma-separated exact origins for production and preview
frontends. Production `BETTER_AUTH_URL` and every `CLIENT_URL` origin must use
HTTPS. Generate the auth secret with a cryptographically secure password
generator; never reuse the Stripe key or a user password.

## MongoDB Atlas

1. Create the `bloodDonationDB` database and a least-privilege database user.
2. Add Vercel-compatible network access. Do not expose broader access than the
   deployment requires when a private networking option is available.
3. Put the SRV connection string only in Vercel environment variables.
4. Confirm that the user can create collections/indexes and read/write the four
   application collections plus Better Auth collections.
5. The app reuses one cached `MongoClient` and one connection promise per warm
   function instance. Do not close it after requests.

## Better Auth

1. Set `BETTER_AUTH_URL` to the final backend origin without `/api/auth`.
2. Set `CLIENT_URL` to the exact frontend origin.
3. Configure the frontend Better Auth client with the backend origin,
   `credentials: "include"`, and `jwtClient()`.
4. Production cookies are HTTP-only, Secure, and `SameSite=None` for a separate
   HTTPS frontend origin.

## Stripe

1. Add `STRIPE_SECRET_KEY` in Vercel.
2. In Stripe Workbench/Webhooks, register:
   `https://your-api.vercel.app/api/v1/fundings/webhook`.
3. Subscribe to `checkout.session.completed` and
   `checkout.session.async_payment_succeeded`.
4. Copy that endpoint's `whsec_...` secret into `STRIPE_WEBHOOK_SECRET`.
5. Use test-mode keys and cards first. Switch both the API key and endpoint
   secret together when moving to live mode.

## Deploy

Set the Vercel project root to the `server` directory. Do not configure a build
command or output directory.

Dashboard workflow:

1. Import the server Git repository in Vercel.
2. Select `server` as Root Directory if this is a monorepo.
3. Add every production environment variable.
4. Deploy, then set the final deployment/custom domain as `BETTER_AUTH_URL`.
5. Redeploy after changing that URL.

CLI workflow:

```bash
npm install -g vercel
vercel link
vercel env add NODE_ENV production
vercel env add MONGODB_URI production
vercel env add MONGODB_DB_NAME production
vercel env add BETTER_AUTH_SECRET production
vercel env add BETTER_AUTH_URL production
vercel env add CLIENT_URL production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel --prod
```

## Initial admin promotion

Register the intended administrator normally first. Never commit the email or
password. In Atlas `mongosh`, replace the placeholder email and run this once:

```js
const adminEmail = "replace-with-registered-admin@example.com".toLowerCase();
const session = db.getMongo().startSession();
const appDb = session.getDatabase("bloodDonationDB");

await session.withTransaction(async () => {
  const profile = await appDb.profiles.findOne({ email: adminEmail });
  const authUser = await appDb.user.findOne({ email: adminEmail });
  if (!profile || !authUser) throw new Error("Registered user/profile not found");
  if (profile.authUserId !== authUser._id.toString()) {
    throw new Error("Better Auth and profile identities do not match");
  }
  await appDb.profiles.updateOne(
    { _id: profile._id, role: "donor" },
    { $set: { role: "admin", updatedAt: new Date() } },
  );
  await appDb.user.updateOne(
    { _id: authUser._id },
    { $set: { role: "admin", updatedAt: new Date() } },
  );
});
session.endSession();
```

Verify the exact email and matched records before the update. Subsequent role
changes should use the protected admin API.

## Post-deployment verification

Replace the URL and test account values. Use a test database/account; do not run
destructive checks against production data.

```bash
curl -i https://YOUR_API/api/v1/health
curl -i https://YOUR_API/api/v1/missing
curl -i -X OPTIONS https://YOUR_API/api/v1/users/me \
  -H "Origin: https://YOUR_FRONTEND" \
  -H "Access-Control-Request-Method: GET"
```

Then verify in order:

1. Register via `/api/auth/sign-up/email` and retain its cookie.
2. Login and call `/api/auth/get-session` with that cookie.
3. Call `/api/auth/token`, then `/api/v1/users/me` with the Bearer JWT.
4. Create and publicly list a disposable donation request in the test database.
5. Confirm donor/admin/volunteer restrictions with dedicated test accounts.
6. Create a Stripe test Checkout and complete it with a Stripe test card.
7. Confirm one paid funding record after webhook delivery; resend the event and
   confirm no duplicate appears.
8. Verify Atlas connection metrics/logs and Vercel Function logs.
9. Confirm error responses never contain connection strings, keys, or stacks.

No deployed URL was available during repository preparation, so these remote
checks must be completed after deployment.
