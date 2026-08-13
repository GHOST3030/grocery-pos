import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/client'
import type { Category } from '../../../shared/api/types'
import {
  Button,
  ErrorBanner,
  Field,
  Modal,
  Spinner,
  SuccessBanner,
  inputCls,
} from '../../../shared/components/ui'
import { categoryApi } from '../data/category.api'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { categories } = await categoryApi.list()
      setCategories(categories)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل تحميل الأصناف')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditing(null)
    setName('')
    setFormOpen(true)
  }

  function openEdit(c: Category) {
    setEditing(c)
    setName(c.name)
    setFormOpen(true)
  }

  async function submit() {
    setError(null)
    try {
      if (editing) {
        await categoryApi.update(editing.id, name.trim())
        setSuccess('تم تحديث الصنف')
      } else {
        await categoryApi.create(name.trim())
        setSuccess('تمت إضافة الصنف')
      }
      setFormOpen(false)
      load()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الحفظ')
    }
  }

  async function remove(c: Category) {
    if (!confirm(`حذف الصنف "${c.name}"؟`)) return
    try {
      await categoryApi.remove(c.id)
      setSuccess('تم حذف الصنف')
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
          <h1 className="text-xl font-bold tracking-tight text-white">الأصناف</h1>
          <p className="text-sm text-base-400">{categories.length} صنف</p>
        </div>
        <Button onClick={openCreate}>+ إضافة صنف</Button>
      </div>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />
      {loading ? (
        <Spinner label="جارٍ تحميل الأصناف…" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="th">الاسم</th>
                <th className="th">تاريخ الإنشاء</th>
                <th className="th text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-700/50">
              {categories.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-base-800/50">
                  <td className="td">
                    <span className="inline-flex items-center gap-2 font-medium text-base-100">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.5 0 1 .2 1.4.6l3.3 3.3c.4.4.6.9.6 1.4V13a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
                        </svg>
                      </span>
                      {c.name}
                    </span>
                  </td>
                  <td className="td text-base-400">
                    {new Date(c.createdAt).toLocaleDateString('ar')}
                  </td>
                  <td className="td text-end">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(c)}>
                        تعديل
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => remove(c)}>
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="td py-16 text-center text-base-400">
                    لا توجد أصناف بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'تعديل الصنف' : 'إضافة صنف'}>
        <Field label="الاسم">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setFormOpen(false)}>
            إلغاء
          </Button>
          <Button className="flex-1" disabled={!name.trim()} onClick={submit}>
            حفظ
          </Button>
        </div>
      </Modal>
    </div>
  )
}