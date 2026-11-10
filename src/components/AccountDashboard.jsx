'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Heart, LayoutDashboard, LogOut, MapPin, Package, Pencil, Plus, Trash2, UserRound } from 'lucide-react'
import { useStore } from '../store'
import { formatPrice } from '../catalog'
import ProductPrice from './ProductPrice'

export const accountSections = [
  ['overview', 'Overview', LayoutDashboard], ['profile', 'My profile', UserRound],
  ['orders', 'My orders', Package], ['wishlist', 'My wishlist', Heart], ['addresses', 'Addresses', MapPin],
]
const field = 'account-field mt-2 h-12 w-full rounded-lg border border-sand bg-white px-4 text-sm outline-none focus:border-terra focus:ring-2 focus:ring-terra/10'
const initials = name => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()

export function CustomerAvatar({ customer, className = 'h-11 w-11' }) {
  const [failed, setFailed] = useState(false)
  return <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-peach font-semibold text-terra ${className}`}>
    {customer.avatarUrl && !failed ? <img src={customer.avatarUrl} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} className="h-full w-full object-cover" /> : initials(customer.name)}
  </span>
}

async function api(path, method = 'GET', body, signal) {
  const response = await fetch(path, { method, cache: 'no-store', signal, headers: { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(response.status === 401 ? 'Your session expired. Please sign in again.' : data.message || 'Could not save your changes. Please try again.')
  return data
}

function useResource(path) {
  const [state, setState] = useState({ data: null, error: '', loading: true })
  const [version, setVersion] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setState({ data: null, error: '', loading: true })
    api(path, 'GET', undefined, controller.signal).then(data => setState({ data, error: '', loading: false })).catch(error => { if (!controller.signal.aborted) setState({ data: null, error: error.message, loading: false }) })
    return () => controller.abort()
  }, [path, version])
  return { ...state, reload: () => setVersion(value => value + 1) }
}
function ResourceStatus({ resource }) {
  if (resource.loading) return <p role="status" className="py-10 text-sm text-muted">Loading…</p>
  if (resource.error) return <p role="alert" className="my-5 rounded-xl bg-peach p-4 text-sm">{resource.error} <button onClick={resource.reload} className="ml-2 underline">Try again</button></p>
  return null
}
function Empty({ icon: Icon, text }) {
  return <div className="flex flex-col items-center rounded-2xl bg-cream px-6 py-14 text-center"><Icon size={34} strokeWidth={1.3} className="text-terra" /><p className="my-4 text-muted">{text}</p><Link href="/shop" className="btn-outline">Explore collection <ArrowUpRight size={16} /></Link></div>
}

function Profile({ customer, onChange }) {
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  async function save(event) {
    event.preventDefault(); setBusy(true); setNotice(''); setError('')
    const values = new FormData(event.currentTarget)
    try {
      const data = await api('/api/auth/profile', 'PATCH', { name: values.get('name'), phone: values.get('phone') })
      onChange(data.customer); setNotice('Profile saved.')
    } catch (reason) { setError(reason.message) } finally { setBusy(false) }
  }
  return <form onSubmit={save} className="max-w-xl">
    <div className="mb-7 flex items-center gap-4"><CustomerAvatar customer={customer} className="h-16 w-16 text-xl" /><div><p className="font-medium">{customer.name}</p><p className="mt-1 break-all text-sm text-muted">{customer.email}</p></div></div>
    <fieldset disabled={busy} className="grid gap-5 border-0 p-0">
      <label className="text-sm font-medium">Full name<input name="name" autoComplete="name" required minLength={2} maxLength={100} defaultValue={customer.name} className={field} /></label>
      <label className="text-sm font-medium">Email<input type="email" value={customer.email} readOnly className={`${field} bg-cream`} /></label>
      <label className="text-sm font-medium">Phone number<input name="phone" type="tel" autoComplete="tel" maxLength={20} defaultValue={customer.phone || ''} placeholder="+91 98765 43210" className={field} /></label>
      <button className="btn-dark justify-self-start disabled:opacity-50">{busy ? 'Saving…' : 'Save changes'}</button>
    </fieldset>
    {notice && <p role="status" className="mt-4 text-sm text-terra">{notice}</p>}{error && <p role="alert" className="mt-4 text-sm text-terra">{error}</p>}
  </form>
}

const addressFields = [['fullName', 'Full name', 'name', 100], ['phone', 'Phone number', 'tel', 20], ['line1', 'Address line 1', 'address-line1', 200], ['line2', 'Address line 2 (optional)', 'address-line2', 200], ['city', 'City', 'address-level2', 100], ['state', 'State', 'address-level1', 100], ['postalCode', 'Postal code', 'postal-code', 20], ['country', 'Country', 'country-name', 100]]
function Addresses({ customer }) {
  const resource = useResource('/api/auth/addresses')
  const [editing, setEditing] = useState(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function change(method, address, body) {
    setBusy(true); setError('')
    try { await api(`/api/auth/addresses${address ? `/${address.id}` : ''}`, method, body); setEditing(undefined); resource.reload() }
    catch (reason) { setError(reason.message) } finally { setBusy(false) }
  }
  function save(event) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget))
    change(editing ? 'PUT' : 'POST', editing, { ...values, isDefault: values.isDefault === 'on' })
  }
  return <>
    <ResourceStatus resource={resource} />
    {error && <p role="alert" className="mb-5 rounded-xl bg-peach p-4 text-sm">{error}</p>}
    {editing !== undefined ? <form onSubmit={save} className="rounded-2xl bg-cream p-5 md:p-7">
      <h3 className="mb-5 text-lg">{editing ? 'Edit address' : 'Add address'}</h3>
      <fieldset disabled={busy} className="grid gap-4 border-0 p-0 sm:grid-cols-2">
        {addressFields.map(([name, label, autoComplete, maxLength]) => <label key={name} className="text-sm font-medium">{label}<input name={name} autoComplete={autoComplete} required={name !== 'line2'} maxLength={maxLength} type={name === 'phone' ? 'tel' : 'text'} defaultValue={editing?.[name] ?? (name === 'fullName' ? customer.name : name === 'phone' ? customer.phone || '' : name === 'country' ? 'India' : '')} className={field} /></label>)}
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="isDefault" defaultChecked={editing?.isDefault || !resource.data?.addresses.length} className="accent-terra" />Use as default address</label>
        <div className="flex gap-3 sm:col-span-2"><button className="btn-dark disabled:opacity-50">{busy ? 'Saving…' : 'Save address'}</button><button type="button" className="btn-outline" onClick={() => setEditing(undefined)}>Cancel</button></div>
      </fieldset>
    </form> : resource.data && <>
      <button disabled={busy || resource.data.addresses.length >= 10} onClick={() => { setError(''); setEditing(null) }} className="btn-outline mb-6 disabled:opacity-50"><Plus size={16} />Add address</button>
      {!resource.data.addresses.length && <p className="text-sm text-muted">No saved addresses yet.</p>}
      <div className="grid gap-4 xl:grid-cols-2">{resource.data.addresses.map(address => <article key={address.id} className="rounded-2xl border border-sand p-5">
        <div className="flex items-center justify-between gap-3"><h3 className="font-medium">{address.fullName}</h3>{address.isDefault && <span className="rounded-full bg-peach px-3 py-1 text-xs text-terra">Default</span>}</div>
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{[address.line1, address.line2, `${address.city}, ${address.state} ${address.postalCode}`, address.country, address.phone].filter(Boolean).join('\n')}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium"><button disabled={busy} onClick={() => { setError(''); setEditing(address) }} className="inline-flex items-center gap-1 hover:text-terra"><Pencil size={13} />Edit</button><button disabled={busy} onClick={() => change('DELETE', address)} className="inline-flex items-center gap-1 hover:text-terra"><Trash2 size={13} />Remove</button>{!address.isDefault && <button disabled={busy} onClick={() => { const { id, customerId, createdAt, updatedAt, ...body } = address; change('PUT', address, { ...body, isDefault: true }) }} className="hover:text-terra">Make default</button>}</div>
      </article>)}</div>
    </>}
  </>
}

function Orders() {
  const resource = useResource('/api/auth/orders')
  return <><ResourceStatus resource={resource} />{resource.data?.orders.length === 0 && <Empty icon={Package} text="Your orders will appear here." />}
    <div className="space-y-5">{resource.data?.orders.map(order => <article key={order.number} className="overflow-hidden rounded-2xl border border-sand">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-cream p-5"><div><h3 className="text-sm font-semibold">{order.number}</h3><p className="mt-1 text-xs text-muted">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p></div><div className="text-right"><span className="rounded-full bg-white px-3 py-1 text-xs text-terra">{order.paymentMethod === 'COD' ? (order.status === 'PAID' ? 'Cash on Delivery · Paid' : 'Cash on Delivery · Payment due') : order.paymentMethod === 'EMI' || order.paymentChannel === 'emi' ? 'Paid · Razorpay EMI' : 'Paid · Razorpay'}</span><p className="mt-2 text-sm font-medium">{formatPrice(order.amount, order.currency)}</p></div></div>
      <ul className="divide-y divide-sand px-5">{order.items.map((item, index) => <li key={index} className="flex items-center gap-4 py-4"><img src={item.image || '/images/categories/decor.jpg'} alt="" className="h-16 w-16 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.name}</p>{item.variantLabel && <p className="mt-1 text-xs text-muted">{item.variantLabel}</p>}<p className="mt-1 text-xs text-muted">Qty {item.quantity}</p></div><span className="text-sm">{formatPrice(item.unitPrice * item.quantity, order.currency)}</span></li>)}</ul>
      {order.shipping && <p className="border-t border-sand px-5 py-4 text-xs leading-relaxed text-muted">Delivery to: {[order.shipping.fullName, order.shipping.line1, order.shipping.city, order.shipping.postalCode].filter(Boolean).join(', ')}</p>}
    </article>)}</div>
  </>
}
function Wishlist() {
  const { wishlist, toggleWish, wishlistError } = useStore()
  const resource = useResource('/api/products')
  const items = (resource.data?.products || []).filter(product => wishlist.includes(product.id))
  return <><ResourceStatus resource={resource} />{wishlistError && <p role="alert" className="mb-4 text-sm text-terra">{wishlistError}</p>}
    {resource.data && !items.length && <Empty icon={Heart} text="Save the pieces you love here." />}
    <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">{items.map(product => <article key={product.id} className="relative min-w-0"><Link href={`/products/${product.slug || product.id}`} className="group block"><div className="overflow-hidden rounded-xl bg-cream"><img src={product.images?.[0] || product.image || '/images/categories/decor.jpg'} alt={product.name} className="aspect-square w-full object-cover transition-transform group-hover:scale-105" /></div><h3 className="mt-3 text-sm font-medium group-hover:text-terra">{product.name}</h3><div className="mt-2 text-sm"><ProductPrice product={product} /></div></Link><button onClick={() => toggleWish(product.id)} aria-label={`Remove ${product.name} from wishlist`} className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-white"><Heart size={17} className="fill-terra text-terra" /></button></article>)}</div>
  </>
}

export default function AccountDashboard({ customer, onChange, onLogout, loggingOut, logoutError }) {
  const search = useSearchParams()
  const active = accountSections.some(([id]) => id === search.get('section')) ? search.get('section') : 'overview'
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [active])
  const title = accountSections.find(([id]) => id === active)[1]
  const descriptions = { profile: 'Your name, email and contact details.', orders: 'Keep your purchases in one place.', wishlist: 'A little space for your favorites.', addresses: 'Ready for your next delivery.' }
  return <section className="bg-white pb-16 pt-7 md:pb-20 md:pt-10"><div className="container-x max-w-[1240px]">
    <div className="relative overflow-hidden rounded-2xl bg-cream p-6 md:p-9">
      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-4 md:gap-5"><CustomerAvatar customer={customer} className="h-16 w-16 border-4 border-white text-xl md:h-20 md:w-20" /><div className="min-w-0"><p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-terra">Your Artiz account</p><h1 className="text-[26px] font-semibold leading-tight md:text-[36px]">Hello, {customer.name.split(' ')[0]}.</h1><p className="mt-2 max-w-[210px] truncate text-xs text-muted sm:max-w-none md:text-sm">{customer.email}</p></div></div>
        <button disabled={loggingOut} onClick={onLogout} className="relative inline-flex items-center gap-2 rounded-full border border-sand bg-white/70 px-4 py-2.5 text-xs font-medium transition-colors hover:bg-white hover:text-terra disabled:opacity-50"><LogOut size={15} />{loggingOut ? 'Signing out…' : 'Sign out'}</button>
      </div>
      {logoutError && <p role="alert" className="relative mt-4 text-sm text-terra">{logoutError}</p>}
    </div>
    <nav aria-label="Account navigation" className="mb-8 mt-4 flex gap-5 overflow-x-auto border-b border-sand md:gap-9">{accountSections.map(([id, label, Icon]) => <Link key={id} href={`/account?section=${id}`} aria-current={active === id ? 'page' : undefined} className={`flex shrink-0 items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${active === id ? 'border-terra text-terra' : 'border-transparent text-muted hover:border-sand hover:text-ink'}`}><Icon size={16} />{label}</Link>)}</nav>
      <div className="min-w-0"><div className="mb-7"><h2 className="text-[24px] font-semibold">{active === 'overview' ? 'Make yourself at home' : title}</h2><p className="mt-2 text-sm text-muted">{active === 'overview' ? 'Everything you need, right here.' : descriptions[active]}</p></div>
        {active === 'overview' && <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{accountSections.slice(1).map(([id, label, Icon]) => <Link key={id} href={`/account?section=${id}`} className="group rounded-2xl border border-sand p-6 transition-all duration-200 hover:-translate-y-1 hover:border-terra/50 hover:bg-cream"><div className="mb-7 flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-xl bg-peach text-terra"><Icon size={23} strokeWidth={1.5} /></span><ArrowUpRight size={18} className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-terra" /></div><h3 className="text-base font-semibold">{label}</h3><p className="mt-2 text-xs leading-relaxed text-muted">{descriptions[id]}</p></Link>)}</div><Link href="/shop" className="group mt-7 grid overflow-hidden rounded-2xl bg-cream sm:grid-cols-[1fr_0.8fr]"><div className="flex flex-col justify-center p-7 md:p-9"><p className="text-xs font-medium text-terra">A little inspiration</p><h3 className="mt-3 text-2xl font-semibold md:text-3xl">Your next favorite awaits.</h3><span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">Explore the collection <ArrowUpRight size={17} /></span></div><img src="/images/featured-bedroom.png" alt="A warmly styled Artiz bedroom" className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] sm:h-60" /></Link></>}
        {active === 'profile' && <Profile customer={customer} onChange={onChange} />}
        {active === 'addresses' && <Addresses customer={customer} />}
        {active === 'orders' && <Orders />}
        {active === 'wishlist' && <Wishlist />}
      </div>
  </div></section>
}
