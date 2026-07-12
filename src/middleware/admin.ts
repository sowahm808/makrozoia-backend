import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError.js';

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.admin === true || req.user?.role === 'admin') return next();
  return next(new HttpError(403, 'Admin privileges are required'));
};
