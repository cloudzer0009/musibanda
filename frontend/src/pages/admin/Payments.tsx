import { useEffect, useState } from 'react'
import { apiRequest } from '../../lib/api'
import { EmptyState, LoadingState, PageTitle, StatusBadge } from '../../components/admin/AdminUI'
import { formatDate } from '../../components/admin/formatDate'

type PaymentRecord = {
  id: string
  amount: string
  currency: string
  status: string
  payment_method: string
  reference: string
  created_at: string
  booking_id: string
  event_type: string
  event_date: string
  customer_name: string
}

export default function Payments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest<{ payments: PaymentRecord[] }>('/admin/payments')
      .then((result) => setPayments(result.payments))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Could not load payment records.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageTitle title="Manage Payments" description="Review payment records and their current status." />
      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <LoadingState /> : payments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-4 font-semibold">Customer / event</th><th className="px-5 py-4 font-semibold">Booking</th><th className="px-5 py-4 font-semibold">Amount</th><th className="px-5 py-4 font-semibold">Method / reference</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4 font-semibold">Recorded</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-5 py-4"><p className="font-semibold text-slate-800">{payment.customer_name}</p><p className="text-xs text-slate-500">{payment.event_type}</p></td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600">{payment.booking_id.slice(0, 8)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{payment.currency} {Number(payment.amount).toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-600">{payment.payment_method || '—'}<p className="text-xs text-slate-400">{payment.reference || 'No reference'}</p></td>
                    <td className="px-5 py-4"><StatusBadge value={payment.status} /></td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(payment.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState>No payment records have been created yet.</EmptyState>}
      </section>
      <p className="mt-3 text-xs text-slate-500">Payment verification is read-only until a manual or provider verification workflow is configured.</p>
    </>
  )
}