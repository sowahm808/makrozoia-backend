import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const placeholderPatterns = [
  /^YOUR_[A-Z0-9_]+$/i,
  /^replace-with-/i,
  /^your-/i,
  /^example-/i,
];

const nonPlaceholderString = (name: string) => z.string().trim().min(1, `${name} is required`).refine(
  (value) => !placeholderPatterns.some((pattern) => pattern.test(value)),
  `${name} must be set to a real value, not an example placeholder`,
);

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8080),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGINS: z.string().default(''),
  FIREBASE_PROJECT_ID: nonPlaceholderString('FIREBASE_PROJECT_ID'),
  FIREBASE_CLIENT_EMAIL: z.string().email('FIREBASE_CLIENT_EMAIL must be valid'),
  FIREBASE_PRIVATE_KEY: nonPlaceholderString('FIREBASE_PRIVATE_KEY'),
  FIREBASE_WEB_API_KEY: nonPlaceholderString('FIREBASE_WEB_API_KEY').optional(),
  FIREBASE_WEB_AUTH_DOMAIN: nonPlaceholderString('FIREBASE_WEB_AUTH_DOMAIN').optional(),
  FIREBASE_WEB_APP_ID: nonPlaceholderString('FIREBASE_WEB_APP_ID').optional(),
  FIREBASE_WEB_MESSAGING_SENDER_ID: nonPlaceholderString('FIREBASE_WEB_MESSAGING_SENDER_ID').optional(),
  FIREBASE_WEB_STORAGE_BUCKET: nonPlaceholderString('FIREBASE_WEB_STORAGE_BUCKET').optional(),
  FIREBASE_WEB_MEASUREMENT_ID: nonPlaceholderString('FIREBASE_WEB_MEASUREMENT_ID').optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const firebaseWebConfig = parsed.data.FIREBASE_WEB_API_KEY ? {
  apiKey: parsed.data.FIREBASE_WEB_API_KEY,
  authDomain: parsed.data.FIREBASE_WEB_AUTH_DOMAIN ?? `${parsed.data.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: parsed.data.FIREBASE_PROJECT_ID,
  appId: parsed.data.FIREBASE_WEB_APP_ID,
  messagingSenderId: parsed.data.FIREBASE_WEB_MESSAGING_SENDER_ID,
  storageBucket: parsed.data.FIREBASE_WEB_STORAGE_BUCKET,
  measurementId: parsed.data.FIREBASE_WEB_MEASUREMENT_ID,
} : undefined;

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
  firebasePrivateKey: parsed.data.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  firebaseWebConfig,
};
