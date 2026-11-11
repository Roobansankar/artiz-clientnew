'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Check, CreditCard, LoaderCircle, MapPin, Package, Plus, ShieldCheck, Truck } from 'lucide-react'
import { useStore } from '../store'
import { formatPrice, productOption } from '../catalog'

const field = 'account-field mt-2 h-11 w-full rounded-lg border border-sand bg-white px-3 text-sm outline-none focus:border-terra'
const addressFields = [['fullName', 'Full name', 'name'], ['phone', 'Phone number', 'tel'], ['line1', 'Address line 1', 'address-line1'], ['line2', 'Address line 2 (optional)', 'address-line2'], ['city', 'City', 'address-level2'], ['state', 'State', 'address-level1'], ['postalCode', 'Postal code', 'postal-code'], ['country', 'Country', 'country-name']]
async function api(path, method = 'GET', body) {
  const response = await fetch(path, { method, cache: 'no-store', headers: { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(25000) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Please try again.')
  return data
}
let razorpayScript
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve()
  if (!razorpayScript) razorpayScript = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const fail = () => { clearTimeout(timer); razorpayScript = null; script.remove(); reject(new Error('Could not load the payment window. Please try again.')) }
    const timer = setTimeout(fail, 20000)
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.async = true
    script.onload = () => { clearTimeout(timer); if (window.Razorpay) resolve(); else fail() }
    script.onerror = fail
    document.body.appendChild(script)
  })
  return razorpayScript
}

