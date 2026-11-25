import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import type { AccountRole } from './AuthContext'
import { useAuth } from './useAuth'

export default function RequireRole({ role }: { role: AccountRole }) {
  const { user, loading, sessionError } = useAuth()
  const location = useLocation()

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 text-slate-200">Checking your session…</main>
  }
  if (sessionError) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-sm">
          <p role="alert" className="text-sm leading-6 text-rose-700">{sessionError}</p>
          <Link to="/login" className="mt-5 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white">Go to sign in</Link>
        </div>
      </main>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (user.role !== role) return <Navigate to="/" replace />
  return <Outlet />
}
