import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { env } from './env.js';

const existingApp = getApps()[0];

const app = existingApp ?? initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.firebasePrivateKey,
  }),
});

export const firebaseAuth = getAuth(app);
export const firestore = getFirestore(app);
