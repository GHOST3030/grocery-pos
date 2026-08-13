import { Router } from 'express';
import { saleController } from './sale.controller';
import { validate } from '../../../shared/middleware/validate.middleware';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware';
import { asyncHandler } from '../../../shared/errors/errorHandler';
import {
  checkoutSchema,
  getSaleByIdSchema,
  getSaleByReceiptSchema,
  listSalesSchema,
  printReceiptSchema,
  voidSaleSchema,
} from './sale.schemas';

export const saleRouter = Router();

saleRouter.use(requireAuth);

// Any authenticated role can check out — this is the CASHIER's core screen.
saleRouter.post('/checkout', validate(checkoutSchema), asyncHandler(saleController.checkout));
saleRouter.post('/:id/print', validate(printReceiptSchema), asyncHandler(saleController.printReceipt));

// Viewing individual sales/receipts — any role (cashier may need to reprint,
// accountant/manager need it for lookups).
saleRouter.get('/receipt/:receiptNo', validate(getSaleByReceiptSchema), asyncHandler(saleController.getByReceiptNo));
saleRouter.get('/:id', validate(getSaleByIdSchema), asyncHandler(saleController.getById));

// Listing sales over a date range — accountant/manager only (reporting).
saleRouter.get(
  '/',
  requireRole('MANAGER', 'ACCOUNTANT'),
  validate(listSalesSchema),
  asyncHandler(saleController.list)
);

// Voiding a sale — manager only, since it affects financial records.
saleRouter.post(
  '/:id/void',
  requireRole('MANAGER'),
  validate(voidSaleSchema),
  asyncHandler(saleController.void)
);
