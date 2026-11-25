import { useEffect, useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { EmptyState, LoadingState, PageTitle, StatusBadge } from '../../components/admin/AdminUI'
import { formatDate } from '../../components/admin/formatDate'

type BookingRecord = {
  id: string
  event_date: string
  event_type: string
  location: string
  status: string
  amount: string
  customer_name: string
  musician_name: string
}
type BookingDetail = BookingRecord & {
  notes: string
  customer_email: string
  musician_email: string
}

const statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected']

export default function Bookings() {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    apiRequest<{ bookings: BookingRecord[] }>(`/admin/bookings?${params}`)
      .then((result) => { if (active) setBookings(result.bookings) })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load bookings.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [search, status])

  async function viewDetails(id: string) {
    setDetailLoading(true)
    setSelected(null)
    setError('')
    try {
      const result = await apiRequest<{ booking: BookingDetail }>(`/admin/bookings/${id}`)
      setSelected(result.booking)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load booking details.')
    } finally {
      setDetailLoading(false)
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setSearch(searchText.trim())
  }

  return (
    <>
      <PageTitle title="Manage Bookings" description="Search event reservations and review their current status." />
      <form onSubmit={submitSearch} className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search bookings</span><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search event, customer, musician, or location" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" />
        </label>
        <select aria-label="Filter by booking status" value={status} onChange={(event) => { setLoading(true); setStatus(event.target.value) }} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          <option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <button className="rounded-xl bg-[#101827] px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Search</button>
      </form>
      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {detailLoading && <p role="status" className="mb-4 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-800">Loading booking details…</p>}
      {selected && (
        <section className="mb-5 rounded-2xl border border-violet-200 bg-violet-50/50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="font-bold text-slate-900">{selected.event_type}</h2><p className="mt-1 text-sm text-slate-600">{selected.location} · {formatDate(selected.event_date)}</p></div>
            <button type="button" onClick={() => setSelected(null)} className="text-sm font-semibold text-violet-700">Close</button>
          </div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <p><span className="font-semibold text-slate-700">Customer:</span> {selected.customer_name} ({selected.customer_email})</p>
            <p><span className="font-semibold text-slate-700">Musician:</span> {selected.musician_name} ({selected.musician_email})</p>
            <p><span className="font-semibold text-slate-700">Amount:</span> PHP {Number(selected.amount).toLocaleString()}</p>
            <p><span className="font-semibold text-slate-700">Status:</span> <StatusBadge value={selected.status} /></p>
          </div>
          <p className="mt-3 text-sm text-slate-600"><span className="font-semibold text-slate-700">Notes:</span> {selected.notes || 'No notes provided.'}</p>
        </section>
      )}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <LoadingState /> : bookings.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-4 font-semibold">Event</th><th className="px-5 py-4 font-semibold">Customer</th><th className="px-5 py-4 font-semibold">Musician</th><th className="px-5 py-4 font-semibold">Event date</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4 font-semibold">Details</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-5 py-4"><p className="font-semibold text-slate-800">{booking.event_type}</p><p className="text-xs text-slate-500">{booking.location}</p></td>
                    <td className="px-5 py-4 text-slate-600">{booking.customer_name}</td><td className="px-5 py-4 text-slate-600">{booking.musician_name}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(booking.event_date)}</td><td className="px-5 py-4"><StatusBadge value={booking.status} /></td>
                    <td className="px-5 py-4"><button type="button" onClick={() => void viewDetails(booking.id)} className="font-semibold text-violet-700 hover:text-violet-900">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState>No matching bookings found.</EmptyState>}
      </section>
    </>
  )
}