import { Router } from 'express';
import { getMeCompanyProfile, getMeSession, getMyProjectDiscoverySubmissions, submitProjectDiscovery } from '../controllers/protectedController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { projectDiscoverySchema } from '../schemas/leadSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protectedRoutes = Router();

protectedRoutes.use(requireAuth);
protectedRoutes.get('/api/me/company-profile', asyncHandler(getMeCompanyProfile));
protectedRoutes.get('/api/me/session', asyncHandler(getMeSession));
protectedRoutes.post('/api/project-discovery', validateBody(projectDiscoverySchema), asyncHandler(submitProjectDiscovery));
protectedRoutes.get('/api/project-discovery/my-submissions', asyncHandler(getMyProjectDiscoverySubmissions));
