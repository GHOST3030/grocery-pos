import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './features/auth/presentation/AuthContext'
import type { Role } from './shared/api/types'
import Layout from './shared/components/Layout'
import Login from './features/auth/presentation/Login'
import Pos from './features/pos/presentation/Pos'
import Products from './features/products/presentation/Products'
import Categories from './features/categories/presentation/Categories'
import Suppliers from './features/suppliers/presentation/Suppliers'
import Sales from './features/sales/presentation/Sales'
import Reports from './features/reports/presentation/Reports'
import Settings from './features/settings/presentation/Settings'
import { Spinner } from './shared/components/ui'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireRole({ role, children }: { role: Role[]; children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user || !role.includes(user.role)) return <Navigate to="/pos" replace />
  return <>{children}</>
}

function Home() {
  const { user } = useAuth()
  return <Navigate to={user?.role === 'CASHIER' ? '/pos' : '/products'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/pos" element={<Pos />} />
            <Route path="/products" element={<Products />} />
            <Route
              path="/categories"
              element={
                <RequireRole role={['MANAGER']}>
                  <Categories />
                </RequireRole>
              }
            />
            <Route
              path="/suppliers"
              element={
                <RequireRole role={['MANAGER']}>
                  <Suppliers />
                </RequireRole>
              }
            />
            <Route
              path="/sales"
              element={
                <RequireRole role={['MANAGER', 'ACCOUNTANT']}>
                  <Sales />
                </RequireRole>
              }
            />
            <Route
              path="/reports"
              element={
                <RequireRole role={['MANAGER', 'ACCOUNTANT']}>
                  <Reports />
                </RequireRole>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireRole role={['MANAGER']}>
                  <Settings />
                </RequireRole>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}