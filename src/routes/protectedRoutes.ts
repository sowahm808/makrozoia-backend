import { Router } from 'express';
import {
  getAdminClients,
  getMeCompanyProfile,
  getMeSession,
  getMyPocStatus,
  getMyProjectDiscoverySubmissions,
  patchAdminClientPocStatus,
  submitProjectDiscovery,
} from '../controllers/protectedController.js';
import { requireAdmin } from '../middleware/admin.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { pocStatusUpdateSchema, projectDiscoverySchema } from '../schemas/leadSchemas.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protectedRoutes = Router();

protectedRoutes.use(requireAuth);
protectedRoutes.get('/api/me/company-profile', asyncHandler(getMeCompanyProfile));
protectedRoutes.get('/api/me/session', asyncHandler(getMeSession));
protectedRoutes.get('/api/me/poc-status', asyncHandler(getMyPocStatus));
protectedRoutes.post('/api/project-discovery', validateBody(projectDiscoverySchema), asyncHandler(submitProjectDiscovery));
protectedRoutes.get('/api/project-discovery/my-submissions', asyncHandler(getMyProjectDiscoverySubmissions));
protectedRoutes.get('/api/admin/clients', requireAdmin, asyncHandler(getAdminClients));
protectedRoutes.patch('/api/admin/clients/:submissionId/poc-status', requireAdmin, validateBody(pocStatusUpdateSchema), asyncHandler(patchAdminClientPocStatus));
