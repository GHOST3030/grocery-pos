import { z } from 'zod';

export const listProductsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    activeOnly: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => v === 'true'),
  }),
});

export const getProductByIdSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const getProductBySkuSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ sku: z.string().min(1) }),
});

export const createProductSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({
    sku: z.string().min(1, 'SKU is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    costPrice: z.coerce.number().nonnegative(),
    sellPrice: z.coerce.number().nonnegative(),
    unit: z.string().optional(),
    stockQty: z.coerce.number().nonnegative().optional(),
    reorderLevel: z.coerce.number().nonnegative().optional(),
    categoryId: z.string().uuid().optional(),
    supplierId: z.string().uuid().optional(),
  }),
});

export const updateProductSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    costPrice: z.coerce.number().nonnegative().optional(),
    sellPrice: z.coerce.number().nonnegative().optional(),
    unit: z.string().optional(),
    reorderLevel: z.coerce.number().nonnegative().optional(),
    categoryId: z.string().uuid().nullable().optional(),
    supplierId: z.string().uuid().nullable().optional(),
    active: z.boolean().optional(),
  }),
});

export const deleteProductSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});
