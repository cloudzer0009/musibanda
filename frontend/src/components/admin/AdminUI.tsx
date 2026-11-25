import type { ReactNode } from 'react'

export function PageTitle({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    confirmed: 'bg-emerald-50 text-emerald-700',
    paid: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-blue-50 text-blue-700',
    pending: 'bg-amber-50 text-amber-700',
    inactive: 'bg-slate-100 text-slate-600',
    cancelled: 'bg-rose-50 text-rose-700',
    rejected: 'bg-rose-50 text-rose-700',
    failed: 'bg-rose-50 text-rose-700',
    refunded: 'bg-violet-50 text-violet-700',
  }
  const label = value.charAt(0).toUpperCase() + value.slice(1)
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[value.toLowerCase()] ?? 'bg-slate-100 text-slate-600'}`}>{label}</span>
}

export function Notice({ children, variant = 'error' }: { children: ReactNode; variant?: 'error' | 'success' }) {
  return (
    <div role="status" className={`rounded-xl border px-4 py-3 text-sm ${variant === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
      {children}
    </div>
  )
}

export function LoadingState() {
  return <p className="px-5 py-12 text-center text-sm text-slate-500" role="status">Loading records…</p>
}

export function EmptyState({ children = 'No records found.' }: { children?: ReactNode }) {
  return <p className="px-5 py-12 text-center text-sm text-slate-500">{children}</p>
}

