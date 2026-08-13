import { runTransaction } from '../../../shared/database/transaction';
import { InsufficientStockError, NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { SaleRepository, SalesDateFilter } from './sale.repository';
import { CreateSaleInput, SaleEntity } from './sale.entity';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export class SaleService {
  constructor(private readonly repo: SaleRepository) {}

  /**
   * The core POS checkout flow. Everything here happens inside ONE
   * database transaction:
   *   1. Lock the involved product rows (SELECT ... FOR UPDATE)
   *   2. Validate each is active and has enough stock
   *   3. Compute totals server-side (never trust client-sent prices/totals)
   *   4. Decrement stock for every line
   *   5. Insert the Sale + SaleItems
   * If ANY step fails, the whole transaction rolls back — no partial sale,
   * no stock silently decremented without a matching sale record.
   */
  async checkout(input: CreateSaleInput): Promise<SaleEntity> {
    if (input.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // Merge duplicate productId lines (e.g. same item scanned twice) so
    // stock is checked/decremented against the correct combined quantity.
    const mergedQtyByProduct = new Map<string, number>();
    for (const item of input.items) {
      if (item.qty <= 0) {
        throw new ValidationError('Item quantity must be greater than zero');
      }
      mergedQtyByProduct.set(
        item.productId,
        (mergedQtyByProduct.get(item.productId) ?? 0) + item.qty
      );
    }
    const productIds = Array.from(mergedQtyByProduct.keys());

    return runTransaction(async (tx) => {
      const products = await this.repo.findProductsForUpdate(tx, productIds);
      const productById = new Map(products.map((p) => [p.id, p]));

      // Validate every line before writing anything.
      for (const [productId, qty] of mergedQtyByProduct) {
        const product = productById.get(productId);
        if (!product || !product.active) {
          throw new NotFoundError('Product');
        }
        if (product.stockQty < qty) {
          throw new InsufficientStockError(product.name, product.stockQty, qty);
        }
      }

      // Compute totals server-side from the locked product prices —
      // the client's cart is only used for productId + qty, never price.
      const lineItems = Array.from(mergedQtyByProduct.entries()).map(([productId, qty]) => {
        const product = productById.get(productId)!;
        const lineTotal = round2(product.sellPrice * qty);
        return {
          productId,
          qty,
          unitPrice: product.sellPrice,
          lineTotal,
        };
      });

      const subtotal = round2(lineItems.reduce((sum, l) => sum + l.lineTotal, 0));
      const discount = round2(input.discount ?? 0);
      if (discount < 0 || discount > subtotal) {
        throw new ValidationError('Discount must be between 0 and the subtotal');
      }
      const taxable = subtotal - discount;
      const tax = round2(taxable * (input.taxRate ?? 0));
      const total = round2(taxable + tax);

      if (input.amountPaid < total) {
        throw new ValidationError(
          `Amount paid (${input.amountPaid}) is less than total due (${total})`
        );
      }
      const changeDue = round2(input.amountPaid - total);

      // Decrement stock for every line.
      for (const line of lineItems) {
        await this.repo.decrementStock(tx, line.productId, line.qty);
      }

      const receiptNo = await this.repo.nextReceiptNo();

      return this.repo.insertSale(tx, {
        receiptNo,
        cashierId: input.cashierId,
        items: lineItems,
        subtotal,
        discount,
        tax,
        total,
        paymentMethod: input.paymentMethod,
        amountPaid: input.amountPaid,
        changeDue,
      });
    });
  }

  async getById(id: string): Promise<SaleEntity> {
    const sale = await this.repo.findById(id);
    if (!sale) throw new NotFoundError('Sale');
    return sale;
  }

  async getByReceiptNo(receiptNo: string): Promise<SaleEntity> {
    const sale = await this.repo.findByReceiptNo(receiptNo);
    if (!sale) throw new NotFoundError('Sale');
    return sale;
  }

  async listByDateRange(filter: SalesDateFilter): Promise<SaleEntity[]> {
    return this.repo.listByDateRange(filter);
  }

  /** Voids a sale. Does NOT restore stock automatically — that should be
   *  a deliberate StockAdjustment (RETURN reason) in the inventory feature,
   *  so there's still an audit trail of why stock came back. */
  async voidSale(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.voidSale(id);
  }
}
