# Makrozoia Backend

Production-ready Node.js, Express, TypeScript, and Firebase Admin API for the Makrozoia Solutions LLC website.

## Features

- Firebase ID token verification for protected routes
- Firestore-backed lead, consultation, and project discovery storage
- Admin client dashboard APIs for reviewing intake details and tracking POC status
- Zod validation for all POST payloads
- Helmet security headers, CORS allow-listing, Morgan logging, and public endpoint rate limiting
- Central async error handling and clean service/controller/route layering

## API Endpoints

### Public

- `GET /health` — service health check
- `GET /api/firebase-config` — returns the public Firebase Web SDK configuration for the frontend
- `POST /api/contact` — contact form lead intake
- `POST /api/consultation-request` — consultation request intake

### Protected

Protected endpoints require `Authorization: Bearer <Firebase ID Token>`.

- `GET /api/me/company-profile` — reads `companyProfiles/{uid}`
- `GET /api/me/session` — returns the authenticated user's onboarding state, company profile, and latest project discovery session when onboarded
- `POST /api/project-discovery` — creates an authenticated project discovery submission
- `GET /api/project-discovery/my-submissions` — lists the authenticated user's submissions
- `GET /api/me/poc-status` — returns the authenticated user's latest POC status and related project discovery submission

### Admin

Admin endpoints require `Authorization: Bearer <Firebase ID Token>` plus a Firebase custom claim of `admin: true` or `role: admin`.

- `GET /api/admin/clients` — lists all project discovery clients with complete project intake details for an admin dashboard
- `GET /api/admin/intake` — lists all intake submissions across project discovery, contact submissions, and consultation requests for the admin dashboard
- `PATCH /api/admin/clients/:submissionId/poc-status` — updates a project discovery submission's POC status. Accepted `pocStatus` values are `submitted`, `accepted`, `in_progress`, `deployed`, and `delivered`; optional `note` captures internal status context

## Firestore Collections

- `users/{uid}` — reserved for Firebase/Auth user profile expansion
- `companyProfiles/{uid}` — company profile data read by protected APIs
- `contactSubmissions/{submissionId}` — public contact submissions
- `consultationRequests/{requestId}` — public consultation requests with `status: new`
- `projectDiscovery/{submissionId}` — authenticated project discovery submissions with `status`/`pocStatus` values of `submitted`, `accepted`, `in_progress`, `deployed`, or `delivered`; the newest submission is exposed as an onboarded user's previous session and client-facing POC status

## Environment Variables

Copy `.env.example` to `.env` and fill in Firebase service account values.

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port, defaults to `8080` |
| `NODE_ENV` | `development`, `test`, or `production` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins; empty allows server-to-server/no-origin requests and is permissive for development |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account client email |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key; keep quoted and preserve `\n` escapes |
| `FIREBASE_WEB_API_KEY` | Public Firebase Web API key used by the frontend for Firebase Auth signup/sign-in; must be the Web app key that starts with `AIza` |
| `FIREBASE_WEB_AUTH_DOMAIN` | Public Firebase Auth domain; defaults to `<FIREBASE_PROJECT_ID>.firebaseapp.com` when omitted |
| `FIREBASE_WEB_APP_ID` | Optional public Firebase Web app ID |
| `FIREBASE_WEB_MESSAGING_SENDER_ID` | Optional public Firebase messaging sender ID |
| `FIREBASE_WEB_STORAGE_BUCKET` | Optional public Firebase storage bucket |
| `FIREBASE_WEB_MEASUREMENT_ID` | Optional public Firebase Analytics measurement ID |

## Local Development

```bash
npm install
npm run dev
```

Build and run production output locally:

```bash
npm run build
npm start
```

## Validation and Security Notes

- The backend does not create Firebase Auth users. The frontend owns signup/sign-in through Firebase Auth.
- If signup or login fails with a generic message such as `Unable to create account. Please try again.` or `Unable to sign in. Check your credentials.`, first inspect the browser network request to `identitytoolkit.googleapis.com`. A request with `key=YOUR_FIREBASE_API_KEY`, `key=replace-with-firebase-web-api-key`, or any other example value means the frontend is using placeholder Firebase Web configuration. Set `FIREBASE_WEB_API_KEY` on the backend and use `GET /api/firebase-config`, or rebuild the frontend with the real Firebase Web config from the Firebase console. The value must be the Firebase Web app API key from Project settings > General > Your apps > Web app, and it normally starts with `AIza`. The backend rejects common placeholder values and malformed Firebase Web API keys at startup so this issue is visible during deployment instead of surfacing as a broken signup/sign-in form.
- Protected routes only verify Firebase ID tokens and attach the decoded token to `req.user`.
- Admin routes additionally require a Firebase custom claim of `admin: true` or `role: admin`.
- Request bodies are parsed by Express, validated with strict Zod schemas, and unknown keys are rejected.
- Public lead intake endpoints are rate limited to reduce spam.
- Secrets are loaded from environment variables and are never returned in API responses.

## Render Deployment Notes

1. Create a new Render Web Service from this repository.
2. Set the runtime to Node.js 20 or newer.
3. Use `npm install` as the build dependency installation step.
4. Set the build command to `npm run build`.
5. Set the start command to `npm start`.
6. Add all required environment variables in Render's dashboard.
7. Add your production frontend URL to `CORS_ORIGINS`.

## Frontend Contact Form Integration

Frontend contact forms should call `POST /api/contact` instead of writing directly to `contactSubmissions` with the Firebase Web SDK. Browser Firestore writes require public security rules, while this backend uses the Firebase Admin SDK behind a rate-limited and validated public endpoint. See `docs/frontend-contact-form.md` for an Angular `HttpClient` service example and CORS configuration notes.

## Example Requests

```bash
curl http://localhost:8080/health
```

```bash
curl http://localhost:8080/api/firebase-config
```

```bash
curl -X POST http://localhost:8080/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","message":"I would like to discuss automation."}'
```

```bash
curl http://localhost:8080/api/me/company-profile \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN"
```
