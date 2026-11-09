'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronRight, Eye, EyeOff, LoaderCircle, LockKeyhole, LogOut, UserRound } from 'lucide-react'

const field = 'h-12 w-full rounded-lg border border-sand bg-white px-4 text-sm outline-none transition-all placeholder:text-muted/60 focus:border-terra focus:ring-2 focus:ring-terra/10'

export default function AccountPage({ initialMode }) {
  const [mode, setMode] = useState(initialMode)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const registering = mode === 'register'

  async function checkSession(signal) {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store', signal })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to load your account.')
      setCustomer(data.customer)
    } catch (reason) {
      if (reason.name !== 'AbortError') setError('We could not check your account. Please try again.')
    } finally { if (!signal?.aborted) setLoading(false) }
  }

  useEffect(() => {
    const controller = new AbortController()
    void checkSession(controller.signal)
    return () => controller.abort()
  }, [])

  async function submit(event) {
    event.preventDefault()
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

  return (
    <section className="bg-white pb-14 pt-7 md:pb-20 md:pt-9">
      <div className="container-x">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted"><Link href="/" className="hover:text-terra">Home</Link><ChevronRight size={12} aria-hidden="true" /><span aria-current="page" className="text-ink">My account</span></nav>
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-sand lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative flex flex-col justify-between bg-cream px-7 py-9 md:px-10 md:py-11">
            <div><span className="text-xs font-medium uppercase tracking-[0.18em] text-terra">Your space at Artiz</span><h1 className="mt-4 font-heading text-[36px] font-semibold leading-[1.1] tracking-tight md:text-[46px]">Make yourself<br /><span className="text-terra">at home.</span></h1><p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">Thoughtful pieces. Warm spaces. A little inspiration for the way you live.</p></div>
            <img src="/images/empty-collection.webp" alt="A cozy illustrated corner with a terracotta chair and side table" className="mx-auto mt-5 hidden aspect-[3/2] w-full max-w-sm object-contain sm:block" />
            <Link href="/shop" className="mt-6 inline-flex items-center gap-2 self-start text-sm font-medium transition-colors hover:text-terra">Explore our collections <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>

          <div className="flex min-w-0 flex-col justify-center bg-white px-6 py-9 md:px-10 md:py-11">
            {loading ? <div role="status" className="flex min-h-72 flex-col items-center justify-center gap-4 text-sm text-muted"><LoaderCircle size={25} className="animate-spin text-terra motion-reduce:animate-none" aria-hidden="true" />Checking your account…</div> : customer ? <>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-peach text-terra"><UserRound size={23} aria-hidden="true" /></div>
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-terra">My account</span>
              <h2 className="mt-3 font-heading text-3xl font-semibold">Hello, {customer.name.split(' ')[0]}.</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">Welcome back. You are signed in and ready to explore.</p>
              <dl className="mt-7 divide-y divide-sand border-y border-sand"><div className="py-4"><dt className="text-xs text-muted">Full name</dt><dd className="mt-1 text-sm font-medium">{customer.name}</dd></div><div className="py-4"><dt className="text-xs text-muted">Email address</dt><dd className="mt-1 break-words text-sm font-medium">{customer.email}</dd></div></dl>
              <Link href="/shop" className="btn-dark mt-7">Continue shopping <ArrowRight size={16} aria-hidden="true" /></Link>
              <button onClick={logout} disabled={busy} className="mt-5 inline-flex items-center justify-center gap-2 text-sm text-muted hover:text-terra disabled:opacity-50"><LogOut size={16} aria-hidden="true" />{busy ? 'Signing out…' : 'Sign out'}</button>
            </> : <>
              <div className="mb-7 flex rounded-full bg-cream p-1" aria-label="Account options">{[['login', 'Sign in'], ['register', 'Create account']].map(([value, label]) => <button key={value} type="button" onClick={() => { setMode(value); setError(''); setShowPassword(false) }} disabled={busy} aria-pressed={mode === value} className={`flex-1 rounded-full px-3 py-2.5 text-sm font-medium transition-colors ${mode === value ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-terra'}`}>{label}</button>)}</div>
              <h2 className="font-heading text-[28px] font-semibold leading-tight">{registering ? 'A new beginning.' : 'Welcome back.'}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{registering ? 'Create your Artiz account with a few simple details.' : 'Sign in to your Artiz account.'}</p>
              <form key={mode} onSubmit={submit} className="mt-7 space-y-5">
                <fieldset disabled={busy} className="m-0 space-y-5 border-0 p-0">
                  {registering && <div><label htmlFor="account-name" className="mb-2 block text-sm font-medium">Full name</label><input id="account-name" name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Your name" className={field} /></div>}
                  <div><label htmlFor="account-email" className="mb-2 block text-sm font-medium">Email address</label><input id="account-email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" className={field} /></div>
                  <div><label htmlFor="account-password" className="mb-2 block text-sm font-medium">Password</label><div className="relative"><input id="account-password" name="password" type={showPassword ? 'text' : 'password'} required minLength={registering ? 8 : 1} maxLength={72} autoComplete={registering ? 'new-password' : 'current-password'} placeholder={registering ? 'At least 8 characters' : 'Enter your password'} className={`${field} pr-12`} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-terra">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{registering && <p className="mt-2 text-xs text-muted">Use 8–72 characters for your password.</p>}</div>
                  <button type="submit" className="btn-dark w-full disabled:cursor-wait disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : registering ? <Check size={17} aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}{busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in'}<ArrowRight size={15} aria-hidden="true" /></button>
                </fieldset>
              </form>
            </>}
            {error && <div role="alert" className="mt-5 rounded-lg border border-terra/30 bg-peach px-4 py-3 text-sm text-ink">{error}<button type="button" disabled={busy || loading} onClick={() => void checkSession()} className="ml-2 underline underline-offset-2">Refresh account</button></div>}
            {!loading && <p className="mt-7 text-center text-xs text-muted">Need a hand? <Link href="/contact" className="font-medium text-ink underline underline-offset-4 hover:text-terra">Get in touch</Link></p>}
          </div>
        </div>
      </div>
    </section>
  )
}
