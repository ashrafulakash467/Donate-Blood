# Blood Donation Management System API

Production-oriented backend for Assignment 10. It provides Better Auth account
management, verified JWT application APIs, role-based user and donation request
workflows, dashboard analytics, Stripe Checkout funding, and contact messages.

## Technology stack

- Node.js LTS and JavaScript ES Modules
- Express 5
- MongoDB Atlas with the native MongoDB driver
- Better Auth, MongoDB adapter, and Better Auth JWT plugin
- Zod validation
- Stripe Checkout and signed webhooks
- Helmet, CORS, and Express rate limiting
- Vitest and Supertest
- Vercel zero-configuration Express deployment

## Main features

- Email/password registration, login, persistent session, logout, and JWTs
- Active/blocked users with donor, volunteer, and admin roles
- Searchable donor profiles and protected admin user management
- Complete donation request lifecycle with atomic donor confirmation
- Admin/volunteer statistics and donation trend charts
- Paid-only, retry-safe Stripe funding ledger
- Validated and rate-limited contact messages
- Reusable MongoDB connections and idempotent indexes
- Standard application responses and centralized safe error handling

## Folder structure

```text
server/
├── api/
│   └── index.js                 # Compatibility serverless export
├── docs/
│   ├── API_CONTRACT.md
│   ├── DEPLOYMENT.md
│   └── SECURITY.md
├── src/
│   ├── config/                  # Environment, MongoDB, indexes, auth, Stripe
│   ├── constants/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js                   # Express app; never calls listen()
│   └── index.js                 # Local startup and app.listen()
├── tests/
├── .env.example
├── .gitignore
├── index.js                     # Vercel-recognized default app export
├── package.json
└── README.md
```

## Installation

Requires Node.js 22.12 or newer.

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and fill in local/test values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USER:PASSWORD@CLUSTER/
MONGODB_DB_NAME=bloodDonationDB
BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters
BETTER_AUTH_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_value
STRIPE_WEBHOOK_SECRET=whsec_value
```

Never commit `.env`, credentials, cookies, tokens, or admin passwords.

## Commands

```bash
npm run dev       # local server with nodemon
npm start         # local production-style Node process
npm test          # Vitest watch mode
npm run test:run  # one complete test run
```

Health check: `GET http://localhost:5000/api/v1/health`.

## MongoDB Atlas setup

1. Create an Atlas cluster, a least-privilege database user, and
   `bloodDonationDB`.
2. Configure network access for local development and the deployed backend.
3. Put the SRV URI in `MONGODB_URI`.
4. Start the server. It creates application collections and indexes
   idempotently. Better Auth owns `user`, `session`, `account`, and
   `verification`; application data uses `profiles`, `donationRequests`,
   `fundings`, and `contacts`.

The Mongo client and simultaneous connection promise are cached per warm
instance. Connections are not closed after requests.

## Better Auth and frontend integration

Registration accepts `name`, `email`, `password`, `avatar`, `bloodGroup`,
`district`, and `upazila`. The server assigns `donor` and `active`; privileged
roles cannot be self-assigned. Better Auth handles all password/session data.

```js
import axios from "axios";
import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  fetchOptions: { credentials: "include" },
  plugins: [jwtClient()],
});

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true,
});

export const secureApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true,
});

secureApi.interceptors.request.use(async (config) => {
  const { data, error } = await authClient.token();
  if (error) throw error;
  config.headers.Authorization = `Bearer ${data.token}`;
  return config;
});
```

After browser refresh, call `authClient.getSession()` or `authClient.token()`.
The HTTP-only session cookie restores the session and obtains a new short-lived
JWT. Keep JWTs in memory, not local storage.

## Endpoint overview

