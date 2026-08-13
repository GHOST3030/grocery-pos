import { Router } from 'express';
import { reportController } from './report.controller';
import { validate } from '../../../shared/middleware/validate.middleware';
import { requireAuth, requireRole } from '../../../shared/middleware/auth.middleware';
import { asyncHandler } from '../../../shared/errors/errorHandler';
import { dashboardSchema, salesSummarySchema, topProductsSchema } from './report.schemas';

export const reportRouter = Router();

// Sales analytics — manager and accountant only, not cashier.
reportRouter.use(requireAuth, requireRole('MANAGER', 'ACCOUNTANT'));

reportRouter.get('/summary', validate(salesSummarySchema), asyncHandler(reportController.salesSummary));
reportRouter.get('/top-products', validate(topProductsSchema), asyncHandler(reportController.topProducts));
reportRouter.get('/dashboard', validate(dashboardSchema), asyncHandler(reportController.dashboard));
