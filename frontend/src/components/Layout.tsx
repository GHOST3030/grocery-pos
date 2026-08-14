import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, Package, BarChart3, LogOut, Store } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { to: '/', label: 'Checkout', icon: ShoppingCart, roles: ['MANAGER', 'ACCOUNTANT', 'CASHIER'] },
  { to: '/products', label: 'Products', icon: Package, roles: ['MANAGER', 'ACCOUNTANT', 'CASHIER'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['MANAGER', 'ACCOUNTANT'] },
];

export function Layout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-paper text-ink">
      <aside className="flex w-60 flex-col bg-pine text-white">
        <div className="flex items-center gap-2.5 border-b border-pine-line px-5 py-5">
          <Store className="h-5 w-5 text-mustard" strokeWidth={2.25} />
          <p className="font-display text-lg font-bold tracking-tight">Grocery POS</p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems
            .filter((item) => !user || item.roles.includes(user.role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `tap-target relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-pine-deep text-white'
                        : 'text-white/65 hover:bg-pine-deep/60 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-mustard" />
                      )}
                      <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              );
            })}
        </nav>

        <div className="border-t border-pine-line p-4">
          <div className="mb-3 px-1">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="font-mono text-xs uppercase tracking-wide text-white/50">
              {user?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="tap-target flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:border-tomato/60 hover:bg-tomato/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
