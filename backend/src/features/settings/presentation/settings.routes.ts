import { Router } from 'express';
import { settingsController } from './settings.controller';
import { validate } from '../../../shared/middleware/validate.middleware';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware';
import { asyncHandler } from '../../../shared/errors/errorHandler';
import { updateSettingsSchema } from './settings.schemas';

export const settingsRouter = Router();

settingsRouter.use(requireAuth);

settingsRouter.get('/', asyncHandler(settingsController.getAll));
settingsRouter.put(
  '/',
  requireRole('MANAGER'),
  validate(updateSettingsSchema),
  asyncHandler(settingsController.update)
);
