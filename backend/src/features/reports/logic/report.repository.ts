import { SalesSummary, TopProductEntry } from './report.entity';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ReportRepository {
  getSalesSummary(range: DateRange): Promise<Omit<SalesSummary, 'period' | 'from' | 'to'>>;
  getTopProducts(range: DateRange, limit: number): Promise<TopProductEntry[]>;
}
