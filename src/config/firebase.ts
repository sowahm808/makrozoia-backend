import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { env } from './env.js';

const privateKey = env.FIREBASE_PRIVATE_KEY
  .replace(/^["']|["']$/g, '')
  .replace(/\\n/g, '\n')
  .trim();

if (
  !privateKey.startsWith('-----BEGIN PRIVATE KEY-----') ||
  !privateKey.endsWith('-----END PRIVATE KEY-----')
) {
  throw new Error(
    'Invalid FIREBASE_PRIVATE_KEY. Copy the complete private_key value from the Firebase service account JSON file.',
  );
}

const existingApp = getApps()[0];

const app =
  existingApp ??
  initializeApp({
    credential: cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);