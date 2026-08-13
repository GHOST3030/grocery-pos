import { z } from 'zod';

export const createCategorySchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.object({ name: z.string().min(1, 'Name is required') }),
});

export const updateCategorySchema = z.object({
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ name: z.string().min(1, 'Name is required') }),
});

export const deleteCategorySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});
