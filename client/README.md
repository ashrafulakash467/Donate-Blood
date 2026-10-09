# LifeFlow Blood Donation Client

LifeFlow is the React frontend for an Assignment 10 blood donation management platform. It connects authenticated donors, volunteers, and administrators to the separate Express, Better Auth, MongoDB Atlas, and Stripe backend.

## Features

- Better Auth email/password registration, login, persistent sessions, and logout
- Short-lived Better Auth JWT credentials for private REST APIs
- Public pending donation requests and filtered donor search
- Private donation details and atomic donor confirmation
- Profile editing with protected identity, role, and status fields
- Donor request creation, editing, deletion, filtering, and status management
- Admin user, role, status, donation request, statistics, and trend management
- Volunteer statistics and status-only request management
- Stripe Checkout funding with webhook-confirmed funding history
- Validated contact form and Bangladesh district/upazila selection
- Responsive HeroUI and Gravity UI interface with role-aware navigation

## Technology

- React 19 and Vite
- React Router
- HeroUI and Gravity UI
- Tailwind CSS
- Axios
- Better Auth React client and JWT client plugin
- React Hook Form and Zod
- Recharts
- Stripe-hosted Checkout
- Vitest

## Project structure

```text
src/
├── assets/          Static and optimized image assets
├── components/      Shared, dashboard, donation, and form components
├── config/          Environment, endpoint, and navigation configuration
├── contexts/        Authentication provider
├── data/            Blood groups and Bangladesh location data
├── hooks/           Shared React hooks
├── layouts/         Public, authentication, and dashboard layouts
├── lib/             Better Auth client
├── pages/           Public, auth, shared, and role dashboards
├── routes/          Router and permission guards
├── services/        Public and JWT-authenticated API clients
├── utils/           Formatting, errors, permissions, and Stripe helpers
└── validators/      Zod form schemas
tests/               Vitest contract and security-focused tests
```

## Installation

Requirements: Node.js LTS and the LifeFlow server project.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The development server uses the URL printed by Vite, normally `http://localhost:5173`.

## Environment variables

```env
VITE_SERVER_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_IMGBB_API_KEY=
VITE_CONTACT_NUMBER=+880 1700 000000
```

- `VITE_SERVER_URL`: Backend origin used by Better Auth.
- `VITE_API_URL`: Backend `/api/v1` base URL used by Axios.
- `VITE_STRIPE_PUBLISHABLE_KEY`: Safe client-key placeholder. Current hosted Checkout flow redirects to the server-created URL and does not require this key at runtime.
- `VITE_IMGBB_API_KEY`: ImgBB API key used for avatar upload. Create it from the ImgBB API page, add it to `.env.local`, and restart Vite after changing it. Like every `VITE_` variable, it is visible to the browser, so restrict and rotate it from the provider when needed.
- `VITE_CONTACT_NUMBER`: Optional public support number.

All `VITE_` values are visible in the browser bundle. Never place MongoDB credentials, `BETTER_AUTH_SECRET`, Stripe secret keys, or webhook secrets in the client environment.

## Backend connection

The backend must expose:

- Better Auth under `/api/auth/*`
- Application APIs under `/api/v1/*`
- The frontend production origin in backend `CLIENT_URL`/CORS and Better Auth `trustedOrigins`
- An HTTPS `BETTER_AUTH_URL` in production

Axios includes credentials when needed. Private API calls obtain a JWT through `authClient.token()` and send it as `Authorization: Bearer <token>`. JWTs are not stored in local storage.

For reliable production cookies, prefer frontend and backend custom subdomains under the same parent domain. Cross-site browser cookie restrictions, especially Safari ITP, can affect authentication when unrelated Vercel domains are used.

## Routes and permissions

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Homepage and contact form |
| `/login` | Public | Sign in |
| `/register` | Public | Donor registration |
| `/donation-requests` | Public | Pending donation requests |
| `/search` | Page public; API requires active user | Search active donors |
| `/donation-requests/:id` | Active user | Full request details and eligible donor confirmation |
| `/funding` | Active user | Confirmed funding history and Stripe Checkout |
| `/dashboard` | Active user | Role-specific dashboard |
| `/dashboard/profile` | Active user | Profile management |
| `/dashboard/my-donation-requests` | Donor | Own requests |
| `/dashboard/create-donation-request` | Donor | Create request |
| `/dashboard/edit-donation-request/:id` | Owner donor or admin | Edit allowlisted request details |
| `/dashboard/all-users` | Admin | User role and status management |
| `/dashboard/all-blood-donation-request` | Admin or volunteer | Staff request management |

Client guards improve navigation and usability; the backend remains authoritative for every permission.

## Commands

```bash
npm run dev       # Start Vite development server
npm run test      # Run Vitest in watch mode
npm run test:run  # Run all tests once
npm run lint      # Run Oxlint
npm run build     # Create the production dist directory
npm run preview   # Preview the production build
```

## Vercel deployment

1. Import the repository into Vercel.
2. Set the Root Directory to `client` when deploying from this monorepo.
3. Keep the detected framework as Vite, build command as `npm run build`, and output directory as `dist`.
4. Add production `VITE_SERVER_URL` and `VITE_API_URL` values using the deployed HTTPS backend URL.
5. Add `VITE_IMGBB_API_KEY` if avatar upload is required and the optional public contact number.
6. Redeploy after changing any `VITE_` variable because Vite embeds these at build time.
7. Add the final frontend origin to the backend `CLIENT_URL` allowlist and deploy the backend again.
8. Verify login, refresh persistence, CORS preflight, JWT requests, and Stripe return routes in a real browser.

`vercel.json` contains the Vite SPA fallback so BrowserRouter deep links resolve to `index.html`. Static assets continue to be served from Vercel's filesystem before the fallback rewrite.

## Deployment links

- Live frontend: `https://YOUR-FRONTEND.vercel.app`
- Live backend: `https://YOUR-BACKEND.vercel.app`
- Client repository: `https://github.com/YOUR-USERNAME/YOUR-CLIENT-REPOSITORY`
- Server repository: `https://github.com/YOUR-USERNAME/YOUR-SERVER-REPOSITORY`

Replace these placeholders before assignment submission. Do not commit real administrator credentials; submit them through the assignment's private credential fields.
