# API Contract

Base URLs:

- Authentication: `/api/auth/*`
- Application API: `/api/v1/*`

Private application routes require `Authorization: Bearer <jwt>`. Better Auth
session endpoints use the HTTP-only session cookie and credentialed requests.

## Response format

Application success:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Application error:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "field": "body.name", "message": "Validation message" }]
}
```

Better Auth routes return Better Auth's native response format. Typical status
codes are `200/201`, `400`, `401`, `403`, `404`, `409`, `429`, and `500`.

Paginated application data uses:

```json
{
  "items": [],
  "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
}
```

## Authentication

| Method | Route | Authentication | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/sign-up/email` | Public | Register and create session |
| POST | `/api/auth/sign-in/email` | Public | Login and create session |
| POST | `/api/auth/sign-out` | Session cookie | Logout |
| GET | `/api/auth/get-session` | Session cookie | Restore browser session |
| GET | `/api/auth/token` | Session cookie | Obtain short-lived JWT |
| GET | `/api/auth/jwks` | Public | JWT verification keys |
| GET | `/api/auth/ok` | Public | Better Auth readiness |

Registration body:

```json
{
  "name": "Test Donor",
  "email": "donor@example.com",
  "password": "minimum-8-characters",
  "avatar": "https://example.com/avatar.png",
  "bloodGroup": "A+",
  "district": "Dhaka",
  "upazila": "Savar"
}
```

