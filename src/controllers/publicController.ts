import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { createConsultationRequest, createContactMessage } from '../services/firestoreService.js';
import { HttpError } from '../utils/httpError.js';

export const health = async (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'makrozoia-backend', timestamp: new Date().toISOString() });
};

export const getFirebaseConfig = async (_req: Request, res: Response) => {
  if (!env.firebaseWebConfig) {
    throw new HttpError(503, 'Firebase web configuration is not configured on the backend');
  }

  res.status(200).json({ firebase: env.firebaseWebConfig });
};

export const submitContact = async (req: Request, res: Response) => {
  const result = await createContactMessage(req.body);
  res.status(201).json({ message: 'Contact message received', id: result.id });
};

export const submitConsultationRequest = async (req: Request, res: Response) => {
  const result = await createConsultationRequest(req.body);
  res.status(201).json({ message: 'Consultation request received', id: result.id });
};
