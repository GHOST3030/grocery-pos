import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/client'
import type { Supplier } from '../../../shared/api/types'
import {
  Button,
  ErrorBanner,
  Field,
  Modal,
  Spinner,
  SuccessBanner,
  inputCls,
} from '../../../shared/components/ui'
import { supplierApi } from '../data/supplier.api'

const emptyForm = { name: '', phone: '', email: '', address: '' }

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { suppliers } = await supplierApi.list()
      setSuppliers(suppliers)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل تحميل الموردين')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(s: Supplier) {
    setEditing(s)
    setForm({ name: s.name, phone: s.phone ?? '', email: s.email ?? '', address: s.address ?? '' })
    setFormOpen(true)
  }

  async function submit() {
    setError(null)
    const body = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      address: form.address.trim() || undefined,
    }
    try {
      if (editing) {
        await supplierApi.update(editing.id, body)
        setSuccess('تم تحديث المورد')
      } else {
        await supplierApi.create(body)
        setSuccess('تمت إضافة المورد')
      }
      setFormOpen(false)
      load()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الحفظ')
    }
  }

  async function remove(s: Supplier) {
    if (!confirm(`حذف المورد "${s.name}"؟`)) return
    try {
      await supplierApi.remove(s.id)
      setSuccess('تم حذف المورد')
      load()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الحذف')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">الموردون</h1>
          <p className="text-sm text-base-400">{suppliers.length} مورد</p>
        </div>
        <Button onClick={openCreate}>+ إضافة مورد</Button>
      </div>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />
      {loading ? (
        <Spinner label="جارٍ تحميل الموردين…" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="th">الاسم</th>
                <th className="th">الهاتف</th>
                <th className="th">البريد الإلكتروني</th>
                <th className="th">العنوان</th>
                <th className="th text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-700/50">
              {suppliers.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-base-800/50">
                  <td className="td font-medium text-base-100">{s.name}</td>
                  <td className="td font-mono text-xs" dir="ltr">{s.phone ?? '—'}</td>
                  <td className="td" dir="ltr">{s.email ?? '—'}</td>
                  <td className="td text-base-400">{s.address ?? '—'}</td>
                  <td className="td text-end">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>
                        تعديل
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => remove(s)}>
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="td py-16 text-center text-base-400">
                    لا يوجد موردون بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'تعديل المورد' : 'إضافة مورد'}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="الاسم">
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          </Field>
          <Field label="الهاتف">
            <input className={inputCls} dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="البريد الإلكتروني">
            <input className={inputCls} dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="العنوان">
            <input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setFormOpen(false)}>
            إلغاء
          </Button>
          <Button className="flex-1" disabled={!form.name.trim()} onClick={submit}>
            حفظ
          </Button>
        </div>
      </Modal>
    </div>
  )
}