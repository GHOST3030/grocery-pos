import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { ApiError } from '../../../shared/api/client'
import { Button, ErrorBanner, Field } from '../../../shared/components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const user = await login(username, password)
      navigate(user.role === 'CASHIER' ? '/pos' : '/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-950 px-4">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -end-24 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-3xl" />

      <div className="card relative w-full max-w-sm p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-3xl font-black text-emerald-950 shadow-[0_0_40px_-6px_rgba(31,107,74,0.7)]">
            $
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">نظام نقاط البيع</h1>
          <p className="mt-1 text-sm text-base-400">سجّل الدخول إلى جهاز البيع</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="اسم المستخدم">
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              autoFocus
              autoComplete="username"
            />
          </Field>
          <Field label="كلمة المرور">
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              autoComplete="current-password"
            />
          </Field>
          <ErrorBanner message={error} />
          <Button size="lg" className="w-full" disabled={busy || !username || !password}>
            {busy ? 'جارٍ تسجيل الدخول…' : 'تسجيل الدخول'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-base-400">
          بيانات تجريبية: <span className="font-mono text-base-300">admin</span> /{' '}
          <span className="font-mono text-base-300">password123</span>
        </p>
      </div>
    </div>
  )
}