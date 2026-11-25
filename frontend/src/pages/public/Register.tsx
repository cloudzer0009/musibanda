import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import AuthLayout from '../../components/auth/AuthLayout'

const passwordRules = [
  { label: 'At least 12 characters', test: (value: string) => value.length >= 12 },
  { label: 'One uppercase letter', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'One lowercase letter', test: (value: string) => /[a-z]/.test(value) },
  { label: 'One number', test: (value: string) => /[0-9]/.test(value) },
]

export default function Register() {
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'customer' | 'musician'>('customer')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (fullName.trim().length < 2) {
      setError('Enter your full name.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setError('Enter a valid contact number.')
      return
    }
    const unmetRule = passwordRules.find((rule) => !rule.test(password))
    if (unmetRule) {
      setError(`Password must meet this requirement: ${unmetRule.label.toLowerCase()}.`)
      return
    }
    if (password.length > 128) {
      setError('Password must be no more than 128 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register({ fullName: fullName.trim(), email: email.trim(), password, phone: phone.trim(), role })
      setSuccess('Your account has been created successfully. You are now signed in.')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create your account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout eyebrow="Join the community" title="Create your account" description="Find your place in the Musibanda community.">
      {success ? (
        <div className="space-y-5">
          <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">{success}</p>
          <Link to="/" className="flex w-full justify-center rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-violet-700">Continue to Musibanda</Link>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <label className="block text-sm font-semibold text-slate-700">
            Full name
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required maxLength={120} placeholder="Your full name" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Email address
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required maxLength={254} placeholder="you@example.com" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Contact number
            <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" required maxLength={30} placeholder="+63 917 123 4567" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" />
          </label>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">Account type</legend>
            <div className="grid grid-cols-2 gap-3">
              {(['customer', 'musician'] as const).map((accountRole) => (
                <label key={accountRole} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium capitalize transition ${role === accountRole ? 'border-violet-500 bg-violet-50 text-violet-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <input type="radio" name="role" value={accountRole} checked={role === accountRole} onChange={() => setRole(accountRole)} className="accent-violet-600" />
                  {accountRole}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="block text-sm font-semibold text-slate-700">
            <label htmlFor="register-password">Password</label>
            <span className="relative mt-1.5 block">
              <input id="register-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-500">
            {passwordRules.map((rule) => <li key={rule.label} className={rule.test(password) ? 'text-emerald-700' : ''}>{rule.test(password) ? '✓' : '·'} {rule.label}</li>)}
          </ul>
          <div className="block text-sm font-semibold text-slate-700">
            <label htmlFor="register-confirm-password">Confirm password</label>
            <span className="relative mt-1.5 block">
              <input id="register-confirm-password" type={showConfirmation ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10" />
              <button type="button" onClick={() => setShowConfirmation((visible) => !visible)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-slate-400" aria-label={showConfirmation ? 'Hide confirmation password' : 'Show confirmation password'}>{showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </span>
          </div>
          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
          <button type="submit" disabled={loading} className="flex w-full justify-center rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}
      {!success && <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-bold text-violet-700 hover:text-violet-900">Sign in</Link></p>}
    </AuthLayout>
  )
}