import { TxClient } from '../../../shared/database/transaction';
import { SaleEntity } from './sale.entity';

export interface SalesDateFilter {
  from: Date;
  to: Date;
}

/**
 * Product snapshot the sale service needs to validate/price a cart line,
 * read through the same transaction so stock checks and the eventual
 * write are consistent (no other request can slip in between).
 */
export interface ProductForSale {
  id: string;
  name: string;
  sku: string;
  sellPrice: number;
  stockQty: number;
  active: boolean;
}

export interface SaleRepository {
  /** Reads product rows FOR UPDATE within the given transaction, keyed by id. */
  findProductsForUpdate(tx: TxClient, productIds: string[]): Promise<ProductForSale[]>;

  /** Decrements stock for a product within the transaction. */
  decrementStock(tx: TxClient, productId: string, qty: number): Promise<void>;

  /** Writes the Sale + SaleItems rows within the transaction. */
  insertSale(
    tx: TxClient,
    input: {
      receiptNo: string;
      cashierId: string;
      items: Array<{
        productId: string;
        qty: number;
        unitPrice: number;
        lineTotal: number;
      }>;
      subtotal: number;
      discount: number;
      tax: number;
      total: number;
      paymentMethod: string;
      amountPaid: number;
      changeDue: number;
    }
  ): Promise<SaleEntity>;

  findById(id: string): Promise<SaleEntity | null>;
  findByReceiptNo(receiptNo: string): Promise<SaleEntity | null>;
  listByDateRange(filter: SalesDateFilter): Promise<SaleEntity[]>;
  voidSale(id: string): Promise<void>;
  nextReceiptNo(): Promise<string>;
}
