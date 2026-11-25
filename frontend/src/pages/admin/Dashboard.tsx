import { useEffect, useState } from 'react'
import { Activity, CalendarDays, CircleDollarSign, Clock3, Music2, Users } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { EmptyState, LoadingState, PageTitle, StatusBadge } from '../../components/admin/AdminUI'
import { formatDate } from '../../components/admin/formatDate'

type DashboardData = {
  totals: {
    users: number
    musicians: number
    customers: number
    bookings: number
    pendingBookings: number
    paymentRecords: number
  }
  bookingStatuses: { status: string; count: number }[]
  recentBookings: { id: string; event_date: string; event_type: string; status: string; amount: string; customer_name: string; musician_name: string }[]
  recentUsers: { id: string; full_name: string; email: string; role: string; created_at: string }[]
}

const cards = [
  { key: 'users', label: 'Total users', icon: Users },
  { key: 'musicians', label: 'Musicians', icon: Music2 },
  { key: 'customers', label: 'Customers', icon: Users },
  { key: 'bookings', label: 'Total bookings', icon: CalendarDays },
  { key: 'pendingBookings', label: 'Pending bookings', icon: Clock3 },
  { key: 'paymentRecords', label: 'Payment records', icon: CircleDollarSign },
] as const

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<DashboardData>('/admin/dashboard')
      .then(setData)
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Could not load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageTitle title="Dashboard" description="A live overview of your Musibanda platform." />
      {error && <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {loading ? <LoadingState /> : data ? (
        <>
          <section aria-label="Platform totals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ key, label, icon: Icon }) => (
              <article key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">{label}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-800"><Icon size={19} /></span>
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{data.totals[key].toLocaleString()}</p>
              </article>
            ))}
          </section>
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                <CalendarDays size={18} className="text-amber-700" />
                <h2 className="font-bold text-slate-900">Recent bookings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr><th className="px-5 py-3 font-semibold">Event</th><th className="px-5 py-3 font-semibold">Customer</th><th className="px-5 py-3 font-semibold">Musician</th><th className="px-5 py-3 font-semibold">Date</th><th className="px-5 py-3 font-semibold">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-5 py-4 font-medium text-slate-800">{booking.event_type}</td>
                        <td className="px-5 py-4 text-slate-600">{booking.customer_name}</td>
                        <td className="px-5 py-4 text-slate-600">{booking.musician_name}</td>
                        <td className="px-5 py-4 text-slate-600">{formatDate(booking.event_date)}</td>
                        <td className="px-5 py-4"><StatusBadge value={booking.status} /></td>
                      </tr>
                    ))}
                    {!data.recentBookings.length && <tr><td colSpan={5}><EmptyState>No bookings have been created yet.</EmptyState></td></tr>}
                  </tbody>
                </table>
              </div>
            </article>
            <div className="space-y-6">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-amber-700" />
                  <h2 className="font-bold text-slate-900">Booking status</h2>
                </div>
                <div className="mt-5 space-y-4">
                  {data.bookingStatuses.map(({ status, count }) => {
                    const total = data.totals.bookings
                    const percent = total ? (count / total) * 100 : 0
                    return (
                      <div key={status}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="capitalize text-slate-600">{status}</span>
                          <span className="font-semibold text-slate-800">{count}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    )
                  })}
                  {!data.bookingStatuses.length && <p className="text-sm text-slate-500">No booking activity yet.</p>}
                </div>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-bold text-slate-900">Recently registered</h2>
                <div className="mt-4 divide-y divide-slate-100">
                  {data.recentUsers.map((registeredUser) => (
                    <div key={registeredUser.id} className="flex items-center justify-between gap-3 py-3 first:pt-1">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{registeredUser.full_name}</p>
                        <p className="truncate text-xs text-slate-500">{registeredUser.email}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600">{registeredUser.role}</span>
                    </div>
                  ))}
                  {!data.recentUsers.length && <EmptyState>No registered users yet.</EmptyState>}
                </div>
              </article>
            </div>
          </section>
        </>
      ) : null}
    </>
  )
}