export type PaymentMethod = 'CASH' | 'CARD' | 'MIXED';

export interface SaleItemEntity {
  id: string;
  productId: string;
  productName: string; // snapshot, in case product is renamed later
  sku: string;
  qty: number;
  unitPrice: number; // price at time of sale, never re-derived from Product
  lineTotal: number;
}

export interface SaleEntity {
  id: string;
  receiptNo: string;
  cashierId: string;
  cashierName: string;
  items: SaleItemEntity[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  voided: boolean;
  createdAt: Date;
}

/** One line the cashier scanned/added to the cart before checkout. */
export interface CartItemInput {
  productId: string;
  qty: number;
}

export interface CreateSaleInput {
  cashierId: string;
  items: CartItemInput[];
  discount?: number;
  taxRate?: number; // e.g. 0.15 for 15% — applied to subtotal after discount
  paymentMethod: PaymentMethod;
  amountPaid: number;
}
