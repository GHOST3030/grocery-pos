import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/presentation/AuthContext'
import type { Role } from '../api/types'

const icons: Record<string, React.ReactNode> = {
  pos: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6a1 1 0 00.9 1.4H19M9 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  ),
  products: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  categories: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.5 0 1 .2 1.4.6l3.3 3.3c.4.4.6.9.6 1.4V13a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z" />
    </svg>
  ),
  suppliers: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.4-1.9M17 20H2m15 0v-2a5 5 0 00-1.5-3.5M9 11a4 4 0 100-8 4 4 0 000 8zm8-3a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  sales: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3-2 2 2 2-2 2 2 2-2 3 2z" />
    </svg>
  ),
  reports: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  settings: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.3 4.3l.7-1.3h2l.7 1.3a2 2 0 002.8.8l1.3-.8 1 1.7-1.2 1a2 2 0 000 2.9l1.2 1-1 1.7-1.3-.8a2 2 0 00-2.8.8l-.7 1.3h-2l-.7-1.3a2 2 0 00-2.8-.8l-1.3.8-1-1.7 1.2-1a2 2 0 000-2.9l-1.2-1 1-1.7 1.3.8a2 2 0 002.8-.8zM12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  ),
}

const navItems: { to: string; label: string; icon: keyof typeof icons; roles: Role[]; end?: boolean }[] = [
  { to: '/pos', label: 'نقطة البيع', icon: 'pos', roles: ['MANAGER', 'ACCOUNTANT', 'CASHIER'] },
  { to: '/products', label: 'المنتجات', icon: 'products', roles: ['MANAGER', 'ACCOUNTANT', 'CASHIER'] },
  { to: '/categories', label: 'الأصناف', icon: 'categories', roles: ['MANAGER'] },
  { to: '/suppliers', label: 'الموردون', icon: 'suppliers', roles: ['MANAGER'] },
  { to: '/sales', label: 'المبيعات', icon: 'sales', roles: ['MANAGER', 'ACCOUNTANT'] },
  { to: '/reports', label: 'التقارير', icon: 'reports', roles: ['MANAGER', 'ACCOUNTANT'] },
  { to: '/settings', label: 'الإعدادات', icon: 'settings', roles: ['MANAGER'] },
]

const roleBadge: Record<Role, string> = {
  MANAGER: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  ACCOUNTANT: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  CASHIER: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
}

const roleNames: Record<Role, string> = {
  MANAGER: 'مدير',
  ACCOUNTANT: 'محاسب',
  CASHIER: 'كاشير',
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex min-h-screen bg-base-950">
      <aside className="fixed inset-y-0 start-0 z-40 flex w-60 flex-col border-e border-base-700/60 bg-base-900">
        <div className="flex items-center gap-3 border-b border-base-700/60 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-lg font-black text-emerald-950 shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)]">
            $
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white">نظام نقاط البيع</div>
            <div className="text-[11px] text-base-400">Grocery POS</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems
            .filter((item) => user.role && item.roles.includes(user.role))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                      : 'text-base-300 hover:bg-base-800 hover:text-white'
                  }`
                }
              >
                {icons[item.icon]}
                {item.label}
              </NavLink>
            ))}
        </nav>

        <div className="border-t border-base-700/60 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-base-800/60 px-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-700 text-xs font-bold text-base-100">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-base-100">{user.fullName}</div>
              <span className={`badge mt-0.5 ring-1 ${roleBadge[user.role]}`}>
                {roleNames[user.role]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="rounded-lg p-2 text-base-400 transition-colors hover:bg-base-700 hover:text-red-300"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <main className="ms-60 flex-1 px-8 py-6">
        <Outlet />
      </main>
    </div>
  )
}