import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({ error: { message: 'Validation failed', details: error.flatten().fieldErrors } });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: { message: error.message, details: error.details } });
  }

  console.error('Unhandled application error', error);
  return res.status(500).json({
    error: {
      message: 'Internal server error',
      ...(env.NODE_ENV !== 'production' && error instanceof Error ? { details: error.message } : {}),
    },
  });
};
