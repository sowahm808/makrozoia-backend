import type { Request, Response } from 'express';
import { createProjectDiscovery, getCompanyProfile, listProjectDiscoveryForUser } from '../services/firestoreService.js';
import { HttpError } from '../utils/httpError.js';

const getUid = (req: Request) => {
  if (!req.user?.uid) throw new HttpError(401, 'Authenticated user is required');
  return req.user.uid;
};

export const getMeCompanyProfile = async (req: Request, res: Response) => {
  const profile = await getCompanyProfile(getUid(req));
  res.status(200).json({ profile });
};

export const submitProjectDiscovery = async (req: Request, res: Response) => {
  const result = await createProjectDiscovery(getUid(req), req.body);
  res.status(201).json({ message: 'Project discovery submitted', id: result.id });
};

export const getMyProjectDiscoverySubmissions = async (req: Request, res: Response) => {
  const submissions = await listProjectDiscoveryForUser(getUid(req));
  res.status(200).json({ submissions });
};
