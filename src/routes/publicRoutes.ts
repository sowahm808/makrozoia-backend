import { Router } from 'express';
import { getFirebaseConfig, health, submitConsultationRequest, submitContact } from '../controllers/publicController.js';
import { publicApiLimiter } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validate.js';
import { consultationRequestSchema, contactSchema } from '../schemas/leadSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const publicRoutes = Router();

publicRoutes.get('/health', asyncHandler(health));
publicRoutes.get('/api/firebase-config', asyncHandler(getFirebaseConfig));
publicRoutes.post('/api/contact', publicApiLimiter, validateBody(contactSchema), asyncHandler(submitContact));
publicRoutes.post('/api/consultation-request', publicApiLimiter, validateBody(consultationRequestSchema), asyncHandler(submitConsultationRequest));