export default function CheckoutPage() {
  const { cart, cartLoaded, clearCart, updateQty, setCustomer } = useStore()
  const [account, setAccount] = useState(undefined)
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState('')
  const [products, setProducts] = useState([])
  const [config, setConfig] = useState({ onlineEnabled: false })
  const [method, setMethod] = useState('COD')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [addingAddress, setAddingAddress] = useState(false)
  const [success, setSuccess] = useState(null)
  const [verification, setVerification] = useState(null)
  const locked = useRef(false)

  async function load() {
    setLoading(true); setLoadError('')
    try {
      const [me, catalog, payment] = await Promise.all([api('/api/auth/me'), api('/api/products'), api('/api/auth/checkout/config')])
      setAccount(me.customer); setCustomer(me.customer); setProducts(catalog.products); setConfig(payment)
      if (me.customer) {
        const saved = await api('/api/auth/addresses')
        setAddresses(saved.addresses); setAddressId(saved.addresses.find(address => address.isDefault)?.id || saved.addresses[0]?.id || '')
        setAddingAddress(!saved.addresses.length)
      }
      try { const pending = JSON.parse(sessionStorage.getItem('artiz-payment-verification') || 'null'); if (pending?.customerId === me.customer?.id) setVerification(pending.result) } catch {}
    } catch (reason) { setLoadError(reason.message) } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  useEffect(() => {
    if (!success) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.getElementById('checkout-confirmation-title')?.focus({ preventScroll: true })
  }, [success])
  const lines = cart.map(item => {
    const product = products.find(product => product.id === item.id)
    const option = product && productOption(product, item.variantIndex ?? null)
    return { item, product, option, valid: !!product && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= Math.min(10, option.stock) }
  })
  const invalid = lines.some(line => !line.valid)
  const total = lines.reduce((sum, line) => sum + (line.option?.price || 0) * line.item.qty, 0)
  function completed(order) {
    setSuccess(order); clearCart(); setVerification(null)
    sessionStorage.removeItem('artiz-checkout-attempt'); sessionStorage.removeItem('artiz-payment-verification')
  }
  async function verify(result) {
    setBusy(true); setError(''); setVerification(result)
    sessionStorage.setItem('artiz-payment-verification', JSON.stringify({ customerId: account.id, result }))
    try {
      const data = await api('/api/auth/checkout/verify', 'POST', result)
      if (data.order.status === 'PAID') completed(data.order)
      else setError(data.message || 'Payment is processing. Do not pay again; check its status below.')
    } catch (reason) { setError(reason.message) } finally { locked.current = false; setBusy(false) }
  }
  async function pay() {
    if (locked.current || invalid || !addressId || !cart.length) return
    locked.current = true; setBusy(true); setError('')
    try {
      const items = cart.map(item => ({ id: item.id, color: item.variantIndex ?? null, quantity: item.qty }))
      const fingerprint = JSON.stringify({ items, addressId, paymentMethod: method })
      let attempt
      try { attempt = JSON.parse(sessionStorage.getItem('artiz-checkout-attempt') || 'null') } catch {}
      if (!attempt || attempt.fingerprint !== fingerprint || attempt.customerId !== account.id) {
        attempt = { fingerprint, customerId: account.id, key: crypto.randomUUID() }
        sessionStorage.setItem('artiz-checkout-attempt', JSON.stringify(attempt))
      }
      if (method !== 'COD') await loadRazorpay()
      // The server cart is the source of truth; only the address and payment choice are sent.
      const data = await api('/api/auth/checkout/order', 'POST', { addressId, paymentMethod: method, checkoutKey: attempt.key })
      if (data.order.status === 'CONFIRMED' || data.order.status === 'PAID') { completed(data.order); locked.current = false; setBusy(false); return }
      const checkout = new window.Razorpay({
        key: data.razorpay.keyId, order_id: data.razorpay.orderId, amount: data.razorpay.amount, currency: 'INR',
        name: 'Artiz Living & Interiors', description: `Order ${data.order.number}`, prefill: data.prefill,
        theme: { color: '#684734' },
        ...(method === 'EMI' ? { config: { display: { blocks: { installments: { name: 'Pay with EMI', instruments: [{ method: 'emi' }] } }, sequence: ['block.installments'], preferences: { show_default_blocks: false } } } } : {}),
        handler: result => { void verify(result) },
        modal: { confirm_close: true, ondismiss: () => { locked.current = false; setBusy(false) } },
      })
      checkout.on('payment.failed', response => { setError(response.error?.description || 'Payment failed. You can try again.'); locked.current = false; setBusy(false) })
      checkout.open()
    } catch (reason) { setError(reason.message); locked.current = false; setBusy(false) }
  }
  async function saveAddress(event) {
    event.preventDefault(); setSavingAddress(true); setError('')
    const body = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const data = await api('/api/auth/addresses', 'POST', { ...body, isDefault: body.isDefault === 'on' })
      setAddresses(data.addresses); setAddressId(data.addresses.find(address => !addresses.some(old => old.id === address.id))?.id || data.addresses[0].id); setAddingAddress(false)
    } catch (reason) { setError(reason.message) } finally { setSavingAddress(false) }
  }

  if (loading || !cartLoaded) return <div role="status" className="flex min-h-[60vh] items-center justify-center gap-3 text-muted"><LoaderCircle className="animate-spin" size={23} />Loading checkout…</div>
  if (loadError) return <div className="container-x py-20 text-center"><p role="alert" className="mb-5 text-muted">{loadError}</p><button onClick={load} className="btn-outline">Try again</button></div>
  if (success) return <section className="container-x py-16"><div className="mx-auto max-w-xl rounded-3xl border border-sand bg-white p-8 text-center"><span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-peach text-terra"><Check size={30} /></span><h1 id="checkout-confirmation-title" tabIndex={-1} className="h2-title outline-none">Order confirmed</h1><p className="mt-4 font-medium">{success.number}</p><p className="mt-3 text-sm text-muted">{success.paymentMethod === 'COD' ? `Pay ${formatPrice(success.amount)} on delivery.` : `Payment received: ${formatPrice(success.amount)}.`}</p><Link href="/account?section=orders" className="btn-dark mt-7">View my orders</Link><Link href="/shop" className="mt-5 block text-sm text-muted hover:text-terra">Continue shopping</Link></div></section>
  if (!account) return <section className="container-x py-20 text-center"><h1 className="h2-title">Sign in to checkout</h1><p className="mt-4 text-muted">Your cart will be waiting for you.</p><Link href="/account?next=checkout" className="btn-dark mt-7">Sign in / Create account</Link></section>
  if (!cart.length && !verification) return <section className="container-x py-20 text-center"><Package size={36} className="mx-auto mb-5 text-terra" /><h1 className="h2-title">Your cart is empty</h1><Link href="/shop" className="btn-dark mt-7">Explore collection</Link></section>
  return <section className="bg-cream py-8 md:py-12"><div className="container-x max-w-[1240px]">
    <div className="mb-8 flex items-center justify-between gap-4"><h1 className="h2-title">Checkout</h1><span className="flex items-center gap-2 text-xs text-muted"><ShieldCheck size={17} />Secure checkout</span></div>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
      <div className="min-w-0 space-y-6">
        <section className="rounded-2xl border border-sand bg-white p-5 md:p-7"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl"><MapPin size={20} />Delivery address</h2>{!addingAddress && <button disabled={busy || !!verification} onClick={() => setAddingAddress(true)} className="flex items-center gap-1 text-xs font-medium text-terra"><Plus size={15} />Add new</button>}</div>
          {!addingAddress && <fieldset disabled={busy || !!verification} className="grid gap-3 border-0 p-0">{addresses.map(address => <label key={address.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${address.id === addressId ? 'border-terra bg-peach/40' : 'border-sand'}`}><input type="radio" name="delivery-address" value={address.id} checked={addressId === address.id} onChange={() => setAddressId(address.id)} className="mt-1 accent-terra" /><span><span className="text-sm font-medium">{address.fullName} {address.isDefault && <small className="ml-2 text-terra">Default</small>}</span><span className="mt-2 block text-sm leading-relaxed text-muted">{[address.line1, address.line2, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(', ')}<br />{address.phone}</span></span></label>)}</fieldset>}
          {addingAddress && <form onSubmit={saveAddress}><fieldset disabled={savingAddress} className="grid gap-4 border-0 p-0 sm:grid-cols-2">{addressFields.map(([name, label, autoComplete]) => <label key={name} className="text-sm">{label}<input name={name} autoComplete={autoComplete} required={name !== 'line2'} maxLength={name === 'phone' ? 20 : name === 'postalCode' ? 20 : name.startsWith('line') ? 200 : 100} type={name === 'phone' ? 'tel' : 'text'} defaultValue={name === 'fullName' ? account.name : name === 'phone' ? account.phone || '' : name === 'country' ? 'India' : ''} className={field} /></label>)}<label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="isDefault" defaultChecked={!addresses.length} className="accent-terra" />Save as default</label><div className="flex gap-3 sm:col-span-2"><button className="btn-dark">{savingAddress ? 'Saving…' : 'Save address'}</button>{addresses.length > 0 && <button type="button" onClick={() => setAddingAddress(false)} className="btn-outline">Cancel</button>}</div></fieldset></form>}
        </section>
        <section className="rounded-2xl border border-sand bg-white p-5 md:p-7"><h2 className="mb-5 flex items-center gap-2 text-xl"><CreditCard size={20} />Payment method</h2><fieldset disabled={busy || !!verification} className="space-y-3 border-0 p-0">{[['COD', 'Cash on Delivery', 'Pay when your order arrives.', Truck], ['ONLINE', 'Pay online', 'UPI, cards, net banking and more.', CreditCard], ['EMI', 'Pay with EMI', 'Available for eligible cards and banks in Razorpay.', CreditCard]].map(([value, label, description, Icon]) => <label key={value} className={`flex items-start gap-3 rounded-xl border p-4 ${method === value ? 'border-terra bg-peach/40' : 'border-sand'} ${value !== 'COD' && !config.onlineEnabled ? 'opacity-50' : 'cursor-pointer'}`}><input type="radio" name="payment-method" value={value} checked={method === value} disabled={value !== 'COD' && !config.onlineEnabled} onChange={() => setMethod(value)} className="mt-1 accent-terra" /><Icon size={20} className="mt-0.5 text-terra" /><span><span className="text-sm font-medium">{label}</span><span className="mt-1 block text-xs leading-relaxed text-muted">{description}</span></span></label>)}</fieldset>{!config.onlineEnabled && <p className="mt-4 text-xs text-muted">Online payments are currently unavailable. You can place a Cash on Delivery order.</p>}</section>
      </div>
      <aside className="min-w-0 rounded-2xl border border-sand bg-white p-5 md:p-7 lg:sticky lg:top-24"><h2 className="mb-5 text-xl">Order summary</h2><ul className="max-h-[420px] space-y-5 overflow-y-auto">{lines.map(({ item, product, option, valid }) => <li key={item.lineKey || item.id} className="flex gap-3"><img src={product?.images?.[0] || item.img} alt="" className="h-20 w-20 shrink-0 rounded-lg bg-cream object-cover" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{product?.name || item.title}</p>{item.selectedColor && <p className="mt-1 text-xs text-muted">{item.selectedColor}</p>}{item.priceChanged && <p className="mt-1 text-xs text-terra">Price updated since you added this.</p>}<p className="mt-2 text-sm">{formatPrice(option?.price || 0)} × {item.qty}</p>{!valid && <p className="mt-1 text-xs text-terra">Unavailable or not enough stock.</p>}<button disabled={busy || !!verification} onClick={() => updateQty(item.lineKey || item.id, 0)} className="mt-2 text-xs text-muted underline hover:text-terra">Remove</button></div></li>)}</ul><div className="mt-6 flex items-center justify-between border-t border-sand pt-5 font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div>
        {error && <p role="alert" className="mt-5 rounded-xl bg-peach p-4 text-sm leading-relaxed">{error}</p>}
        {verification ? <button disabled={busy} onClick={() => verify(verification)} className="btn-dark mt-6 w-full disabled:opacity-50">{busy ? 'Checking payment…' : 'Check payment status'}</button> : <button disabled={busy || invalid || !addressId || addingAddress || !cart.length} onClick={pay} className="btn-dark mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50">{busy ? <><LoaderCircle size={17} className="animate-spin" />Processing…</> : method === 'COD' ? 'Place order · Cash on Delivery' : method === 'EMI' ? 'Continue to EMI' : `Pay ${formatPrice(total)}`}</button>}
        <p className="mt-4 text-center text-xs leading-relaxed text-muted">{verification ? 'Do not pay again while your payment is being confirmed.' : method === 'COD' ? 'Your order is confirmed when you place it.' : 'Payments are processed securely by Razorpay.'}</p>
      </aside>
    </div>
  </div></section>
}
