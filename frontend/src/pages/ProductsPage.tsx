import { useEffect, useState } from 'react';
import { Package, Plus, Search, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { api, apiErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import type { Product } from '../types';

const emptyForm = {
  sku: '',
  name: '',
  costPrice: '',
  sellPrice: '',
  unit: 'pcs',
  stockQty: '',
  reorderLevel: '',
};

export function ProductsPage() {
  const { user } = useAuthStore();
  const canWrite = user?.role === 'MANAGER';

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ products: Product[] }>('/products', {
        params: search ? { search } : undefined,
      });
      setProducts(data.products);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(loadProducts, 300); // debounce search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setForm({
      sku: product.sku,
      name: product.name,
      costPrice: String(product.costPrice),
      sellPrice: String(product.sellPrice),
      unit: product.unit,
      stockQty: String(product.stockQty),
      reorderLevel: String(product.reorderLevel),
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSave() {
    setFormError(null);
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, {
          name: form.name,
          costPrice: Number(form.costPrice),
          sellPrice: Number(form.sellPrice),
          unit: form.unit,
          reorderLevel: Number(form.reorderLevel),
        });
      } else {
        await api.post('/products', {
          sku: form.sku,
          name: form.name,
          costPrice: Number(form.costPrice),
          sellPrice: Number(form.sellPrice),
          unit: form.unit,
          stockQty: Number(form.stockQty || 0),
          reorderLevel: Number(form.reorderLevel || 5),
        });
      }
      setShowForm(false);
      await loadProducts();
    } catch (err) {
      setFormError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(product: Product) {
    if (!confirm(`Deactivate "${product.name}"? It can be restored later by an admin.`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      await loadProducts();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Package className="h-5 w-5 text-evergreen" strokeWidth={2} />
          <p className="font-display text-xl font-bold">Products</p>
        </div>
        {canWrite && (
          <button
            onClick={openCreateForm}
            className="tap-target flex items-center gap-2 rounded-md bg-evergreen px-4 py-2 font-medium text-white transition-colors hover:bg-evergreen-dim"
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
            Add product
          </button>
        )}
      </div>

      <div className="relative mb-4 w-full max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          strokeWidth={2}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU…"
          className="tap-target w-full rounded-md border border-ink/15 bg-surface py-2 pl-9 pr-3 outline-none transition-colors focus:border-evergreen focus:ring-2 focus:ring-evergreen/20"
        />
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-tomato-tint px-3 py-2 text-sm text-tomato">{error}</p>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 bg-paper-dim text-left text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
              <th className="px-4 py-3 text-right font-medium">Stock</th>
              {canWrite && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">
                  Loading…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-ink-faint">
                    <Package className="h-8 w-8" strokeWidth={1.5} />
                    <p className="text-sm text-ink-soft">No products found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-ink-soft">{product.sku}</td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    ${product.sellPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {product.stockQty <= product.reorderLevel ? (
                      <span className="shelf-tag shelf-tag--alert" title="At or below reorder level">
                        <AlertTriangle className="mr-1 h-3 w-3" strokeWidth={2.5} />
                        {product.stockQty} {product.unit}
                      </span>
                    ) : (
                      <span className="font-mono">
                        {product.stockQty} {product.unit}
                      </span>
                    )}
                  </td>
                  {canWrite && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditForm(product)}
                          className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-evergreen-tint hover:text-evergreen"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="h-4 w-4" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleRemove(product)}
                          className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-tomato-tint hover:text-tomato"
                          aria-label={`Remove ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-xl">
            <p className="mb-4 font-display text-lg font-bold">
              {editingId ? 'Edit product' : 'Add product'}
            </p>

            <div className="space-y-3">
              {!editingId && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-soft">
                    SKU / Barcode
                  </label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="tap-target w-full rounded-md border border-ink/15 px-3 py-2 font-mono outline-none focus:border-evergreen focus:ring-2 focus:ring-evergreen/20"
                  />
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-soft">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="tap-target w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-evergreen focus:ring-2 focus:ring-evergreen/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-soft">
                    Cost price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    className="tap-target w-full rounded-md border border-ink/15 px-3 py-2 font-mono outline-none focus:border-evergreen focus:ring-2 focus:ring-evergreen/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-soft">
                    Sell price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.sellPrice}
                    onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
                    className="tap-target w-full rounded-md border border-ink/15 px-3 py-2 font-mono outline-none focus:border-evergreen focus:ring-2 focus:ring-evergreen/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {!editingId && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-ink-soft">
                      Initial stock
                    </label>
                    <input
                      type="number"
                      value={form.stockQty}
                      onChange={(e) => setForm({ ...form, stockQty: e.target.value })}
                      className="tap-target w-full rounded-md border border-ink/15 px-3 py-2 font-mono outline-none focus:border-evergreen focus:ring-2 focus:ring-evergreen/20"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-soft">
                    Reorder level
                  </label>
                  <input
                    type="number"
                    value={form.reorderLevel}
                    onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                    className="tap-target w-full rounded-md border border-ink/15 px-3 py-2 font-mono outline-none focus:border-evergreen focus:ring-2 focus:ring-evergreen/20"
                  />
                </div>
              </div>
            </div>

            {formError && (
              <p className="mt-3 rounded-md bg-tomato-tint px-3 py-2 text-sm text-tomato">
                {formError}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="tap-target flex-1 rounded-md border border-ink/15 px-4 py-2 font-medium hover:bg-paper-dim"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="tap-target flex-1 rounded-md bg-evergreen px-4 py-2 font-medium text-white hover:bg-evergreen-dim disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
