import { useEffect, useState } from 'react'
import { ApiError } from '../../../shared/api/client'
import type { Settings as SettingsMap } from '../../../shared/api/types'
import { Button, ErrorBanner, Field, Spinner, SuccessBanner, inputCls } from '../../../shared/components/ui'
import { settingsApi } from '../data/settings.api'

const defaultKeys = ['storeName', 'currencySymbol', 'taxRate', 'receiptFooter', 'printerInterface']

export default function Settings() {
  const [settings, setSettings] = useState<SettingsMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsApi
      .get()
      .then(({ settings }) => setSettings(settings))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'فشل تحميل الإعدادات'))
      .finally(() => setLoading(false))
  }, [])

  function set(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const { settings: updated } = await settingsApi.update(settings)
      setSettings(updated)
      setSuccess('تم حفظ الإعدادات')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'فشل الحفظ')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner label="جارٍ تحميل الإعدادات…" />

  const extra = Object.entries(settings).filter(([k]) => !defaultKeys.includes(k))

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">الإعدادات</h1>
        <p className="text-sm text-base-400">بيانات المتجر المستخدمة في الإيصالات ونقطة البيع</p>
      </div>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />
      <div className="card space-y-5 p-6">
        <Field label="اسم المتجر" hint="يظهر في الإيصالات">
          <input className={inputCls} value={settings.storeName ?? ''} onChange={(e) => set('storeName', e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="رمز العملة">
            <input className={inputCls} dir="ltr" value={settings.currencySymbol ?? ''} onChange={(e) => set('currencySymbol', e.target.value)} />
          </Field>
          <Field label="نسبة الضريبة (0–1)" hint="تُستخدم في الإيصالات المطبوعة">
            <input className={inputCls} dir="ltr" value={settings.taxRate ?? ''} onChange={(e) => set('taxRate', e.target.value)} />
          </Field>
        </div>
        <Field label="تذييل الإيصال">
          <input className={inputCls} value={settings.receiptFooter ?? ''} onChange={(e) => set('receiptFooter', e.target.value)} />
        </Field>
        <Field label="واجهة الطابعة" hint="usb أو tcp://192.168.x.x أو /dev/usb/lp0">
          <input className={inputCls} dir="ltr" value={settings.printerInterface ?? ''} onChange={(e) => set('printerInterface', e.target.value)} />
        </Field>
        {extra.length > 0 && (
          <div className="space-y-4 border-t border-base-700/60 pt-5">
            <div className="text-xs font-semibold text-base-400">إعدادات أخرى</div>
            {extra.map(([k, v]) => (
              <Field key={k} label={k}>
                <input className={inputCls} value={v} onChange={(e) => set(k, e.target.value)} />
              </Field>
            ))}
          </div>
        )}
        <div className="flex justify-end border-t border-base-700/60 pt-5">
          <Button onClick={save} disabled={saving}>
            {saving ? 'جارٍ الحفظ…' : 'حفظ الإعدادات'}
          </Button>
        </div>
      </div>
    </div>
  )
}