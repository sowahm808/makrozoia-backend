# Frontend contact form integration

The public contact form should submit to the backend API instead of writing directly to Firestore with the Firebase Web SDK.

Direct browser writes such as `setDoc(doc(collection(firestore, 'contactSubmissions')), ...)` depend on permissive Firestore security rules for an unauthenticated public collection. This backend already exposes a public, rate-limited, Zod-validated endpoint that writes `contactSubmissions` with the Firebase Admin SDK, so the frontend does not need Firestore write access for contact submissions.

## Angular service example

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
  phone?: string;
  companyName?: string;
  source?: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'https://YOUR_BACKEND_HOST';

  submitContactForm(value: ContactSubmission): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.apiBaseUrl}/api/contact`, value));
  }
}
```

If the frontend stores API URLs in Angular environments, replace `apiBaseUrl` with the environment value used by the deployed app.

## Required backend configuration

Set `CORS_ORIGINS` on the backend to the exact frontend origin, for example:

```bash
CORS_ORIGINS=https://www.example.com,https://example.com
```

A mismatched origin will cause the browser to block the request before the backend can create the contact submission.

## Expected payload

`POST /api/contact` accepts this strict JSON payload:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "message": "I would like to discuss automation.",
  "phone": "+1 555 0100",
  "companyName": "Example Co",
  "source": "website-contact-form"
}
```

Only `name`, `email`, and `message` are required. Unknown fields are rejected.
