'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useStore } from '../store'
import { accountSections, CustomerAvatar } from './AccountDashboard'

export default function AccountMenu() {
  const { customer, setCustomer } = useStore()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const root = useRef(null)
  const trigger = useRef(null)
  const pathname = usePathname()
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (!open) return
    const close = event => { if (!root.current?.contains(event.target)) setOpen(false) }
    const escape = event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() } }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape) }
  }, [open])
  async function signOut() {
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (!response.ok) throw new Error('Could not sign out. Please try again.')
      setCustomer(null); setOpen(false)
    } catch (reason) { setError(reason.message) } finally { setBusy(false) }
  }
  if (!customer) return <Link href="/account" aria-label="Sign in to your account" className="hover:text-terra"><UserRound size={24} /></Link>
  return <div ref={root} className="relative" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
    <button ref={trigger} type="button" onClick={() => setOpen(value => !value)} aria-label={`Account menu for ${customer.name}`} aria-expanded={open} aria-controls="customer-account-menu" className={`flex items-center gap-1 rounded-full p-1 outline-offset-4 transition-colors hover:bg-sand/40 focus-visible:outline-2 focus-visible:outline-terra ${open ? 'bg-sand/40' : ''}`}><CustomerAvatar key={customer.avatarUrl} customer={customer} className="h-8 w-8 border border-sand text-xs" /><ChevronDown size={12} className={`hidden transition-transform sm:block ${open ? 'rotate-180' : ''}`} /></button>
    {open && <div id="customer-account-menu" className="absolute -right-10 top-full z-50 mt-4 w-[min(320px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-sand bg-white shadow-[0_14px_50px_rgba(73,51,39,0.14)] sm:right-0">
      <div className="flex items-center gap-3 bg-cream p-5"><CustomerAvatar customer={customer} className="h-12 w-12 border-2 border-white" /><div className="min-w-0"><p className="mb-1 text-[10px] uppercase tracking-widest text-terra">Welcome back</p><p className="truncate text-sm font-semibold">{customer.name}</p><p className="mt-1 truncate text-xs text-muted">{customer.email}</p></div></div>
      <Link href="/account" onClick={() => setOpen(false)} className="mx-4 mt-4 flex items-center justify-between rounded-lg bg-peach px-4 py-3 text-sm font-medium text-terra">My account <ArrowUpRight size={17} /></Link>
      <nav aria-label="Your account" className="grid grid-cols-2 gap-2 p-4">{accountSections.slice(1).map(([id, label, Icon]) => <Link key={id} href={`/account?section=${id}`} onClick={() => setOpen(false)} className="group flex flex-col items-start gap-3 rounded-xl border border-sand/60 p-4 text-xs font-medium transition-colors hover:border-terra/40 hover:bg-cream"><Icon size={20} strokeWidth={1.5} className="text-terra" />{label}</Link>)}</nav>
      <button disabled={busy} onClick={signOut} className="flex w-full items-center justify-center gap-2 border-t border-sand bg-cream/50 px-4 py-3.5 text-xs font-medium text-muted transition-colors hover:bg-peach hover:text-terra"><LogOut size={14} />{busy ? 'Signing out…' : 'Sign out'}</button>
      {error && <p role="alert" className="px-3 text-xs text-terra">{error}</p>}
    </div>}
  </div>
}
