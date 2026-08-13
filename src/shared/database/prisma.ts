import { PrismaClient } from '@prisma/client';
import { config } from '../../config';

// Singleton pattern — prevents exhausting DB connections from creating
// multiple PrismaClient instances (a common issue with hot-reload in dev).
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: config.isProduction ? ['error', 'warn'] : ['error', 'warn', 'query'],
  });

if (!config.isProduction) {
  global.__prisma = prisma;
}
