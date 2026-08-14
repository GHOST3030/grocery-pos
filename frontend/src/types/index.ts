export type UserRole = 'MANAGER' | 'ACCOUNTANT' | 'CASHIER';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  active: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  costPrice: number;
  sellPrice: number;
  unit: string;
  stockQty: number;
  reorderLevel: number;
  active: boolean;
  categoryId: string | null;
  supplierId: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'MIXED';

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  receiptNo: string;
  cashierId: string;
  cashierName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  voided: boolean;
  createdAt: string;
}

export interface CartLine {
  product: Product;
  qty: number;
}

export type ReportPeriod = 'today' | 'week' | 'month';

export interface SalesSummary {
  period: ReportPeriod;
  from: string;
  to: string;
  totalSales: number;
  grossRevenue: number;
  totalDiscount: number;
  totalTax: number;
  itemsSold: number;
}

export interface TopProductEntry {
  productId: string;
  productName: string;
  sku: string;
  qtySold: number;
  revenue: number;
}

export interface DashboardReport {
  today: SalesSummary;
  week: SalesSummary;
  month: SalesSummary;
  topProductsToday: TopProductEntry[];
  topProductsWeek: TopProductEntry[];
  topProductsMonth: TopProductEntry[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
