import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../../../shared/api/client'
import type { PaymentMethod, Product, Sale } from '../../../shared/api/types'
import { Button, ErrorBanner, Field, Modal, formatMoney } from '../../../shared/components/ui'
import { productApi } from '../../products/data/product.api'
import { saleApi } from '../../sales/data/sale.api'

interface CartLine {
  product: Product
  qty: number
}

export default function Pos() {
  const [cart, setCart] = useState<CartLine[]>([])
  const [scan, setScan] = useState('')
  const [search, setSearch] = useState('')
  const [grid, setGrid] = useState<Product[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const [completed, setCompleted] = useState<Sale | null>(null)
  const scanRef = useRef<HTMLInputElement>(null)

  const notify = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(null), 2500)
  }

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id)
      if (existing) {
        return prev.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l))
      }
      return [...prev, { product, qty: 1 }]
    })
  }, [])

  const handleScan = useCallback(
    async (sku: string) => {
      const trimmed = sku.trim()
      if (!trimmed) return
      try {
        const { product } = await productApi.bySku(trimmed)
        if (!product.active) {
          setError(`المنتج "${product.name}" غير نشط`)
          return
        }
        addToCart(product)
        notify(`تمت إضافة "${product.name}"`)
        setError(null)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'المنتج غير موجود')
      }
    },
    [addToCart],
  )

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const { products } = await productApi.list({ search: search || undefined, activeOnly: true })
        setGrid(search ? products.slice(0, 12) : products.slice(0, 12))
      } catch {
        setGrid([])
      }
    }, 200)
    return () => clearTimeout(t)
  }, [search])

  function setQty(productId: string, qty: number) {
    setCart((prev) =>
      prev.map((l) => (l.product.id === productId ? { ...l, qty: Math.max(0, qty) } : l)),
    )
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((l) => l.product.id !== productId))
  }

  const itemCount = cart.reduce((s, l) => s + l.qty, 0)
  const subtotal = cart.reduce((s, l) => s + l.product.sellPrice * l.qty, 0)

  const handlePaid = (sale: Sale) => {
    setCart([])
    setPayOpen(false)
    setCompleted(sale)
  }

  return (
    <div className="grid h-full gap-5 xl:grid-cols-[1fr_400px]">
      {/* Left: scanner + product grid */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="card flex items-center gap-3 p-3.5">
          <svg className="h-6 w-6 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7V5a1 1 0 011-1h2m10 0h2a1 1 0 011 1v2m0 10v2a1 1 0 01-1 1h-2M7 20H5a1 1 0 01-1-1v-2" />
          </svg>
          <input
            ref={scanRef}
            value={scan}
            onChange={(e) => setScan(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleScan(scan)
                setScan('')
              }
            }}
            className="input flex-1 text-base"
            placeholder="امسح الباركود أو اكتب الرمز ثم اضغط Enter"
            dir="ltr"
            autoFocus
          />
          <Button onClick={() => { handleScan(scan); setScan('') }}>إضافة</Button>
        </div>

        <div className="card flex-1 overflow-hidden">
          <div className="border-b border-base-700/60 px-4 py-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              placeholder="ابحث عن المنتج بالاسم أو الرمز…"
            />
          </div>
          <div className="grid max-h-[calc(100vh-260px)] grid-cols-2 gap-3 overflow-y-auto p-4 md:grid-cols-3 2xl:grid-cols-4">
            {grid.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  addToCart(p)
                  notify(`تمت إضافة "${p.name}"`)
                }}
                className="group flex flex-col rounded-xl border border-base-700/60 bg-base-800/60 p-4 text-start transition-all hover:border-emerald-500/50 hover:bg-base-700/60 active:scale-[0.97]"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-base-100">{p.name}</span>
                  <span className="badge bg-base-700 text-base-300">
                    {p.stockQty}{p.unit === 'pcs' ? '' : ` ${p.unit}`}
                  </span>
                </div>
                <div className="mt-auto flex items-baseline justify-between">
                  <span className="text-lg font-bold tracking-tight text-emerald-400">
                    {formatMoney(p.sellPrice)}
                  </span>
                  <span className="font-mono text-[10px] text-base-400" dir="ltr">{p.sku}</span>
                </div>
              </button>
            ))}
            {grid.length === 0 && (
              <p className="col-span-full py-16 text-center text-sm text-base-400">
                {search ? 'لا توجد منتجات مطابقة لبحثك' : 'لا توجد منتجات بعد — أضفها من صفحة المنتجات'}
              </p>
            )}
          </div>
        </div>
        <ErrorBanner message={error} />
      </div>

      {/* Right: cart */}
      <div className="card flex h-full flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-base-700/60 px-5 py-4">
          <h2 className="text-base font-semibold text-base-100">البيع الحالي</h2>
          <span className="badge bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
            {itemCount} {itemCount === 1 ? 'سلعة' : 'سلع'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-base-400">
              <svg className="h-12 w-12 text-base-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6a1 1 0 00.9 1.4H19" />
              </svg>
              <div className="text-sm">امسح الباركود لبدء البيع</div>
            </div>
          ) : (
            <ul className="divide-y divide-base-700/50">
              {cart.map((line) => (
                <li key={line.product.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-base-100">{line.product.name}</div>
                    <div className="text-[11px] text-base-400" dir="ltr">
                      {formatMoney(line.product.sellPrice)} / {line.product.unit}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setQty(line.product.id, line.qty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-base-700 text-base-200 transition-colors hover:bg-base-600 hover:text-white"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={0}
                      step={0.001}
                      value={line.qty}
                      onChange={(e) => setQty(line.product.id, Number(e.target.value))}
                      className="h-7 w-14 rounded-md border border-base-600/60 bg-base-900 px-1 text-center text-sm font-semibold text-base-100 outline-none focus:border-emerald-500"
                      dir="ltr"
                    />
                    <button
                      onClick={() => setQty(line.product.id, line.qty + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-base-700 text-base-200 transition-colors hover:bg-base-600 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                  <div className="w-20 text-end font-mono text-sm font-semibold tabular-nums text-base-100" dir="ltr">
                    {formatMoney(line.product.sellPrice * line.qty)}
                  </div>
                  <button
                    onClick={() => removeLine(line.product.id)}
                    className="rounded-md p-1.5 text-base-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`حذف ${line.product.name}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-base-700/60 px-5 py-4">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-sm text-base-300">المجموع الفرعي</span>
            <span className="font-mono text-2xl font-bold tabular-nums text-white" dir="ltr">
              {formatMoney(subtotal)}
            </span>
          </div>
          <div className="mb-4 flex items-baseline justify-between">
            <span className="text-sm text-base-400">{itemCount} سلعة</span>
            <span className="text-xs text-base-400">{message ?? '\u00A0'}</span>
          </div>
          <Button
            size="lg"
            className="w-full py-3.5 text-base"
            disabled={cart.length === 0}
            onClick={() => setPayOpen(true)}
          >
            إتمام البيع
          </Button>
        </div>
      </div>

      {payOpen && (
        <PaymentModal
          cart={cart}
          subtotal={subtotal}
          onClose={() => setPayOpen(false)}
          onPaid={handlePaid}
        />
      )}

      {completed && <ReceiptModal sale={completed} onClose={() => setCompleted(null)} />}
    </div>
  )
}

function PaymentModal({
  cart,
  subtotal,
  onClose,
  onPaid,
}: {
  cart: CartLine[]
  subtotal: number
  onClose: () => void
  onPaid: (sale: Sale) => void
}) {
  const [discount, setDiscount] = useState('0')
  const [taxRate, setTaxRate] = useState('0')
  const [method, setMethod] = useState<PaymentMethod>('CASH')
  const [amountPaid, setAmountPaid] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const disc = Math.max(0, Number(discount) || 0)
  const tax = (subtotal - disc) * (Number(taxRate) || 0)
  const total = subtotal - disc + tax
  const paid = Number(amountPaid) || 0
  const change = paid - total
  const insufficient = paid > 0 && paid < total

  async function submit() {
    setError(null)
    setBusy(true)
    try {
      const { sale } = await saleApi.checkout({
        items: cart.map((line) => ({ productId: line.product.id, qty: line.qty })),
        discount: disc,
        taxRate: Number(taxRate) || 0,
        paymentMethod: method,
        amountPaid: paid,
      })
      onPaid(sale)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل إتمام البيع')
      setBusy(false)
    }
  }

  const methodLabels: Record<PaymentMethod, string> = {
    CASH: 'نقدي',
    CARD: 'بطاقة',
    MIXED: 'مختلط',
  }

  return (
    <Modal open onClose={onClose} title="الدفع">
      <div className="space-y-5">
        <div className="rounded-xl border border-base-700 bg-base-900/80 p-4 tabular-nums">
          <div className="flex justify-between py-0.5 text-sm text-base-300">
            <span>المجموع الفرعي</span><span className="font-mono" dir="ltr">{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between py-0.5 text-sm text-base-300">
            <span>الخصم</span><span className="font-mono" dir="ltr">-{formatMoney(disc)}</span>
          </div>
          <div className="flex justify-between py-0.5 text-sm text-base-300">
            <span>الضريبة</span><span className="font-mono" dir="ltr">{formatMoney(tax)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-base-700 pt-2 text-lg font-bold text-white">
            <span>الإجمالي</span><span className="font-mono text-emerald-400" dir="ltr">{formatMoney(total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="الخصم (بالريال)">
            <input
              type="number"
              min={0}
              step={0.01}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="input"
              dir="ltr"
            />
          </Field>
          <Field label="نسبة الضريبة (0–1)">
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="input"
              dir="ltr"
            />
          </Field>
        </div>

        <Field label="طريقة الدفع">
          <div className="grid grid-cols-3 gap-2">
            {(['CASH', 'CARD', 'MIXED'] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
                  method === m
                    ? 'bg-emerald-500 text-emerald-950 shadow-[0_0_20px_-6px_rgba(16,185,129,0.6)]'
                    : 'bg-base-800 text-base-300 ring-1 ring-base-600/60 hover:bg-base-700 hover:text-white'
                }`}
              >
                {methodLabels[m]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="المبلغ المدفوع">
          <input
            type="number"
            min={0}
            step={0.01}
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="input font-mono text-lg"
            dir="ltr"
            autoFocus
          />
        </Field>

        {paid > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-base-700 bg-base-900/80 px-4 py-3">
            <span className="text-sm text-base-300">الباقي</span>
            <span
              className={`font-mono text-xl font-bold tabular-nums ${
                insufficient ? 'text-red-400' : 'text-emerald-400'
              }`}
              dir="ltr"
            >
              {formatMoney(Math.max(0, change))}
            </span>
          </div>
        )}

        <ErrorBanner message={error} />

        <div className="flex gap-2">
          <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>
            إلغاء
          </Button>
          <Button size="lg" className="flex-1" disabled={busy || paid < total} onClick={submit}>
            {busy ? 'جارٍ المعالجة…' : `تحصيل ${formatMoney(total)}`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function ReceiptModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function print() {
    setBusy(true)
    setError(null)
    try {
      await saleApi.print(sale.id)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشلت الطباعة')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={`إيصال ${sale.receiptNo}`}>
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center">
          <div className="text-lg font-bold text-emerald-300">تم البيع بنجاح!</div>
          <div className="font-mono text-sm text-emerald-400/80" dir="ltr">
            الباقي: {formatMoney(sale.changeDue)}
          </div>
        </div>

        <div className="rounded-xl border border-base-700 bg-base-900 p-4 text-sm tabular-nums">
          <div className="mb-3 border-b border-dashed border-base-700 pb-3 text-center">
            <div className="font-mono font-bold tracking-widest text-white" dir="ltr">{sale.receiptNo}</div>
            <div className="mt-1 text-[11px] text-base-400">{new Date(sale.createdAt).toLocaleString('ar')}</div>
            <div className="text-[11px] text-base-400">الكاشير: {sale.cashierName}</div>
          </div>
          <div className="space-y-1.5">
            {sale.items.map((item) => (
              <div key={item.id} className="flex items-baseline gap-2">
                <span className="min-w-0 flex-1 truncate text-base-100">{item.productName}</span>
                <span className="shrink-0 text-base-400 font-mono" dir="ltr">{item.qty} × {formatMoney(item.unitPrice)}</span>
                <span className="w-20 shrink-0 text-end font-mono font-semibold text-white" dir="ltr">
                  {formatMoney(item.lineTotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-dashed border-base-700 pt-3 text-base-300">
            <div className="flex justify-between"><span>المجموع الفرعي</span><span className="font-mono" dir="ltr">{formatMoney(sale.subtotal)}</span></div>
            <div className="flex justify-between"><span>الخصم</span><span className="font-mono" dir="ltr">-{formatMoney(sale.discount)}</span></div>
            <div className="flex justify-between"><span>الضريبة</span><span className="font-mono" dir="ltr">{formatMoney(sale.tax)}</span></div>
            <div className="flex justify-between text-base font-bold text-white">
              <span>الإجمالي</span><span className="font-mono text-emerald-400" dir="ltr">{formatMoney(sale.total)}</span>
            </div>
            <div className="flex justify-between"><span>المدفوع ({sale.paymentMethod})</span><span className="font-mono" dir="ltr">{formatMoney(sale.amountPaid)}</span></div>
            <div className="flex justify-between text-emerald-400">
              <span>الباقي</span><span className="font-mono" dir="ltr">{formatMoney(sale.changeDue)}</span>
            </div>
          </div>
        </div>

        <ErrorBanner message={error} />

        <div className="flex gap-2">
          <Button variant="secondary" size="lg" className="flex-1" onClick={onClose}>
            بيع جديد
          </Button>
          <Button size="lg" className="flex-1" disabled={busy} onClick={print}>
            {busy ? 'جارٍ الطباعة…' : 'طباعة الإيصال'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}