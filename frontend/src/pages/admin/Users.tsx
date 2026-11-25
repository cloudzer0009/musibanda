import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import type { AccountRole } from '../../auth/AuthContext'
import { apiRequest } from '../../lib/api'
import { EmptyState, LoadingState, PageTitle, StatusBadge } from '../../components/admin/AdminUI'
import { formatDate } from '../../components/admin/formatDate'

type UserRecord = {
  id: string
  full_name: string
  email: string
  phone: string
  role: AccountRole
  is_active: boolean
  created_at: string
}

export default function Users({ roleFilter }: { roleFilter?: 'customer' | 'musician' }) {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      const result = await apiRequest<{ users: UserRecord[] }>(`/admin/users?${params}`)
      setUsers(result.users)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load users.')
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter])

  useEffect(() => {
    let active = true
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (roleFilter) params.set('role', roleFilter)
    apiRequest<{ users: UserRecord[] }>(`/admin/users?${params}`)
      .then((result) => { if (active) setUsers(result.users) })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load users.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [search, roleFilter])

  async function updateUser(id: string, updates: Partial<Pick<UserRecord, 'full_name' | 'email' | 'phone' | 'role' | 'is_active'>>) {
    setSavingId(id)
    setError('')
    try {
      await apiRequest(`/admin/users/${id}`, {
        method: 'PATCH',
        body: {
          ...(updates.full_name === undefined ? {} : { fullName: updates.full_name }),
          ...(updates.email === undefined ? {} : { email: updates.email }),
          ...(updates.phone === undefined ? {} : { phone: updates.phone }),
          ...(updates.role === undefined ? {} : { role: updates.role }),
          ...(updates.is_active === undefined ? {} : { isActive: updates.is_active }),
        },
      })
      await loadUsers()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update this account.')
    } finally {
      setSavingId('')
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextSearch = searchText.trim()
    if (nextSearch !== search) setLoading(true)
    setSearch(nextSearch)
  }

  const title = roleFilter === 'customer' ? 'Manage Customers' : roleFilter === 'musician' ? 'Manage Musicians' : 'Manage Users'
  return (
    <>
      <PageTitle title={title} description={roleFilter ? `Review and manage ${roleFilter} accounts.` : 'Search accounts, update details, and manage account access.'} />
      <form onSubmit={submitSearch} className="mb-5 flex max-w-xl gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search users</span>
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search name, email, or phone" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" />
        </label>
        <button type="submit" className="rounded-xl bg-[#101820] px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Search</button>
      </form>
      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <LoadingState /> : users.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-4 font-semibold">Account</th><th className="px-5 py-4 font-semibold">Contact</th><th className="px-5 py-4 font-semibold">Role</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4 font-semibold">Joined</th><th className="px-5 py-4 font-semibold">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => <UserRow key={user.id} user={user} saving={savingId === user.id} onSave={updateUser} />)}
              </tbody>
            </table>
          </div>
        ) : <EmptyState>No matching accounts found.</EmptyState>}
      </section>
    </>
  )
}

function UserRow({ user, saving, onSave }: {
  user: UserRecord
  saving: boolean
  onSave: (id: string, updates: Partial<Pick<UserRecord, 'full_name' | 'email' | 'phone' | 'role' | 'is_active'>>) => Promise<void>
}) {
  const [fullName, setFullName] = useState(user.full_name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone)
  return (
    <>
      <tr>
        <td className="px-5 py-4">
          <p className="font-semibold text-slate-800">{user.full_name}</p>
          <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
        </td>
        <td className="px-5 py-4 text-slate-600">{user.phone}</td>
        <td className="px-5 py-4">
          <select aria-label={`Role for ${user.full_name}`} value={user.role} disabled={saving} onChange={(event) => void onSave(user.id, { role: event.target.value as AccountRole })} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm capitalize text-slate-700">
            <option value="customer">Customer</option><option value="musician">Musician</option><option value="admin">Administrator</option>
          </select>
        </td>
        <td className="px-5 py-4"><StatusBadge value={user.is_active ? 'active' : 'inactive'} /></td>
        <td className="px-5 py-4 text-slate-600">{formatDate(user.created_at)}</td>
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <details className="relative">
              <summary className="cursor-pointer font-semibold text-amber-800 hover:text-amber-950">Edit</summary>
              <form className="absolute right-0 z-10 mt-2 w-72 space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl" onSubmit={(event) => {
                event.preventDefault()
                void onSave(user.id, { full_name: fullName, email, phone })
              }}>
                <input aria-label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <input aria-label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <input aria-label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <button disabled={saving} className="w-full rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-60">{saving ? 'Saving…' : 'Save details'}</button>
              </form>
            </details>
            <button type="button" disabled={saving} onClick={() => void onSave(user.id, { is_active: !user.is_active })} className="font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50">
              {user.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </td>
      </tr>
    </>
  )
}