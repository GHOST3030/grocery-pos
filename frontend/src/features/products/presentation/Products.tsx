import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/client'
import type { Category, Product, Supplier } from '../../../shared/api/types'
import {
  Button,
  ErrorBanner,
  Field,
  Modal,
  Spinner,
  SuccessBanner,
  formatMoney,
  inputCls,
} from '../../../shared/components/ui'
import { useAuth } from '../../auth/presentation/AuthContext'
import { categoryApi } from '../../categories/data/category.api'
import { supplierApi } from '../../suppliers/data/supplier.api'
import { productApi } from '../data/product.api'

const emptyForm = {
  sku: '',
  name: '',
  description: '',
  costPrice: '',
  sellPrice: '',
  unit: 'pcs',
  stockQty: '0',
  reorderLevel: '5',
  categoryId: '',
  supplierId: '',
}

export default function Products() {
  const { user } = useAuth()
  const isManager = user?.role === 'MANAGER'
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ products }, { categories }, { suppliers }] = await Promise.all([
        productApi.list({ search: search || undefined, activeOnly: true }),
        categoryApi.list(),
        supplierApi.list(),
      ])
      setProducts(products)
      setCategories(categories)
      setSuppliers(suppliers)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل تحميل المنتجات')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(load, 200)
    return () => clearTimeout(t)
  }, [load])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      sku: p.sku,
      name: p.name,
      description: p.description ?? '',
      costPrice: String(p.costPrice),
      sellPrice: String(p.sellPrice),
      unit: p.unit,
      stockQty: String(p.stockQty),
      reorderLevel: String(p.reorderLevel),
      categoryId: p.categoryId ?? '',
      supplierId: p.supplierId ?? '',
    })
    setFormOpen(true)
  }

  async function submitForm() {
    setError(null)
    const body = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      costPrice: Number(form.costPrice),
      sellPrice: Number(form.sellPrice),
      unit: form.unit,
      stockQty: Number(form.stockQty),
      reorderLevel: Number(form.reorderLevel),
      categoryId: form.categoryId || undefined,
      supplierId: form.supplierId || undefined,
    }
    try {
      if (editing) {
        const { product } = await productApi.update(editing.id, {
          name: body.name,
          description: body.description,
          costPrice: body.costPrice,
          sellPrice: body.sellPrice,
          unit: body.unit,
          reorderLevel: body.reorderLevel,
          categoryId: body.categoryId,
          supplierId: body.supplierId,
        })
        setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)))
        setSuccess(`تم تحديث المنتج "${product.name}"`)
      } else {
        const { product } = await productApi.create(body)
        setProducts((prev) => [...prev, product])
        setSuccess(`تمت إضافة المنتج "${product.name}"`)
      }
      setFormOpen(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الحفظ')
    }
  }

  async function remove(p: Product) {
    if (!confirm(`حذف المنتج "${p.name}"؟ (حذف ناعم — تبقى البيانات محفوظة)`)) return
    try {
      await productApi.remove(p.id)
      setProducts((prev) => prev.filter((x) => x.id !== p.id))
      setSuccess(`تم حذف المنتج "${p.name}"`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الحذف')
    }
  }

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? '—'
  const supName = (id: string | null) => suppliers.find((s) => s.id === id)?.name ?? '—'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">المنتجات</h1>
          <p className="text-sm text-base-400">{products.length} منتج</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن المنتج…"
              className="input w-64 ps-9"
            />
          </div>
          {isManager && <Button onClick={openCreate}>+ إضافة منتج</Button>}
        </div>
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {loading ? (
        <Spinner label="جارٍ تحميل المنتجات…" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="th">الرمز</th>
                <th className="th">الاسم</th>
                <th className="th">الصنف</th>
                <th className="th">المورد</th>
                <th className="th text-end">التكلفة</th>
                <th className="th text-end">السعر</th>
                <th className="th text-end">المخزون</th>
                {isManager && <th className="th text-end">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-base-700/50">
              {products.map((p) => {
                const low = p.stockQty <= p.reorderLevel
                return (
                  <tr key={p.id} className={`transition-colors hover:bg-base-800/50 ${low ? 'bg-amber-500/[0.04]' : ''}`}>
                    <td className="td font-mono text-xs text-base-400" dir="ltr">{p.sku}</td>
                    <td className="td font-medium text-base-100">{p.name}</td>
                    <td className="td">{catName(p.categoryId)}</td>
                    <td className="td">{supName(p.supplierId)}</td>
                    <td className="td text-end font-mono tabular-nums text-base-400" dir="ltr">{formatMoney(p.costPrice)}</td>
                    <td className="td text-end font-mono font-semibold tabular-nums text-emerald-400" dir="ltr">
                      {formatMoney(p.sellPrice)}
                    </td>
                    <td className="td text-end">
                      {low ? (
                        <span className="badge bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
                          {p.stockQty} {p.unit}
                        </span>
                      ) : (
                        <span className="font-mono tabular-nums" dir="ltr">{p.stockQty} {p.unit}</span>
                      )}
                    </td>
                    {isManager && (
                      <td className="td text-end">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="secondary" size="sm" onClick={() => openEdit(p)}>
                            تعديل
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => remove(p)}>
                            حذف
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="td py-16 text-center text-base-400">
                    لا توجد منتجات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `تعديل ${editing.name}` : 'إضافة منتج'}
        wide
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label="الرمز / الباركود">
            <input className={inputCls} dir="ltr" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </Field>
          <Field label="الاسم">
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="سعر التكلفة">
            <input type="number" min={0} step={0.01} className={inputCls} dir="ltr" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
          </Field>
          <Field label="سعر البيع">
            <input type="number" min={0} step={0.01} className={inputCls} dir="ltr" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: e.target.value })} />
          </Field>
          <Field label="الوحدة">
            <input className={inputCls} dir="ltr" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          </Field>
          {!editing && (
            <Field label="المخزون الأولي">
              <input type="number" min={0} step={0.001} className={inputCls} dir="ltr" value={form.stockQty} onChange={(e) => setForm({ ...form, stockQty: e.target.value })} />
            </Field>
          )}
          <Field label="حد إعادة الطلب">
            <input type="number" min={0} step={0.001} className={inputCls} dir="ltr" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
          </Field>
          <Field label="الصنف">
            <select className={inputCls} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">بدون</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="المورد">
            <select className={inputCls} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">بدون</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
          <Field label="الوصف">
            <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setFormOpen(false)}>
            إلغاء
          </Button>
          <Button
            className="flex-1"
            disabled={!form.sku.trim() || !form.name.trim() || form.costPrice === '' || form.sellPrice === ''}
            onClick={submitForm}
          >
            حفظ
          </Button>
        </div>
      </Modal>
    </div>
  )
}