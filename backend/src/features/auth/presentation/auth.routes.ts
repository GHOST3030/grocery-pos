import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../../shared/middleware/validate.middleware';
import { requireAuth } from '../../../shared/middleware/auth.middleware';
import { asyncHandler } from '../../../shared/errors/errorHandler';
import { loginSchema, registerSchema } from './auth.schemas';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), asyncHandler(authController.login));

// NOTE: open for now so the very first MANAGER account can be created
// (see AuthService.register bootstrap rule). Once the User Management
// screen ships (Phase 6), lock this behind requireAuth + requireRole('MANAGER')
// for every call after the first.
authRouter.post('/register', validate(registerSchema), asyncHandler(authController.register));

authRouter.get('/me', requireAuth, asyncHandler(authController.me));
