import type { Request, Response } from 'express';
import {
  createProjectDiscovery,
  getCompanyProfile,
  getLatestProjectDiscoveryForUser,
  listAdminClients,
  listProjectDiscoveryForUser,
  updateProjectDiscoveryPocStatus,
} from '../services/firestoreService.js';
import { HttpError } from '../utils/httpError.js';

const getUid = (req: Request) => {
  if (!req.user?.uid) throw new HttpError(401, 'Authenticated user is required');
  return req.user.uid;
};

export const getMeCompanyProfile = async (req: Request, res: Response) => {
  const profile = await getCompanyProfile(getUid(req));
  res.status(200).json({ profile });
};

export const getMeSession = async (req: Request, res: Response) => {
  const uid = getUid(req);
  const [profile, latestProjectDiscovery] = await Promise.all([
    getCompanyProfile(uid),
    getLatestProjectDiscoveryForUser(uid),
  ]);

  res.status(200).json({
    onboarded: profile !== null,
    profile,
    previousSession: profile ? latestProjectDiscovery : null,
  });
};

export const submitProjectDiscovery = async (req: Request, res: Response) => {
  const result = await createProjectDiscovery(getUid(req), req.body);
  res.status(201).json({ message: 'Project discovery submitted', id: result.id });
};

export const getMyProjectDiscoverySubmissions = async (req: Request, res: Response) => {
  const submissions = await listProjectDiscoveryForUser(getUid(req));
  res.status(200).json({ submissions });
};

export const getMyPocStatus = async (req: Request, res: Response) => {
  const latestProjectDiscovery = await getLatestProjectDiscoveryForUser(getUid(req));
  res.status(200).json({
    status: latestProjectDiscovery?.pocStatus ?? latestProjectDiscovery?.status ?? null,
    submission: latestProjectDiscovery,
  });
};

export const getAdminClients = async (_req: Request, res: Response) => {
  const clients = await listAdminClients();
  res.status(200).json({ clients });
};

export const patchAdminClientPocStatus = async (req: Request, res: Response) => {
  const { submissionId } = req.params;
  if (!submissionId) throw new HttpError(400, 'submissionId is required');

  const submission = await updateProjectDiscoveryPocStatus(submissionId, req.body, getUid(req));
  if (!submission) throw new HttpError(404, 'Project discovery submission not found');
  res.status(200).json({ message: 'POC status updated', submission });
};
