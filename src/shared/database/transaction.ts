import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

export type TxClient = Prisma.TransactionClient;

/**
 * Every multi-table write that must be atomic (sales checkout, stock
 * adjustments, refunds) goes through this helper instead of calling
 * prisma.$transaction() directly in feature code. Keeps the transaction
 * boundary consistent and in one place if we ever need to add retry
 * logic, timeout tuning, or isolation-level changes.
 */
export function runTransaction<T>(
  fn: (tx: TxClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn, {
    maxWait: 5000,
    timeout: 10000,
  });
}
