import type { NextFunction, Request, Response } from 'express';
import { firebaseAuth } from '../config/firebase.js';
import { HttpError } from '../utils/httpError.js';

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
      throw new HttpError(401, 'Missing or invalid Authorization header');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new HttpError(401, 'Missing Firebase ID token');
    }

    req.user = await firebaseAuth.verifyIdToken(token);
    return next();
  } catch (error) {
    if (error instanceof HttpError) return next(error);
    return next(new HttpError(401, 'Invalid or expired Firebase ID token'));
  }
};
