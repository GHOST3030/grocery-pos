export type ReportPeriod = 'today' | 'week' | 'month';

export interface SalesSummary {
  period: ReportPeriod;
  from: Date;
  to: Date;
  totalSales: number; // count of sales (voided excluded)
  grossRevenue: number; // sum of Sale.total
  totalDiscount: number;
  totalTax: number;
  itemsSold: number; // sum of SaleItem.qty
}

export interface TopProductEntry {
  productId: string;
  productName: string;
  sku: string;
  qtySold: number;
  revenue: number;
}

export interface TopProductsReport {
  period: ReportPeriod;
  from: Date;
  to: Date;
  products: TopProductEntry[];
}

export interface DashboardReport {
  today: SalesSummary;
  week: SalesSummary;
  month: SalesSummary;
  topProductsToday: TopProductEntry[];
  topProductsWeek: TopProductEntry[];
  topProductsMonth: TopProductEntry[];
}
