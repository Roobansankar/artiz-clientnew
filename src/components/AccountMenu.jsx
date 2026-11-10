'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
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
    {open && <div id="customer-account-menu" className="absolute right-0 top-full z-50 mt-3 w-56 rounded-xl border border-sand bg-cream py-2 shadow-lg">
      <div className="mx-4 mb-2 border-b border-sand pb-3 pt-2"><p className="truncate text-sm font-semibold">{customer.name}</p></div>
      <nav aria-label="Your account">{accountSections.map(([id, label, Icon]) => <Link key={id} href={`/account?section=${id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted transition-colors hover:bg-sand/40 hover:text-terra"><Icon size={16} strokeWidth={1.5} />{id === 'overview' ? 'My account' : label}</Link>)}</nav>
      <div className="mx-4 mt-2 border-t border-sand" />
      <button disabled={busy} onClick={signOut} className="mt-1 flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted transition-colors hover:bg-sand/40 hover:text-terra disabled:opacity-50"><LogOut size={16} />{busy ? 'Signing out…' : 'Sign out'}</button>
      {error && <p role="alert" className="px-3 text-xs text-terra">{error}</p>}
    </div>}
  </div>
}
