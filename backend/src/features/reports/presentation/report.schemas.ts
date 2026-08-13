import { z } from 'zod';

const periodEnum = z.enum(['today', 'week', 'month']);

export const salesSummarySchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    period: periodEnum,
  }),
});

export const topProductsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    period: periodEnum,
    limit: z.coerce.number().int().positive().max(50).optional(),
  }),
});

export const dashboardSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    topProductsLimit: z.coerce.number().int().positive().max(50).optional(),
  }),
});
