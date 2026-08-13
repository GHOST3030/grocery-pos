import { useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/client'
import type { Dashboard, SalesSummary, TopProductEntry } from '../../../shared/api/types'
import { ErrorBanner, Spinner, formatMoney } from '../../../shared/components/ui'
import { reportApi } from '../data/report.api'

function SummaryCard({ title, summary, accent }: { title: string; summary: SalesSummary; accent: string }) {
  const metrics: [string, string][] = [
    ['عدد المبيعات', String(summary.totalSales)],
    ['الخصومات', formatMoney(summary.totalDiscount)],
    ['الضرائب', formatMoney(summary.totalTax)],
    ['البضائع المباعة', String(summary.itemsSold)],
  ]
  return (
    <div className="card overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${accent}`} />
      <div className="p-5">
        <div className="mb-4 text-xs font-semibold text-base-400">{title}</div>
        <div className="mb-4 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold tabular-nums text-white" dir="ltr">
            {formatMoney(summary.grossRevenue)}
          </span>
          <span className="text-xs text-base-400">إيرادات</span>
        </div>
        <div className="space-y-1.5 border-t border-base-700/60 pt-3 text-sm">
          {metrics.map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-base-400">{label}</span>
              <span className="font-mono font-medium tabular-nums text-base-200" dir="ltr">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TopProducts({ title, items }: { title: string; items: TopProductEntry[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-base-700/60 px-5 py-3.5">
        <div className="text-xs font-semibold text-base-400">{title}</div>
      </div>
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-base-400">لا توجد مبيعات في هذه الفترة</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th className="th w-10">#</th>
              <th className="th">المنتج</th>
              <th className="th text-end">الكمية</th>
              <th className="th text-end">الإيرادات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-base-700/50">
            {items.map((p, i) => (
              <tr key={p.productId} className="transition-colors hover:bg-base-800/50">
                <td className="td">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                      i === 0
                        ? 'bg-amber-500/20 text-amber-300'
                        : i === 1
                          ? 'bg-slate-400/20 text-slate-300'
                          : i === 2
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-base-700 text-base-300'
                    }`}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="td">
                  <div className="font-medium text-base-100">{p.productName}</div>
                  <div className="font-mono text-[10px] text-base-400" dir="ltr">SKU {p.sku}</div>
                </td>
                <td className="td text-end font-mono tabular-nums" dir="ltr">{p.qtySold}</td>
                <td className="td text-end font-mono font-semibold tabular-nums text-emerald-400" dir="ltr">
                  {formatMoney(p.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function Reports() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    reportApi
      .dashboard(5)
      .then(({ dashboard }) => setData(dashboard))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'فشل تحميل التقارير'))
  }, [])

  if (error) return <ErrorBanner message={error} />
  if (!data) return <Spinner label="جارٍ تحليل المبيعات…" />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">تحليلات المبيعات</h1>
        <p className="text-sm text-base-400">أرقام مباشرة — المبيعات الملغاة مستثناة</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="اليوم" summary={data.today} accent="from-emerald-500 to-teal-500" />
        <SummaryCard title="هذا الأسبوع" summary={data.week} accent="from-sky-500 to-indigo-500" />
        <SummaryCard title="هذا الشهر" summary={data.month} accent="from-amber-500 to-orange-500" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <TopProducts title="الأكثر مبيعاً — اليوم" items={data.topProductsToday} />
        <TopProducts title="الأكثر مبيعاً — هذا الأسبوع" items={data.topProductsWeek} />
        <TopProducts title="الأكثر مبيعاً — هذا الشهر" items={data.topProductsMonth} />
      </div>
    </div>
  )
}