import { ReportRepository } from './report.repository';
import { periodRange } from './period-range';
import { DashboardReport, ReportPeriod, SalesSummary, TopProductsReport } from './report.entity';

const DEFAULT_TOP_PRODUCTS_LIMIT = 10;

export class ReportService {
  constructor(private readonly repo: ReportRepository) {}

  async getSalesSummary(period: ReportPeriod): Promise<SalesSummary> {
    const { from, to } = periodRange(period);
    const summary = await this.repo.getSalesSummary({ from, to });
    return { period, from, to, ...summary };
  }

  async getTopProducts(period: ReportPeriod, limit: number = DEFAULT_TOP_PRODUCTS_LIMIT): Promise<TopProductsReport> {
    const { from, to } = periodRange(period);
    const products = await this.repo.getTopProducts({ from, to }, limit);
    return { period, from, to, products };
  }

  /** Combined view for a dashboard screen — today/week/month at once. */
  async getDashboard(topProductsLimit: number = 5): Promise<DashboardReport> {
    const periods: ReportPeriod[] = ['today', 'week', 'month'];
    const ranges = Object.fromEntries(periods.map((p) => [p, periodRange(p)])) as Record<
      ReportPeriod,
      { from: Date; to: Date }
    >;

    const [todaySummary, weekSummary, monthSummary, topToday, topWeek, topMonth] = await Promise.all([
      this.repo.getSalesSummary(ranges.today),
      this.repo.getSalesSummary(ranges.week),
      this.repo.getSalesSummary(ranges.month),
      this.repo.getTopProducts(ranges.today, topProductsLimit),
      this.repo.getTopProducts(ranges.week, topProductsLimit),
      this.repo.getTopProducts(ranges.month, topProductsLimit),
    ]);

    return {
      today: { period: 'today', ...ranges.today, ...todaySummary },
      week: { period: 'week', ...ranges.week, ...weekSummary },
      month: { period: 'month', ...ranges.month, ...monthSummary },
      topProductsToday: topToday,
      topProductsWeek: topWeek,
      topProductsMonth: topMonth,
    };
  }
}