Valid blood groups are `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, and
`O-`. `role` and `status` are rejected as registration input. New accounts are
always `donor` and `active`. Better Auth owns passwords and sessions.

Login body:

```json
{ "email": "donor@example.com", "password": "minimum-8-characters" }
```

## Health

| Method | Route | Authentication | Response data |
| --- | --- | --- | --- |
| GET | `/api/v1/health` | Public | `status`, `environment` |

## Users

| Method | Route | Access | Query/body |
| --- | --- | --- | --- |
| GET | `/api/v1/users/me` | Active user | — |
| PATCH | `/api/v1/users/me` | Active user and session cookie | Profile update body |
| GET | `/api/v1/users/search` | Active user | `bloodGroup`, `district`, `upazila`, `page`, `limit` |
| GET | `/api/v1/users` | Admin | `status=active|blocked`, `page`, `limit` |
| PATCH | `/api/v1/users/:id/status` | Admin | `{ "status": "active|blocked" }` |
| PATCH | `/api/v1/users/:id/role` | Admin | `{ "role": "donor|volunteer|admin" }` |

Allowed self-profile fields:

```json
{
  "name": "Updated Name",
  "avatar": "https://example.com/avatar.png",
  "bloodGroup": "O+",
  "district": "Dhaka",
  "upazila": "Savar"
}
```

Email, auth user ID, role, status, and timestamps cannot be self-edited. Donor
search always returns active donor profiles only and projects just ID, name,
avatar, blood group, district, and upazila.

## Donation requests

| Method | Route | Access | Query/body |
| --- | --- | --- | --- |
| GET | `/api/v1/donations` | Public | Pending only; filters and pagination |
| POST | `/api/v1/donations` | Active donor | Create body |
| GET | `/api/v1/donations/mine` | Active user | `status`, `page`, `limit` |
| GET | `/api/v1/donations/manage` | Admin/Volunteer | `status`, `bloodGroup`, `sort`, `page`, `limit` |
| GET | `/api/v1/donations/:id` | Active user | — |
| PATCH | `/api/v1/donations/:id` | Owner/Admin | Editable details |
| DELETE | `/api/v1/donations/:id` | Owner/Admin | — |
| POST | `/api/v1/donations/:id/confirm` | Active matching donor | — |
| PATCH | `/api/v1/donations/:id/status` | Owner/Admin/Volunteer | Status body |

Public filters: `bloodGroup`, `district`, `upazila`, `donationDate`, `page`, and
`limit`. Public records expose only request ID, recipient name/location, blood
group, date, and time.

Create body:

```json
{
  "recipientName": "Patient Name",
  "recipientDistrict": "Dhaka",
  "recipientUpazila": "Savar",
  "hospitalName": "General Hospital",
  "fullAddress": "123 Hospital Road, Dhaka",
  "bloodGroup": "A+",
  "donationDate": "2027-01-15",
  "donationTime": "14:30",
  "requestMessage": "Blood is needed for an operation."
}
```

Requester identity, initial `pending` status, donor fields, and timestamps are
server-owned. PATCH accepts only the nine fields shown above. Status body:

```json
{ "donationStatus": "done" }
```

Allowed transitions:

- confirmation: `pending -> inprogress`
- owner: `inprogress -> done|canceled`
- admin/volunteer: `pending -> canceled`, `inprogress -> done|canceled`
- `done` and `canceled` are terminal

Confirmation uses an atomic conditional update, rejects self-confirmation, and
requires a matching blood group.

## Dashboard

| Method | Route | Access | Query |
| --- | --- | --- | --- |
| GET | `/api/v1/dashboard/stats` | Admin/Volunteer | — |
| GET | `/api/v1/dashboard/donation-trends` | Admin/Volunteer | `period=daily|weekly|monthly` |

Statistics return `totalUsers`, `totalDonors`, `totalDonationRequests`,
`pendingRequests`, `inprogressRequests`, `completedRequests`,
`canceledRequests`, and `totalFunding`. Funding totals are BDT minor units.

Trend response:

```json
{
  "success": true,
  "message": "Donation trends retrieved successfully",
  "data": { "labels": ["Mon, Oct 5"], "values": [3] }
}
```

Daily, weekly, and monthly series contain 7 days, 8 weeks, and 12 months.

## Funding and Stripe

| Method | Route | Access | Query/body |
| --- | --- | --- | --- |
| GET | `/api/v1/fundings` | Public | `page`, `limit` |
| POST | `/api/v1/fundings/checkout` | Active user | `{ "amount": 150 }` |
| POST | `/api/v1/fundings/webhook` | Stripe signature | Raw Stripe event |

Checkout `amount` is BDT major units with at most two decimal places. The
application minimum is 100 BDT. The server converts it to minor units and
returns `checkoutUrl` and `sessionId`. Funding history includes contributor
name, `amountMinor`, display `amount`, currency, and funding date; only paid
records are returned.

The webhook accepts `checkout.session.completed` and
`checkout.session.async_payment_succeeded`. It stores only signed, paid, BDT
sessions tagged for this application. `stripeSessionId` is unique, so retries
are idempotent.

## Contact

| Method | Route | Access | Body |
| --- | --- | --- | --- |
| POST | `/api/v1/contacts` | Public, rate limited | Contact body |

```json
{
  "name": "Visitor Name",
  "email": "visitor@example.com",
  "message": "I would like more information."
}
```

The response contains only the stored contact ID.

## Role permissions

| Capability | Donor | Volunteer | Admin |
| --- | --- | --- | --- |
| Manage own profile | Yes | Yes | Yes |
| Search active donors | Yes | Yes | Yes |
| Create request | Yes | No | No |
| Manage own requests | Yes | Status if owner | Yes |
| Confirm matching request | Yes | No | No |
| View all requests | No | Yes | Yes |
| Update request status | Own request | Yes | Yes |
| Edit/delete unrelated request | No | No | Yes |
| View dashboard statistics | No | Yes | Yes |
| Manage users and roles | No | No | Yes |

## React, Better Auth, and Axios

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

Use `api` for public routes and `secureApi` for private application routes.
After refresh, call `authClient.getSession()` or `authClient.token()`. The
HTTP-only session cookie restores the session and issues a fresh short-lived
JWT. Do not store session cookies or passwords in JavaScript-accessible storage.
