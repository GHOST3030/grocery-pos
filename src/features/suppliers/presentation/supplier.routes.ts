import { Router } from 'express';
import { supplierController } from './supplier.controller';
import { validate } from '../../../shared/middleware/validate.middleware';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware';
import { asyncHandler } from '../../../shared/errors/errorHandler';
import { createSupplierSchema, deleteSupplierSchema, updateSupplierSchema } from './supplier.schemas';

export const supplierRouter = Router();

supplierRouter.use(requireAuth);

supplierRouter.get('/', asyncHandler(supplierController.list));

supplierRouter.post(
  '/',
  requireRole('MANAGER'),
  validate(createSupplierSchema),
  asyncHandler(supplierController.create)
);
supplierRouter.put(
  '/:id',
  requireRole('MANAGER'),
  validate(updateSupplierSchema),
  asyncHandler(supplierController.update)
);
supplierRouter.delete(
  '/:id',
  requireRole('MANAGER'),
  validate(deleteSupplierSchema),
  asyncHandler(supplierController.remove)
);
