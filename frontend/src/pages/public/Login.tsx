import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import AuthLayout from '../../components/auth/AuthLayout'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRecoveryHelp, setShowRecoveryHelp] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const normalizedEmail = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }

    setLoading(true)
    try {
      const user = await login(normalizedEmail, password, rememberMe)
      const state = location.state as { from?: string } | null
      navigate(state?.from ?? (user.role === 'admin' ? '/admin/dashboard' : '/'), { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout eyebrow="Welcome back" title="Sign in to Musibanda" description="Use your account details to continue.">
      <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
        <label className="block text-sm font-semibold text-slate-700">
          Email address
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
          />
        </label>
        <div className="block text-sm font-semibold text-slate-700">
          <label htmlFor="login-password">Password</label>
          <span className="relative mt-1.5 block">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
            />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="inline-flex items-center gap-2 text-slate-600">
            <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-amber-500" />
            Remember me
          </label>
          <button type="button" onClick={() => setShowRecoveryHelp((visible) => !visible)} className="font-semibold text-amber-800 hover:text-amber-950">
            Forgot password?
          </button>
        </div>
        {showRecoveryHelp && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-900">Password recovery is not configured yet. Please contact your Musibanda administrator for help.</p>}
        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        New to Musibanda? <Link to="/register" className="font-bold text-amber-800 hover:text-amber-950">Create an account</Link>
      </p>
    </AuthLayout>
  )
}