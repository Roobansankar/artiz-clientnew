'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { TableSkeleton } from './AdminContentSkeleton'

const statuses = { PAID: 'Paid', CONFIRMED: 'COD confirmed', PENDING: 'Awaiting payment', FAILED: 'Failed' }
const statusClass = { PAID: 'paid', CONFIRMED: 'warning', PENDING: 'warning', FAILED: 'failed' }
const money = (value, currency = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
const date = value => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

const steps = [
  { key: 'PROCESSING', label: 'Order placed', at: 'createdAt' },
  { key: 'DISPATCHED', label: 'Dispatched', at: 'dispatchedAt', action: 'Mark as dispatched' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery', at: 'outForDeliveryAt', action: 'Mark out for delivery' },
  { key: 'DELIVERED', label: 'Delivered', at: 'deliveredAt', action: 'Mark as delivered' },
]
const eventLabels = { PLACED: 'Order placed', DISPATCHED: 'Dispatched', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered + invoice' }
const resultClass = { SENT: 'paid', DELIVERED: 'paid', READ: 'paid', FAILED: 'failed', SKIPPED: 'neutral' }
const resultLabel = { SENT: 'Sent', FAILED: 'Failed', SKIPPED: 'Skipped' }

function DeliveryCard({ order, onChange, onUnauthorized }) {
  const [pending, setPending] = useState(null)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const dialog = useRef(null)
  useEffect(() => { if (pending) dialog.current?.showModal(); else dialog.current?.close() }, [pending])
  const placed = ['PAID', 'CONFIRMED'].includes(order.status)
  const currentIndex = Math.max(0, steps.findIndex(step => step.key === (order.fulfillmentStatus || 'PROCESSING')))
  const next = steps[currentIndex + 1]
  async function post(path, body, success) {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (response.status === 401) { onUnauthorized(); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not update the order.')
      onChange(data.order)
      if (data.whatsapp?.status === 'SENT') toast.success(success, { description: 'WhatsApp message sent to the customer.' })
      else toast.warning(success, { description: `WhatsApp not sent: ${data.whatsapp?.error || 'unknown error'}` })
      setPending(null)
    } catch (reason) { toast.error(reason.message) } finally { setSaving(false) }
  }
  async function downloadInvoice() {
    setDownloading(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/invoice`, { cache: 'no-store' })
      if (response.status === 401) { onUnauthorized(); return }
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message || 'Could not create the invoice.') }
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = `Artiz-Invoice-${order.number}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (reason) { toast.error(reason.message) } finally { setDownloading(false) }
  }
  const log = [...(order.whatsappLog || [])].reverse()
  return <section className="ad-order-page-card ad-delivery-card">
    <div className="ad-delivery-head">
      <h3>Delivery &amp; WhatsApp updates</h3>
      {placed && <button type="button" className="ad-secondary" onClick={downloadInvoice} disabled={downloading}>{downloading ? 'Preparing…' : 'Download invoice'}</button>}
    </div>
    {!placed ? <p className="ad-muted ad-small">Delivery updates are available once the order is placed (paid or COD confirmed).</p> : <>
      <ol className="ad-delivery-steps">
        {steps.map((step, index) => <li key={step.key} className={index <= currentIndex ? 'done' : ''}>
          <span className="ad-delivery-dot" aria-hidden="true">{index <= currentIndex ? '✓' : index + 1}</span>
          <div><strong>{step.label}</strong><small className="ad-muted">{order[step.at] ? date(order[step.at]) : 'Pending'}</small></div>
        </li>)}
      </ol>
      {next
        ? <button type="button" className="ad-primary" disabled={saving} onClick={() => setPending(next)}>{next.action}</button>
        : <p className="ad-delivery-complete">Order delivered. The invoice was sent on WhatsApp.</p>}
      <h4 className="ad-delivery-log-title">WhatsApp messages</h4>
      {log.length ? <ul className="ad-delivery-log">
        {log.map((entry, index) => <li key={index}>
          <div>
            <strong>{eventLabels[entry.event] || entry.event}</strong>
            <small className="ad-muted">{date(entry.at)}</small>
            {entry.error && <small className="ad-delivery-error">{entry.error}</small>}
          </div>
          <span className={`ad-status ${resultClass[entry.status] || 'neutral'}`}>{resultLabel[entry.status] || entry.status}</span>
          {entry.status !== 'SENT' && <button type="button" className="ad-secondary" disabled={saving} onClick={() => post('notify', { event: entry.event }, `${eventLabels[entry.event] || 'Message'} re-sent`)}>Resend</button>}
        </li>)}
      </ul> : <p className="ad-muted ad-small">No WhatsApp messages sent for this order yet.</p>}
    </>}
    <dialog ref={dialog} aria-labelledby="delivery-step-title" onCancel={event => { if (saving) event.preventDefault(); else setPending(null) }} className="ad-cash-dialog">
      <h2 id="delivery-step-title">{pending?.action}?</h2>
      <p className="ad-muted">Order <strong>{order.number}</strong> will be marked <strong>{pending?.label.toLowerCase()}</strong> and <strong>{order.name}</strong> will get a WhatsApp update on {order.phone}{pending?.key === 'DELIVERED' ? ', with the invoice PDF attached' : ''}.</p>
      <div className="ad-action-group">
        <button type="button" autoFocus disabled={saving} className="ad-secondary" onClick={() => setPending(null)}>Cancel</button>
        <button type="button" disabled={saving || !pending} className="ad-primary" onClick={() => post('fulfillment', { status: pending.key }, `Order marked ${pending.label.toLowerCase()}`)}>{saving ? 'Updating…' : 'Confirm & send'}</button>
      </div>
    </dialog>
  </section>
}

export default function AdminOrderDetail({ id }) {
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [confirming, setConfirming] = useState(false)
  const [collecting, setCollecting] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const dialog = useRef(null)
  useEffect(() => { if (confirming) dialog.current?.showModal(); else dialog.current?.close() }, [confirming])
  async function collectCash() {
    if (collecting) return
    setCollecting(true); setPaymentError('')
    try {
      const response = await fetch(`/api/admin/orders/${id}/collect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmReceived: true }) })
      if (response.status === 401) { router.replace('/admin/login'); return }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not record the payment.')
      setOrder(data.order); setConfirming(false)
    } catch (reason) { setPaymentError(reason.message) } finally { setCollecting(false) }
  }
  useEffect(() => {
    const controller = new AbortController()
    window.scrollTo({ top: 0, behavior: 'instant' })
    setLoading(true); setError(''); setOrder(null)
    fetch(`/api/admin/orders/${encodeURIComponent(id)}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (response.status === 401) { router.replace('/admin/login'); return }
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Could not load this order.')
        setOrder(data.order)
      }).catch(reason => { if (!controller.signal.aborted) setError(reason.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [id, reload, router])
  const method = order?.paymentMethod === 'COD' ? 'Cash on Delivery' : order?.paymentMethod === 'EMI' || order?.paymentChannel === 'emi' ? 'Razorpay EMI' : 'Razorpay online'
  const shipping = order?.shipping || {}
  return <div className="ad-order-page">
    <div className="ad-page-actions"><Link href="/admin/orders" className="ad-secondary">← Back to orders</Link></div>
    {loading ? <TableSkeleton /> : error ? <div className="ad-auth-error" role="alert">{error} <button className="ad-inline-button" onClick={() => setReload(value => value + 1)}>Try again</button></div> : order && <>
      <header className="ad-order-page-heading"><div><p className="ad-muted ad-small">Order details</p><h2>{order.number}</h2><p className="ad-muted ad-small">Placed {date(order.createdAt)}</p></div><span className={`ad-status ${statusClass[order.status]}`}><i />{statuses[order.status]}</span></header>
      <div className="ad-order-page-layout"><section className="ad-order-page-card"><h3>Items ordered <span className="ad-muted">({order.items.reduce((sum, item) => sum + item.quantity, 0)})</span></h3><div className="ad-table-scroll"><table><thead><tr><th>S.No</th><th>Product</th><th>Unit price</th><th>Qty</th><th className="ad-align-right">Total</th></tr></thead><tbody>{order.items.map((item, index) => <tr key={index}><td className="ad-muted">{index + 1}</td><td><div className="ad-order-page-product"><img src={item.image || '/images/categories/decor.jpg'} alt="" /><div><strong>{item.name}</strong>{item.variantLabel && <p className="ad-muted ad-small">{item.variantLabel}</p>}</div></div></td><td>{money(item.unitPrice, order.currency)}</td><td>{item.quantity}</td><td className="ad-align-right">{money(item.unitPrice * item.quantity, order.currency)}</td></tr>)}</tbody></table></div><div className="ad-order-page-total"><span>Order total</span><strong>{money(order.amount, order.currency)}</strong></div></section><DeliveryCard order={order} onChange={setOrder} onUnauthorized={() => router.replace('/admin/login')} />
      <aside className="ad-order-page-sidebar"><section className="ad-order-page-card"><h3>Customer</h3><strong>{order.name}</strong><p className="ad-muted">{order.email}</p><p className="ad-muted">{order.phone}</p></section><section className="ad-order-page-card"><h3>Delivery address</h3><address>{[shipping.fullName, shipping.line1, shipping.line2, [shipping.city, shipping.state, shipping.postalCode].filter(Boolean).join(', '), shipping.country, shipping.phone].filter(Boolean).map((line, index) => <div key={index}>{line}</div>)}</address></section><section className="ad-order-page-card"><h3>Payment</h3><dl className="ad-order-page-payment"><dt>Method</dt><dd>{method}</dd><dt>Status</dt><dd>{order.paymentMethod === 'COD' ? (order.status === 'PAID' ? 'Cash collected' : 'Due on delivery') : statuses[order.status]}</dd>{order.razorpayPaymentId && <><dt>Payment ID</dt><dd>{order.razorpayPaymentId}</dd></>}{order.razorpayOrderId && <><dt>Razorpay order</dt><dd>{order.razorpayOrderId}</dd></>}{order.paidAt && <><dt>Paid at</dt><dd>{date(order.paidAt)}</dd></>}</dl>{order.paymentMethod === 'COD' && order.status === 'CONFIRMED' && <button type="button" className="ad-primary" onClick={() => { setPaymentError(''); setConfirming(true); }}>Mark payment collected</button>}</section></aside></div>
    </>}
    <dialog ref={dialog} aria-labelledby="collect-cash-title" onCancel={event => { if (collecting) event.preventDefault(); else setConfirming(false) }} className="ad-cash-dialog">
      <h2 id="collect-cash-title">Confirm cash received</h2><p>Have you received <strong>{money(order?.amount || 0)}</strong> for order <strong>{order?.number}</strong>? Confirm only after receiving the payment.</p>
      {paymentError && <p role="alert" className="ad-auth-error">{paymentError}</p>}
      <div className="ad-action-group"><button type="button" autoFocus disabled={collecting} className="ad-secondary" onClick={() => setConfirming(false)}>Cancel</button><button type="button" disabled={collecting} onClick={collectCash} className="ad-primary">{collecting ? 'Saving…' : 'Confirm payment collected'}</button></div>
    </dialog>
  </div>
}
