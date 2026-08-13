import { prisma } from '../../../shared/database/prisma';
import { DateRange, ReportRepository } from '../logic/report.repository';
import { SalesSummary, TopProductEntry } from '../logic/report.entity';

export class PrismaReportRepository implements ReportRepository {
  async getSalesSummary(range: DateRange): Promise<Omit<SalesSummary, 'period' | 'from' | 'to'>> {
    // Voided sales are excluded from every revenue figure — they were
    // never real, finalized income.
    const [saleAgg, itemAgg] = await Promise.all([
      prisma.sale.aggregate({
        where: { createdAt: { gte: range.from, lte: range.to }, voided: false },
        _count: { _all: true },
        _sum: { total: true, discount: true, tax: true },
      }),
      prisma.saleItem.aggregate({
        where: {
          sale: { createdAt: { gte: range.from, lte: range.to }, voided: false },
        },
        _sum: { qty: true },
      }),
    ]);

    return {
      totalSales: saleAgg._count._all,
      grossRevenue: Number(saleAgg._sum.total ?? 0),
      totalDiscount: Number(saleAgg._sum.discount ?? 0),
      totalTax: Number(saleAgg._sum.tax ?? 0),
      itemsSold: Number(itemAgg._sum.qty ?? 0),
    };
  }

  async getTopProducts(range: DateRange, limit: number): Promise<TopProductEntry[]> {
    const grouped: Array<{ productId: string; _sum: { qty: any; lineTotal: any } }> = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: { createdAt: { gte: range.from, lte: range.to }, voided: false },
      },
      _sum: { qty: true, lineTotal: true },
      orderBy: { _sum: { qty: 'desc' } },
      take: limit,
    });

    if (grouped.length === 0) return [];

    const products: Array<{ id: string; name: string; sku: string }> = await prisma.product.findMany({
      where: { id: { in: grouped.map((g) => g.productId) } },
      select: { id: true, name: true, sku: true },
    });
    const productById = new Map(products.map((p) => [p.id, p]));

    return grouped.map((g) => {
      const product = productById.get(g.productId);
      return {
        productId: g.productId,
        productName: product?.name ?? 'Unknown product',
        sku: product?.sku ?? '',
        qtySold: Number(g._sum.qty ?? 0),
        revenue: Number(g._sum.lineTotal ?? 0),
      };
    });
  }
}
