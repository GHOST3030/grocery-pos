import type { ReactNode } from 'react'

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-base-400">
      <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-base-600 border-t-emerald-400" />
      {label && <div className="text-sm">{label}</div>}
    </div>
  )
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v4m0 4h.01M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z"
        />
      </svg>
      {message}
    </div>
  )
}

export function SuccessBanner({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {message}
    </div>
  )
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}) {
  const variants: Record<string, string> = {
    primary:
      'bg-emerald-500 text-emerald-950 font-semibold hover:bg-emerald-400 active:bg-emerald-500 disabled:bg-base-600 disabled:text-base-400 shadow-[0_0_20px_-6px_rgba(31,107,74,0.5)]',
    secondary:
      'bg-base-800 text-base-200 ring-1 ring-base-600/60 hover:bg-base-700 hover:text-white disabled:text-base-400',
    danger: 'bg-red-500/90 text-white font-semibold hover:bg-red-500 disabled:bg-base-600 disabled:text-base-400',
    ghost: 'text-base-300 hover:bg-base-800 hover:text-white disabled:text-base-400',
  }
  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`animate-[modalIn_0.15s_ease-out] max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-base-700 bg-base-850 shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-base-700 px-5 py-4">
          <h2 className="text-base font-semibold text-base-100">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-base-400 transition-colors hover:bg-base-700 hover:text-white"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-base-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-base-400">{hint}</span>}
    </label>
  )
}

export const inputCls = 'input'

export function formatMoney(n: number, symbol = 'R.Y') {
  return `${n.toFixed(2)} ${symbol}`
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ar', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}