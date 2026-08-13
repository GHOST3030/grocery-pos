import { Router } from 'express';
import { categoryController } from './category.controller';
import { validate } from '../../../shared/middleware/validate.middleware';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware';
import { asyncHandler } from '../../../shared/errors/errorHandler';
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from './category.schemas';

export const categoryRouter = Router();

categoryRouter.use(requireAuth);

categoryRouter.get('/', asyncHandler(categoryController.list));

categoryRouter.post(
  '/',
  requireRole('MANAGER'),
  validate(createCategorySchema),
  asyncHandler(categoryController.create)
);
categoryRouter.put(
  '/:id',
  requireRole('MANAGER'),
  validate(updateCategorySchema),
  asyncHandler(categoryController.update)
);
categoryRouter.delete(
  '/:id',
  requireRole('MANAGER'),
  validate(deleteCategorySchema),
  asyncHandler(categoryController.remove)
);
