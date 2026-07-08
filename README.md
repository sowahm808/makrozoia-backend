# Makrozoia Backend

Production-ready Node.js, Express, TypeScript, and Firebase Admin API for the Makrozoia Solutions LLC website.

## Features

- Firebase ID token verification for protected routes
- Firestore-backed lead, consultation, and project discovery storage
- Zod validation for all POST payloads
- Helmet security headers, CORS allow-listing, Morgan logging, and public endpoint rate limiting
- Central async error handling and clean service/controller/route layering

## API Endpoints

### Public

- `GET /health` — service health check
- `POST /api/contact` — contact form lead intake
- `POST /api/consultation-request` — consultation request intake

### Protected

Protected endpoints require `Authorization: Bearer <Firebase ID Token>`.

- `GET /api/me/company-profile` — reads `companyProfiles/{uid}`
- `POST /api/project-discovery` — creates an authenticated project discovery submission
- `GET /api/project-discovery/my-submissions` — lists the authenticated user's submissions

## Firestore Collections

- `users/{uid}` — reserved for Firebase/Auth user profile expansion
- `companyProfiles/{uid}` — company profile data read by protected APIs
- `contactMessages/{messageId}` — public contact submissions
- `consultationRequests/{requestId}` — public consultation requests with `status: new`
- `projectDiscovery/{submissionId}` — authenticated project discovery submissions with `status: submitted`

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
- Protected routes only verify Firebase ID tokens and attach the decoded token to `req.user`.
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

## Example Requests

```bash
curl http://localhost:8080/health
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
