import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/client'
import type { Sale } from '../../../shared/api/types'
import {
  Button,
  ErrorBanner,
  Modal,
  Spinner,
  formatDate,
  formatMoney,
} from '../../../shared/components/ui'
import { saleApi } from '../data/sale.api'

function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return { from: start.toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) }
}

const methodLabels = { CASH: 'نقدي', CARD: 'بطاقة', MIXED: 'مختلط' }

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detail, setDetail] = useState<Sale | null>(null)
  const [from, setFrom] = useState(todayRange().from)
  const [to, setTo] = useState(todayRange().to)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fromIso = from ? new Date(`${from}T00:00:00`).toISOString() : undefined
      const toIso = to ? new Date(`${to}T23:59:59`).toISOString() : undefined
      const { sales } = await saleApi.list(fromIso, toIso)
      setSales(sales)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل تحميل المبيعات')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    load()
  }, [load])

  async function voidSale(s: Sale) {
    if (!confirm(`إلغاء بيع ${s.receiptNo}؟ لن تتم استعادة المخزون.`)) return
    try {
      await saleApi.void(s.id)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل إلغاء البيع')
    }
  }

  const gross = sales.reduce((s, x) => s + (x.voided ? 0 : x.total), 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">المبيعات</h1>
          <p className="text-sm text-base-400">
            {sales.length} عملية بيع — الإجمالي <span className="font-mono" dir="ltr">{formatMoney(gross)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-base-400">من</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="input w-40 [color-scheme:dark]"
            dir="ltr"
          />
          <label className="text-xs font-medium text-base-400">إلى</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="input w-40 [color-scheme:dark]"
            dir="ltr"
          />
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <Spinner label="جارٍ تحميل المبيعات…" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="th">الإيصال</th>
                <th className="th">التاريخ</th>
                <th className="th">الكاشير</th>
                <th className="th text-end">الكمية</th>
                <th className="th">طريقة الدفع</th>
                <th className="th text-end">الإجمالي</th>
                <th className="th text-center">الحالة</th>
                <th className="th text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-700/50">
              {sales.map((s) => (
                <tr key={s.id} className={`transition-colors hover:bg-base-800/50 ${s.voided ? 'opacity-40' : ''}`}>
                  <td className="td font-mono text-xs text-emerald-400" dir="ltr">{s.receiptNo}</td>
                  <td className="td text-base-400">{formatDate(s.createdAt)}</td>
                  <td className="td">{s.cashierName}</td>
                  <td className="td text-end font-mono tabular-nums" dir="ltr">
                    {s.items.reduce((n, i) => n + i.qty, 0)}
                  </td>
                  <td className="td">
                    <span className="badge bg-base-700 text-base-300">{methodLabels[s.paymentMethod]}</span>
                  </td>
                  <td className="td text-end font-mono font-semibold tabular-nums text-white" dir="ltr">
                    {formatMoney(s.total)}
                  </td>
                  <td className="td text-center">
                    {s.voided ? (
                      <span className="badge bg-red-500/15 text-red-300 ring-1 ring-red-500/30">ملغى</span>
                    ) : (
                      <span className="badge bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">مكتمل</span>
                    )}
                  </td>
                  <td className="td text-end">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => setDetail(s)}>
                        عرض
                      </Button>
                      {!s.voided && (
                        <Button variant="danger" size="sm" onClick={() => voidSale(s)}>
                          إلغاء
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={8} className="td py-16 text-center text-base-400">
                    لا توجد مبيعات في هذه الفترة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <Modal open onClose={() => setDetail(null)} title={`إيصال ${detail.receiptNo}`}>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-base-400">
              <span>{formatDate(detail.createdAt)}</span>
              <span>الكاشير: {detail.cashierName}</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-base-700">
              <table className="table">
                <thead>
                  <tr>
                    <th className="th">المنتج</th>
                    <th className="th text-end">الكمية</th>
                    <th className="th text-end">السعر</th>
                    <th className="th text-end">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-700/50">
                  {detail.items.map((i) => (
                    <tr key={i.id}>
                      <td className="td text-base-100">{i.productName}</td>
                      <td className="td text-end font-mono tabular-nums" dir="ltr">{i.qty}</td>
                      <td className="td text-end font-mono tabular-nums" dir="ltr">{formatMoney(i.unitPrice)}</td>
                      <td className="td text-end font-mono font-medium tabular-nums text-white" dir="ltr">
                        {formatMoney(i.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-1 rounded-xl border border-base-700 bg-base-900/80 p-4 text-sm tabular-nums text-base-300">
              <div className="flex justify-between"><span>المجموع الفرعي</span><span className="font-mono" dir="ltr">{formatMoney(detail.subtotal)}</span></div>
              <div className="flex justify-between"><span>الخصم</span><span className="font-mono" dir="ltr">-{formatMoney(detail.discount)}</span></div>
              <div className="flex justify-between"><span>الضريبة</span><span className="font-mono" dir="ltr">{formatMoney(detail.tax)}</span></div>
              <div className="flex justify-between border-t border-base-700 pt-1 text-base font-bold text-white">
                <span>الإجمالي</span><span className="font-mono text-emerald-400" dir="ltr">{formatMoney(detail.total)}</span>
              </div>
              <div className="flex justify-between"><span>المدفوع ({methodLabels[detail.paymentMethod]})</span><span className="font-mono" dir="ltr">{formatMoney(detail.amountPaid)}</span></div>
              <div className="flex justify-between text-emerald-400">
                <span>الباقي</span><span className="font-mono" dir="ltr">{formatMoney(detail.changeDue)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}