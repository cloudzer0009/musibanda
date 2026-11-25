import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Search } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { EmptyState, LoadingState, PageTitle, StatusBadge } from '../../components/admin/AdminUI'
import { formatDate } from '../../components/admin/formatDate'

type MusicianRecord = {
  id: string
  full_name: string
  email: string
  phone: string
  is_active: boolean
  created_at: string
  stage_name: string | null
  bio: string | null
  genres: string[] | null
  city: string | null
}

export default function Musicians() {
  const [musicians, setMusicians] = useState<MusicianRecord[]>([])
  const [searchText, setSearchText] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState('')

  const loadMusicians = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const result = await apiRequest<{ musicians: MusicianRecord[] }>(`/admin/musicians?${params}`)
      setMusicians(result.musicians)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load musicians.')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    let active = true
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    apiRequest<{ musicians: MusicianRecord[] }>(`/admin/musicians?${params}`)
      .then((result) => { if (active) setMusicians(result.musicians) })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load musicians.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [search])

  async function toggleActive(musician: MusicianRecord) {
    setSavingId(musician.id)
    setError('')
    try {
      await apiRequest(`/admin/users/${musician.id}`, { method: 'PATCH', body: { isActive: !musician.is_active } })
      await loadMusicians()
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

  return (
    <>
      <PageTitle title="Manage Musicians" description="Review musician profiles and manage account access." />
      <form onSubmit={submitSearch} className="mb-5 flex max-w-xl gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search musicians</span><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search name, stage name, email, or city" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" />
        </label>
        <button className="rounded-xl bg-[#101827] px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Search</button>
      </form>
      {error && <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <LoadingState /> : musicians.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-4 font-semibold">Performer</th><th className="px-5 py-4 font-semibold">Genres</th><th className="px-5 py-4 font-semibold">City</th><th className="px-5 py-4 font-semibold">Joined</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4 font-semibold">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {musicians.map((musician) => (
                  <tr key={musician.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{musician.stage_name || musician.full_name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{musician.full_name} · {musician.email}</p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-semibold text-violet-700">Review profile</summary>
                        <div className="mt-2 max-w-md rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                          <p>{musician.bio || 'No biography provided.'}</p>
                          <p className="mt-2">Contact: {musician.phone}</p>
                        </div>
                      </details>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{musician.genres?.join(', ') || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{musician.city || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(musician.created_at)}</td>
                    <td className="px-5 py-4"><StatusBadge value={musician.is_active ? 'active' : 'inactive'} /></td>
                    <td className="px-5 py-4">
                      <button type="button" disabled={savingId === musician.id} onClick={() => void toggleActive(musician)} className="font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50">
                        {savingId === musician.id ? 'Saving…' : musician.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState>No musician profiles found.</EmptyState>}
      </section>
    </>
  )
}