'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, ChevronRight, Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react'
import AccountDashboard from '../components/AccountDashboard'
import { useStore } from '../store'

const field = 'account-field h-12 w-full rounded-lg border border-sand bg-white px-4 text-sm outline-none transition-all placeholder:text-muted/60 focus:border-terra focus:ring-2 focus:ring-terra/10'

export default function AccountPage({ initialMode, initialAuthError = '', returnTo = null }) {
  const router = useRouter()
  const [mode, setMode] = useState(initialMode)
  const { customer, setCustomer } = useStore()
  const [loading, setLoading] = useState(true)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState(null)
  const [oauthError, setOauthError] = useState(initialAuthError)
  const registering = mode === 'register'
  useEffect(() => {
    if (!customer) return
    const destination = returnTo || sessionStorage.getItem('artiz-auth-return')
    if (destination === '/checkout') { sessionStorage.removeItem('artiz-auth-return'); router.replace('/checkout') }
  }, [customer, returnTo, router])

  async function checkSession(signal) {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store', signal })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to load your account.')
      setCustomer(data.customer)
      setSessionChecked(true)
    } catch (reason) {
      if (reason.name !== 'AbortError') setError('We could not check your account. Please try again.')
    } finally { if (!signal?.aborted) setLoading(false) }
  }

  useEffect(() => {
    const controller = new AbortController()
    void checkSession(controller.signal)
    fetch('/api/auth/config', { cache: 'no-store', signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Configuration unavailable'); return response.json() })
      .then(data => setGoogleEnabled(data.googleEnabled === true))
      .catch(() => { if (!controller.signal.aborted) setGoogleEnabled(false) })
    return () => controller.abort()
  }, [])

  async function submit(event) {
    event.preventDefault()
    setOauthError('')
    setBusy(true)
    setError('')
    try {
      const response = await fetch(`/api/auth/${registering ? 'register' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))), signal: AbortSignal.timeout(20000),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'We could not sign you in. Please try again.')
      setCustomer(data.customer)
    } catch (reason) { setError(reason.name === 'TimeoutError' ? 'This is taking longer than expected. Please try again.' : reason.message || 'Something went wrong. Please try again.') }
    finally { setBusy(false) }
  }

  async function logout() {
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', signal: AbortSignal.timeout(20000) })
      if (!response.ok) throw new Error('We could not sign you out. Please try again.')
      setCustomer(null)
      setMode('login')
    } catch (reason) { setError(reason.message || 'Please try again.') }
    finally { setBusy(false) }
  }

  if (customer) return <AccountDashboard customer={customer} onChange={setCustomer} onLogout={logout} loggingOut={busy} logoutError={error} />

  if (loading || !sessionChecked) return <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white px-6 text-center">
    {loading ? <><LoaderCircle size={26} className="animate-spin text-terra motion-reduce:animate-none" aria-hidden="true" /><p role="status" className="text-sm text-muted">Loading your account…</p></> : <><p role="alert" className="text-sm text-muted">{error || 'Could not load your account.'}</p><button type="button" onClick={() => void checkSession()} className="btn-outline">Try again</button></>}
  </section>

  return (
    <section className="bg-white pb-14 pt-7 md:pb-20 md:pt-9">
      <div className="container-x">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted"><Link href="/" className="hover:text-terra">Home</Link><ChevronRight size={12} aria-hidden="true" /><span aria-current="page" className="text-ink">My account</span></nav>
        <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-sand lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden flex-col items-center justify-center bg-cream px-8 py-10 text-center lg:flex">
            <h1 className="font-heading text-[36px] font-semibold leading-tight tracking-tight">Welcome <span className="text-terra">home.</span></h1>
            <img src="/images/empty-collection.webp" alt="A cozy illustrated corner with a terracotta chair and side table" className="my-8 aspect-square w-full max-w-xs object-contain" />
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-terra">Explore Artiz <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>

          <div className="flex min-w-0 flex-col justify-center bg-white px-6 py-8 md:px-9 md:py-9">
            {loading ? <div role="status" className="flex min-h-72 flex-col items-center justify-center gap-4 text-sm text-muted"><LoaderCircle size={25} className="animate-spin text-terra motion-reduce:animate-none" aria-hidden="true" />Checking your account…</div> : <>
              <div className="mb-7 flex rounded-full bg-cream p-1" aria-label="Account options">{[['login', 'Sign in'], ['register', 'Create account']].map(([value, label]) => <button key={value} type="button" onClick={() => { setMode(value); setError(''); setShowPassword(false) }} disabled={busy} aria-pressed={mode === value} className={`flex-1 rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${mode === value ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-terra'}`}>{label}</button>)}</div>
              <div>
                <button type="button" disabled={busy || !googleEnabled} onClick={() => { if (returnTo) sessionStorage.setItem('artiz-auth-return', returnTo); window.location.assign('/api/auth/google') }} className="flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-sand bg-white text-sm font-medium transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terra disabled:cursor-not-allowed disabled:opacity-60">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.86-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59A5.99 5.99 0 0 1 12 5.96Z"/></svg>
                  Continue with Google
                </button>
                {googleEnabled === false && <p className="mt-2 text-center text-xs text-muted">Google sign-in unavailable</p>}
                <div className="my-5 flex items-center gap-4 text-xs text-muted"><span className="h-px flex-1 bg-sand" />or<span className="h-px flex-1 bg-sand" /></div>
              </div>
              {oauthError && <p role="alert" className="mb-5 rounded-lg border border-terra/30 bg-peach px-4 py-3 text-sm">{oauthError}</p>}
              <form key={mode} onSubmit={submit} className="space-y-5">
                <fieldset disabled={busy} className="m-0 space-y-5 border-0 p-0">
                  {registering && <div><label htmlFor="account-name" className="mb-2 block text-sm font-medium">Full name</label><input id="account-name" name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Your name" className={field} /></div>}
                  <div><label htmlFor="account-email" className="mb-2 block text-sm font-medium">Email address</label><input id="account-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" className={field} /></div>
                  <div><label htmlFor="account-password" className="mb-2 block text-sm font-medium">Password</label><div className="relative"><input id="account-password" name="password" type={showPassword ? 'text' : 'password'} required minLength={registering ? 8 : 1} maxLength={72} autoComplete={registering ? 'new-password' : 'current-password'} placeholder={registering ? 'At least 8 characters' : 'Enter your password'} className={`${field} pr-12`} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-terra">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
                  <button type="submit" className="btn-dark w-full disabled:cursor-wait disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : registering ? <Check size={17} aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}{busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in'}<ArrowRight size={15} aria-hidden="true" /></button>
                </fieldset>
              </form>
            </>}
            {error && <div role="alert" className="mt-5 rounded-lg border border-terra/30 bg-peach px-4 py-3 text-sm text-ink">{error}<button type="button" disabled={busy || loading} onClick={() => void checkSession()} className="ml-2 underline underline-offset-2">Refresh account</button></div>}
            {!loading && <Link href="/contact" className="mt-5 text-center text-xs text-muted underline underline-offset-4 hover:text-terra">Need help?</Link>}
          </div>
        </div>
      </div>
    </section>
  )
}
