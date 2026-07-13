/// <reference types="node" />

import 'dotenv/config';
import { cert, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

async function main() {
  const uid = process.argv[2];

  if (!uid) {
    throw new Error('Usage: npx tsx scripts/admin/set-admin-claim.ts <firebase-user-uid>');
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n')
    .trim();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY');
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  await getAuth().setCustomUserClaims(uid, {
    admin: true,
  });

  console.log(`Admin claim assigned to user ${uid}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});