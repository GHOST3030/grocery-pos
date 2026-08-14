import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Trophy } from 'lucide-react';
import { api, apiErrorMessage } from '../lib/api';
import type { DashboardReport, SalesSummary, TopProductEntry } from '../types';

const CURRENCY = '$';

function SummaryCard({ title, summary }: { title: string; summary: SalesSummary }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-soft">{title}</p>
        <TrendingUp className="h-4 w-4 text-ink-faint" strokeWidth={2} />
      </div>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight text-evergreen">
        {CURRENCY}
        {summary.grossRevenue.toFixed(2)}
      </p>
      <div className="mt-3 flex gap-4 font-mono text-xs text-ink-soft">
        <span>{summary.totalSales} sales</span>
        <span>{summary.itemsSold} items</span>
      </div>
    </div>
  );
}

function TopProductsList({ title, products }: { title: string; products: TopProductEntry[] }) {
  return (
    <div className="card p-5">
      <p className="mb-3 text-sm font-medium text-ink-soft">{title}</p>
      {products.length === 0 ? (
        <p className="text-sm text-ink-faint">No sales yet.</p>
      ) : (
        <ol className="space-y-2.5">
          {products.map((p, i) => (
            <li key={p.productId} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2.5 truncate">
                {i === 0 ? (
                  <Trophy className="h-3.5 w-3.5 shrink-0 text-mustard" strokeWidth={2.25} />
                ) : (
                  <span className="w-3.5 shrink-0 font-mono text-xs text-ink-faint">{i + 1}</span>
                )}
                <span className="truncate">{p.productName}</span>
              </span>
              <span className="shelf-tag shrink-0">{p.qtySold} sold</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function ReportsPage() {
  const [dashboard, setDashboard] = useState<DashboardReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<{ dashboard: DashboardReport }>('/reports/dashboard');
        setDashboard(data.dashboard);
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="p-6 text-ink-soft">Loading…</div>;
  }

  if (error || !dashboard) {
    return (
      <div className="p-6">
        <p className="rounded-md bg-tomato-tint px-3 py-2 text-sm text-tomato">
          {error ?? 'Could not load reports'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-2.5">
        <BarChart3 className="h-5 w-5 text-evergreen" strokeWidth={2} />
        <p className="font-display text-xl font-bold">Sales analytics</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard title="Today" summary={dashboard.today} />
        <SummaryCard title="This week" summary={dashboard.week} />
        <SummaryCard title="This month" summary={dashboard.month} />
      </div>

      <p className="mb-4 font-display text-lg font-bold">Top-selling products</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TopProductsList title="Today" products={dashboard.topProductsToday} />
        <TopProductsList title="This week" products={dashboard.topProductsWeek} />
        <TopProductsList title="This month" products={dashboard.topProductsMonth} />
      </div>
    </div>
  );
}
