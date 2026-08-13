import { z } from 'zod';

export const updateSettingsSchema = z.object({
  query: z.object({}).optional(),
  params: z.object({}).optional(),
  body: z.record(z.string(), z.string()),
});
