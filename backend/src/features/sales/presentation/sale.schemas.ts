import { z } from 'zod';

export const checkoutSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          qty: z.coerce.number().positive(),
        })
      )
      .min(1, 'Cart must have at least one item'),
    discount: z.coerce.number().nonnegative().optional(),
    taxRate: z.coerce.number().min(0).max(1).optional(),
    paymentMethod: z.enum(['CASH', 'CARD', 'MIXED']),
    amountPaid: z.coerce.number().nonnegative(),
  }),
});

export const getSaleByIdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const getSaleByReceiptSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ receiptNo: z.string().min(1) }),
});

export const listSalesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
});

export const voidSaleSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const printReceiptSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});
