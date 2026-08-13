import { Router } from 'express';
import { productController } from './product.controller';
import { validate } from '../../../shared/middleware/validate.middleware';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware';
import { asyncHandler } from '../../../shared/errors/errorHandler';
import {
  createProductSchema,
  deleteProductSchema,
  getProductByIdSchema,
  getProductBySkuSchema,
  listProductsSchema,
  updateProductSchema,
} from './product.schemas';

export const productRouter = Router();

// All product routes require login. Read access: any authenticated role
// (cashier needs it for checkout lookups, accountant/manager for reports
// and management). Write access: MANAGER only.
productRouter.use(requireAuth);

productRouter.get('/', validate(listProductsSchema), asyncHandler(productController.list));
productRouter.get('/sku/:sku', validate(getProductBySkuSchema), asyncHandler(productController.getBySku));
productRouter.get('/:id', validate(getProductByIdSchema), asyncHandler(productController.getById));

productRouter.post(
  '/',
  requireRole('MANAGER'),
  validate(createProductSchema),
  asyncHandler(productController.create)
);
productRouter.put(
  '/:id',
  requireRole('MANAGER'),
  validate(updateProductSchema),
  asyncHandler(productController.update)
);
productRouter.delete(
  '/:id',
  requireRole('MANAGER'),
  validate(deleteProductSchema),
  asyncHandler(productController.remove)
);
