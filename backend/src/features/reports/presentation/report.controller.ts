import { Request, Response } from 'express';
import { ReportService } from '../logic/report.service';
import { PrismaReportRepository } from '../data/report.repository.impl';
import { ReportPeriod } from '../logic/report.entity';

const reportService = new ReportService(new PrismaReportRepository());

export const reportController = {
  async salesSummary(req: Request, res: Response) {
    const { period } = req.query as { period: ReportPeriod };
    const summary = await reportService.getSalesSummary(period);
    res.json({ summary });
  },

  async topProducts(req: Request, res: Response) {
    const { period, limit } = req.query as unknown as { period: ReportPeriod; limit?: number };
    const report = await reportService.getTopProducts(period, limit);
    res.json({ report });
  },

  /** Single call for a dashboard screen: today/week/month summaries + top products. */
  async dashboard(req: Request, res: Response) {
    const { topProductsLimit } = req.query as { topProductsLimit?: number };
    const dashboard = await reportService.getDashboard(topProductsLimit);
    res.json({ dashboard });
  },
};
