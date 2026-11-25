import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell, CalendarDays, CreditCard, LayoutDashboard, LogOut, Menu, Music2, Users, UserRound, X,
} from 'lucide-react'
import { useAuth } from '../../auth/useAuth'

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Manage Users', to: '/admin/users', icon: Users },
  { label: 'Manage Musicians', to: '/admin/musicians', icon: Music2 },
  { label: 'Manage Customers', to: '/admin/customers', icon: UserRound },
  { label: 'Manage Bookings', to: '/admin/bookings', icon: CalendarDays },
  { label: 'Manage Payments', to: '/admin/payments', icon: CreditCard },
  { label: 'Notifications', to: '/admin/notifications', icon: Bell },
]

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    setLogoutError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Could not log out. Please try again.')
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-[#101820] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
        <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-3 text-white">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400 text-slate-950"><Music2 size={21} /></span>
          <span className="text-sm font-extrabold tracking-[0.14em]">MUSIBANDA</span>
        </Link>
        <button type="button" className="rounded-lg p-2 text-slate-300 md:hidden" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
          <X size={20} />
        </button>
      </div>
      <nav aria-label="Administrator navigation" className="flex-1 space-y-1 px-3 py-5">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 truncate px-2 text-xs text-slate-400">{user?.email}</div>
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white">
          <LogOut size={18} /> Log out
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 md:block">{sidebar}</aside>
      {menuOpen && <button className="fixed inset-0 z-30 bg-slate-950/50 md:hidden" aria-label="Close menu overlay" onClick={() => setMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 transition-transform md:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>{sidebar}</aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">
          <button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden" aria-label="Open navigation">
            <Menu size={21} />
          </button>
          <div className="hidden text-sm font-medium text-slate-500 md:block">Administrator workspace</div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-slate-700 sm:block">{user?.fullName}</span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-sm font-bold text-amber-900">{user?.fullName.charAt(0).toUpperCase()}</span>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-9">
          {logoutError && <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{logoutError}</p>}
          <Outlet />
        </main>
      </div>
    </div>
  )
}
