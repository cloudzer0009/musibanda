import { useEffect, useState, type FormEvent } from 'react'
import { apiRequest } from '../../lib/api'
import { EmptyState, LoadingState, PageTitle } from '../../components/admin/AdminUI'
import { formatDate } from '../../components/admin/formatDate'

type NotificationRecord = {
  id: string
  user_id: string | null
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadNotifications() {
    setLoading(true)
    setError('')
    try {
      const result = await apiRequest<{ notifications: NotificationRecord[] }>('/admin/notifications')
      setNotifications(result.notifications)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load notifications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    apiRequest<{ notifications: NotificationRecord[] }>('/admin/notifications')
      .then((result) => { if (active) setNotifications(result.notifications) })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load notifications.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function createNotification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await apiRequest('/admin/notifications', { method: 'POST', body: { title: title.trim(), message: message.trim() } })
      setTitle('')
      setMessage('')
      setSuccess('Notification created.')
      await loadNotifications()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not create the notification.')
    } finally {
      setSaving(false)
    }
  }

  async function setRead(notification: NotificationRecord, isRead: boolean) {
    setError('')
    try {
      await apiRequest(`/admin/notifications/${notification.id}`, { method: 'PATCH', body: { isRead } })
      await loadNotifications()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update the notification.')
    }
  }

  return (
    <>
      <PageTitle title="Notifications" description="Create system-wide announcements and manage notification records." />
      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {success && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}
      <form onSubmit={createNotification} className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">Create system notification</h2>
        <label className="text-sm font-medium text-slate-700">Title
          <input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" />
        </label>
        <label className="text-sm font-medium text-slate-700">Message
          <textarea required maxLength={2000} rows={3} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" />
        </label>
        <button type="submit" disabled={saving} className="w-fit rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-300 disabled:opacity-60">{saving ? 'Creating…' : 'Create notification'}</button>
      </form>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-bold text-slate-900">Notification records</h2></div>
        {loading ? <LoadingState /> : notifications.length ? (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <li key={notification.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-800">{notification.title}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${notification.is_read ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-800'}`}>{notification.is_read ? 'Read' : 'Unread'}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{notification.user_id ? 'User-specific' : 'System-wide'} · {formatDate(notification.created_at)}</p>
                </div>
                <button type="button" onClick={() => void setRead(notification, !notification.is_read)} className="shrink-0 text-left text-sm font-semibold text-amber-800 hover:text-amber-950">
                  Mark as {notification.is_read ? 'unread' : 'read'}
                </button>
              </li>
            ))}
          </ul>
        ) : <EmptyState>No notifications have been created.</EmptyState>}
      </section>
    </>
  )
}
