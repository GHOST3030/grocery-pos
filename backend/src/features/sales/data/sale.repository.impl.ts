import { prisma } from '../../../shared/database/prisma';
import { TxClient } from '../../../shared/database/transaction';
import { ProductForSale, SaleRepository, SalesDateFilter } from '../logic/sale.repository';
import { SaleEntity } from '../logic/sale.entity';

function toSaleEntity(row: any): SaleEntity {
  return {
    id: row.id,
    receiptNo: row.receiptNo,
    cashierId: row.cashierId,
    cashierName: row.cashier?.fullName ?? '',
    items: (row.items ?? []).map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name ?? '',
      sku: item.product?.sku ?? '',
      qty: Number(item.qty),
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    tax: Number(row.tax),
    total: Number(row.total),
    paymentMethod: row.paymentMethod,
    amountPaid: Number(row.amountPaid),
    changeDue: Number(row.changeDue),
    voided: row.voided,
    createdAt: row.createdAt,
  };
}

const saleIncludes = {
  cashier: true,
  items: { include: { product: true } },
} as const;

export class PrismaSaleRepository implements SaleRepository {
  async findProductsForUpdate(tx: TxClient, productIds: string[]): Promise<ProductForSale[]> {
    // Prisma doesn't expose SELECT ... FOR UPDATE directly for Postgres via
    // the query builder, so we use $queryRaw within the transaction to lock
    // the rows and prevent two concurrent checkouts from overselling the
    // same stock. Safe because this only ever runs inside runTransaction().
    const rows = await tx.$queryRaw<
      Array<{
        id: string;
        name: string;
        sku: string;
        sellPrice: any;
        stockQty: any;
        active: boolean;
      }>
    >`SELECT id, name, sku, "sellPrice", "stockQty", active
      FROM "Product"
      WHERE id = ANY(${productIds})
      FOR UPDATE`;

    return rows.map((r: { id: string; name: string; sku: string; sellPrice: any; stockQty: any; active: boolean }) => ({
      id: r.id,
      name: r.name,
      sku: r.sku,
      sellPrice: Number(r.sellPrice),
      stockQty: Number(r.stockQty),
      active: r.active,
    }));
  }

  async decrementStock(tx: TxClient, productId: string, qty: number): Promise<void> {
    await tx.product.update({
      where: { id: productId },
      data: { stockQty: { decrement: qty } },
    });
  }

  async insertSale(
    tx: TxClient,
    input: {
      receiptNo: string;
      cashierId: string;
      items: Array<{ productId: string; qty: number; unitPrice: number; lineTotal: number }>;
      subtotal: number;
      discount: number;
      tax: number;
      total: number;
      paymentMethod: string;
      amountPaid: number;
      changeDue: number;
    }
  ): Promise<SaleEntity> {
    const row = await tx.sale.create({
      data: {
        receiptNo: input.receiptNo,
        cashierId: input.cashierId,
        subtotal: input.subtotal,
        discount: input.discount,
        tax: input.tax,
        total: input.total,
        paymentMethod: input.paymentMethod as any,
        amountPaid: input.amountPaid,
        changeDue: input.changeDue,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: saleIncludes,
    });
    return toSaleEntity(row);
  }

  async findById(id: string): Promise<SaleEntity | null> {
    const row = await prisma.sale.findUnique({ where: { id }, include: saleIncludes });
    return row ? toSaleEntity(row) : null;
  }

  async findByReceiptNo(receiptNo: string): Promise<SaleEntity | null> {
    const row = await prisma.sale.findUnique({ where: { receiptNo }, include: saleIncludes });
    return row ? toSaleEntity(row) : null;
  }

  async listByDateRange(filter: SalesDateFilter): Promise<SaleEntity[]> {
    const rows = await prisma.sale.findMany({
      where: { createdAt: { gte: filter.from, lte: filter.to } },
      include: saleIncludes,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toSaleEntity);
  }

  async voidSale(id: string): Promise<void> {
    await prisma.sale.update({ where: { id }, data: { voided: true } });
  }

  async nextReceiptNo(): Promise<string> {
    // Simple date-based receipt numbering: YYYYMMDD-#### (count of sales
    // today + 1). Good enough for single-terminal local use; if multi-
    // terminal is added later this should move to a DB sequence to avoid
    // any race on the count.
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const countToday = await prisma.sale.count({
      where: { createdAt: { gte: startOfDay } },
    });
    const datePart = startOfDay.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(countToday + 1).padStart(4, '0');
    return `${datePart}-${seq}`;
  }
}
