import { useRef, useState, type FormEvent } from 'react';
import { ScanBarcode, ShoppingCart, X, CheckCircle2, Printer, Receipt, Banknote, CreditCard, Layers } from 'lucide-react';
import { api, apiErrorMessage } from '../lib/api';
import { useCartStore } from '../store/cartStore';
import type { PaymentMethod, Product, Sale } from '../types';

const PAYMENT_ICONS: Record<PaymentMethod, typeof Banknote> = {
  CASH: Banknote,
  CARD: CreditCard,
  MIXED: Layers,
};

const CURRENCY = '$';

export function CheckoutPage() {
  const { lines, addProduct, setQty, removeLine, clear, subtotal } = useCartStore();
  const [barcode, setBarcode] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amountPaid, setAmountPaid] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const total = subtotal(); // tax/discount computed server-side at checkout; shown post-sale

  async function handleScan(e: FormEvent) {
    e.preventDefault();
    if (!barcode.trim()) return;
    setScanError(null);
    try {
      const { data } = await api.get<{ product: Product }>(
        `/products/sku/${encodeURIComponent(barcode.trim())}`
      );
      addProduct(data.product, 1);
      setBarcode('');
    } catch (err) {
      setScanError(apiErrorMessage(err));
    } finally {
      scanInputRef.current?.focus();
    }
  }

  async function handleCheckout() {
    if (lines.length === 0) return;
    setCheckoutError(null);
    setCheckingOut(true);
    try {
      const { data } = await api.post<{ sale: Sale }>('/sales/checkout', {
        items: lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
        paymentMethod,
        amountPaid: Number(amountPaid || total),
      });
      setCompletedSale(data.sale);
      clear();
      setAmountPaid('');
    } catch (err) {
      setCheckoutError(apiErrorMessage(err));
    } finally {
      setCheckingOut(false);
    }
  }

  async function handlePrint(saleId: string) {
    try {
      await api.post(`/sales/${saleId}/print`);
    } catch (err) {
      setCheckoutError(apiErrorMessage(err));
    }
  }

  if (completedSale) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="w-full max-w-md card border-evergreen/20 p-6">
          <div className="mb-1 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-evergreen" strokeWidth={2} />
            <p className="font-display text-lg font-bold text-evergreen">Sale complete</p>
          </div>
          <p className="font-mono text-sm text-ink-soft">Receipt #{completedSale.receiptNo}</p>

          <hr className="tear-line my-4" />

          <div className="space-y-1 font-mono text-sm">
            {completedSale.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.qty} × {item.productName}
                </span>
                <span>{CURRENCY}{item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <hr className="tear-line my-4" />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="shelf-tag">{CURRENCY}{completedSale.total.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-ink-soft">
            <span>Change due</span>
            <span>{CURRENCY}{completedSale.changeDue.toFixed(2)}</span>
          </div>

          {checkoutError && (
            <p className="mt-3 rounded-md bg-tomato-tint px-3 py-2 text-sm text-tomato">
              {checkoutError}
            </p>
          )}

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => handlePrint(completedSale.id)}
              className="tap-target flex flex-1 items-center justify-center gap-2 rounded-md border border-evergreen px-4 py-2 font-medium text-evergreen transition-colors hover:bg-evergreen-tint"
            >
              <Printer className="h-4 w-4" strokeWidth={2} />
              Print receipt
            </button>
            <button
              onClick={() => setCompletedSale(null)}
              className="tap-target flex flex-1 items-center justify-center gap-2 rounded-md bg-evergreen px-4 py-2 font-medium text-white transition-colors hover:bg-evergreen-dim"
            >
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
              New sale
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Scan + cart */}
      <div className="flex flex-1 flex-col p-6">
        <form onSubmit={handleScan} className="mb-4">
          <label htmlFor="barcode" className="mb-1 block text-sm font-medium text-ink-soft">
            Scan barcode or enter SKU
          </label>
          <div className="relative">
            <ScanBarcode
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint"
              strokeWidth={2}
            />
            <input
              id="barcode"
              ref={scanInputRef}
              autoFocus
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan item…"
              className="tap-target w-full rounded-md border border-ink/15 bg-surface py-3 pl-12 pr-4 font-mono text-lg outline-none transition-colors focus:border-evergreen focus:ring-2 focus:ring-evergreen/20"
            />
          </div>
        </form>
        {scanError && (
          <p className="mb-4 rounded-md bg-tomato-tint px-3 py-2 text-sm text-tomato">
            {scanError}
          </p>
        )}

        <div className="card flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-ink-faint">
              <ShoppingCart className="h-10 w-10" strokeWidth={1.5} />
              <p className="text-sm text-ink-soft">Cart is empty — scan an item to begin.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-ink/10 text-left text-ink-soft">
                <tr>
                  <th className="px-4 py-2 font-medium">Item</th>
                  <th className="px-4 py-2 font-medium">Qty</th>
                  <th className="px-4 py-2 text-right font-medium">Price</th>
                  <th className="px-4 py-2 text-right font-medium">Total</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.product.id} className="border-b border-ink/5">
                    <td className="px-4 py-3">
                      <p className="font-medium">{line.product.name}</p>
                      <p className="font-mono text-xs text-ink-soft">{line.product.sku}</p>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={line.qty}
                        onChange={(e) => setQty(line.product.id, Number(e.target.value))}
                        className="w-16 rounded border border-ink/15 px-2 py-1 font-mono"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {CURRENCY}{line.product.sellPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {CURRENCY}{(line.product.sellPrice * line.qty).toFixed(2)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button
                        onClick={() => removeLine(line.product.id)}
                        className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-tomato-tint hover:text-tomato"
                        aria-label={`Remove ${line.product.name}`}
                      >
                        <X className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Checkout panel */}
      <aside className="flex w-80 flex-col border-l border-ink/10 bg-surface p-6">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-evergreen" strokeWidth={2} />
          <p className="font-display text-lg font-bold">Order summary</p>
        </div>

        <hr className="tear-line my-4" />

        <div className="flex justify-between text-sm text-ink-soft">
          <span>Subtotal ({lines.length} item{lines.length === 1 ? '' : 's'})</span>
          <span className="font-mono">{CURRENCY}{total.toFixed(2)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-soft/70">Tax &amp; discount applied at checkout</p>

        <div className="mt-6 flex justify-between text-lg font-bold">
          <span>Estimated total</span>
          <span className="shelf-tag">{CURRENCY}{total.toFixed(2)}</span>
        </div>

        <div className="mt-6 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-soft">Payment method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['CASH', 'CARD', 'MIXED'] as PaymentMethod[]).map((method) => {
                const Icon = PAYMENT_ICONS[method];
                return (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`tap-target flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                      paymentMethod === method
                        ? 'border-evergreen bg-evergreen-tint text-evergreen-dim'
                        : 'border-ink/15 text-ink-soft hover:bg-paper-dim'
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                    {method}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="amountPaid" className="mb-1 block text-sm font-medium text-ink-soft">
              Amount paid
            </label>
            <input
              id="amountPaid"
              type="number"
              min={0}
              step="0.01"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder={total.toFixed(2)}
              className="tap-target w-full rounded-md border border-ink/15 px-3 py-2 font-mono outline-none focus:border-evergreen focus:ring-2 focus:ring-evergreen/20"
            />
          </div>
        </div>

        {checkoutError && (
          <p className="mt-4 rounded-md bg-tomato-tint px-3 py-2 text-sm text-tomato">
            {checkoutError}
          </p>
        )}

        <button
          onClick={handleCheckout}
          disabled={lines.length === 0 || checkingOut}
          className="tap-target mt-auto flex w-full items-center justify-center gap-2 rounded-md bg-evergreen px-4 py-3 text-lg font-bold text-white transition-colors hover:bg-evergreen-dim disabled:opacity-50"
        >
          {checkingOut ? (
            'Processing…'
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
              Complete sale
            </>
          )}
        </button>
      </aside>
    </div>
  );
}
