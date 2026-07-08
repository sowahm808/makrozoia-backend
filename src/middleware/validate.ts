import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject } from 'zod';
import { HttpError } from '../utils/httpError.js';

export const validateBody = (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(new HttpError(400, 'Validation failed', result.error.flatten().fieldErrors));
  }

  req.body = result.data;
  return next();
};
