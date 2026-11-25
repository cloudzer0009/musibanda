import { useEffect } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import RequireRole from './auth/RequireRole'
import AdminLayout from './components/admin/AdminLayout'
import SiteFooter from './components/SiteFooter'
import SiteNavigation from './components/SiteNavigation'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import Home from './pages/public/Home'
import Dashboard from './pages/admin/Dashboard'
import Users from './pages/admin/Users'
import Musicians from './pages/admin/Musicians'
import Bookings from './pages/admin/Bookings'
import Payments from './pages/admin/Payments'
import Notifications from './pages/admin/Notifications'

function ScrollToAnchor() {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (!hash) return

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [hash, pathname])

  return null
}

function ComingSoonPage({ title, message }: { title: string; message: string }) {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-stone-50 px-6 py-20">
      <div className="max-w-xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Coming in a future phase
        </span>
        <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{message}</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Return to home
        </Link>
      </div>
    </main>
  )
}

function ApplicationRoutes() {
  const { pathname } = useLocation()
  const showPublicNavigation = pathname === '/'

  return (
    <>
      <ScrollToAnchor />
      {showPublicNavigation && <SiteNavigation />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireRole role="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="musicians" element={<Musicians />} />
            <Route path="customers" element={<Users roleFilter="customer" />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="payments" element={<Payments />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Route>
        <Route path="*" element={<ComingSoonPage title="This page is not ready yet." message="We are building Musibanda one thoughtful step at a time." />} />
      </Routes>
      {showPublicNavigation && <SiteFooter />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ApplicationRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