| Area | Method and route | Access |
| --- | --- | --- |
| Health | `GET /api/v1/health` | Public |
| Auth | `POST /api/auth/sign-up/email` | Public |
| Auth | `POST /api/auth/sign-in/email` | Public |
| Auth | `POST /api/auth/sign-out` | Session |
| Auth | `GET /api/auth/get-session` | Session |
| Auth | `GET /api/auth/token` | Session |
| User | `GET/PATCH /api/v1/users/me` | Active user |
| User | `GET /api/v1/users/search` | Active user |
| User | `GET /api/v1/users` | Admin |
| User | `PATCH /api/v1/users/:id/status` | Admin |
| User | `PATCH /api/v1/users/:id/role` | Admin |
| Donation | `GET /api/v1/donations` | Public pending list |
| Donation | `POST /api/v1/donations` | Active donor |
| Donation | `GET /api/v1/donations/mine` | Active user |
| Donation | `GET /api/v1/donations/manage` | Admin/Volunteer |
| Donation | `GET/PATCH/DELETE /api/v1/donations/:id` | Auth/Owner/Admin |
| Donation | `POST /api/v1/donations/:id/confirm` | Active donor |
| Donation | `PATCH /api/v1/donations/:id/status` | Owner/Admin/Volunteer |
| Dashboard | `GET /api/v1/dashboard/stats` | Admin/Volunteer |
| Dashboard | `GET /api/v1/dashboard/donation-trends` | Admin/Volunteer |
| Funding | `GET /api/v1/fundings` | Public paid history |
| Funding | `POST /api/v1/fundings/checkout` | Active user |
| Funding | `POST /api/v1/fundings/webhook` | Stripe signature |
| Contact | `POST /api/v1/contacts` | Public, rate limited |

See [API_CONTRACT.md](docs/API_CONTRACT.md) for request bodies, query
parameters, pagination, transitions, responses, and frontend examples.

## Role permissions

| Permission | Donor | Volunteer | Admin |
| --- | --- | --- | --- |
| Own profile | Manage | Manage | Manage |
| Create request | Yes | No | No |
| Own request | Manage | Status if owner | Manage |
| Confirm pending request | Matching donor | No | No |
| All request list | No | View/filter/status | Full management |
| Dashboard statistics | No | Yes | Yes |
| User/role/status management | No | No | Yes |

All permissions are enforced on the server.

## Stripe setup

Checkout accepts BDT major units and stores integer minor units. Configure the
Stripe endpoint:

```text
https://YOUR_BACKEND/api/v1/fundings/webhook
```

Subscribe to `checkout.session.completed` and
`checkout.session.async_payment_succeeded`. The webhook uses the raw request
body, validates `Stripe-Signature`, records paid application sessions only, and
uses unique Checkout Session IDs for retry safety.

## Bangladesh locations

Bundle the static `bd-districts.json` and `bd-upazilas.json` files from
[`ifahimreza/bangladesh-geojson`](https://github.com/ifahimreza/bangladesh-geojson)
in the frontend. Match `district_id` to the selected district `id`; no runtime
external location API is required.

## Vercel deployment

Set the Vercel project root to `server` and add all production environment
variables. The root `index.js` is a recognized default Express export, so no
legacy rewrite configuration is required. `src/app.js` contains no listener;
local startup remains in `src/index.js`.

Production requires HTTPS `BETTER_AUTH_URL`/`CLIENT_URL` and both Stripe
secrets. Full setup and remote smoke-test instructions are in
[DEPLOYMENT.md](docs/DEPLOYMENT.md). Security controls are documented in
[SECURITY.md](docs/SECURITY.md).

## Assignment submission

Fill these outside the repository/submission form:

- Admin email: `<provide privately>`
- Admin password: `<provide privately; never commit>`
- Frontend live URL: `<FRONTEND_LIVE_URL>`
- Backend live URL: `<BACKEND_LIVE_URL>`
- Client repository URL: `<CLIENT_REPOSITORY_URL>`
- Server repository URL: `<SERVER_REPOSITORY_URL>`

Register the administrator normally, then follow the exact-email manual Atlas
promotion procedure in `docs/DEPLOYMENT.md`. Do not add credentials to this
README or Git history.
