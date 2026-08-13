import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from './AppError';
import { config } from '../../config';

/**
 * Single place where every error becomes an HTTP response. Controllers
 * should just `throw` an AppError subclass (or let Zod throw) and call
 * next(err) via asyncHandler — never res.status() directly for error paths.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof Object && 'details' in err ? { details: (err as any).details } : {}),
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.flatten().fieldErrors,
      },
    });
  }

  // Unexpected error — log full detail server-side, hide internals from client
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isProduction
        ? 'Something went wrong'
        : err instanceof Error
          ? err.message
          : String(err),
    },
  });
}

/** Wraps async route handlers so thrown/rejected errors reach errorHandler. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
