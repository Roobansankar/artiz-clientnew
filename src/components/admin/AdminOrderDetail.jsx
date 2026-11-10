'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TableSkeleton } from './AdminContentSkeleton'

const statuses = { PAID: 'Paid', CONFIRMED: 'COD confirmed', PENDING: 'Awaiting payment', FAILED: 'Failed' }
const statusClass = { PAID: 'paid', CONFIRMED: 'warning', PENDING: 'warning', FAILED: 'failed' }
const money = (value, currency = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
const date = value => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })

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
      <div className="ad-order-page-layout"><section className="ad-order-page-card"><h3>Items ordered <span className="ad-muted">({order.items.reduce((sum, item) => sum + item.quantity, 0)})</span></h3><div className="ad-table-scroll"><table><thead><tr><th>S.No</th><th>Product</th><th>Unit price</th><th>Qty</th><th className="ad-align-right">Total</th></tr></thead><tbody>{order.items.map((item, index) => <tr key={index}><td className="ad-muted">{index + 1}</td><td><div className="ad-order-page-product"><img src={item.image || '/images/categories/decor.jpg'} alt="" /><div><strong>{item.name}</strong>{item.variantLabel && <p className="ad-muted ad-small">{item.variantLabel}</p>}</div></div></td><td>{money(item.unitPrice, order.currency)}</td><td>{item.quantity}</td><td className="ad-align-right">{money(item.unitPrice * item.quantity, order.currency)}</td></tr>)}</tbody></table></div><div className="ad-order-page-total"><span>Order total</span><strong>{money(order.amount, order.currency)}</strong></div></section>
      <aside className="ad-order-page-sidebar"><section className="ad-order-page-card"><h3>Customer</h3><strong>{order.name}</strong><p className="ad-muted">{order.email}</p><p className="ad-muted">{order.phone}</p></section><section className="ad-order-page-card"><h3>Delivery address</h3><address>{[shipping.fullName, shipping.line1, shipping.line2, [shipping.city, shipping.state, shipping.postalCode].filter(Boolean).join(', '), shipping.country, shipping.phone].filter(Boolean).map((line, index) => <div key={index}>{line}</div>)}</address></section><section className="ad-order-page-card"><h3>Payment</h3><dl className="ad-order-page-payment"><dt>Method</dt><dd>{method}</dd><dt>Status</dt><dd>{order.paymentMethod === 'COD' ? (order.status === 'PAID' ? 'Cash collected' : 'Due on delivery') : statuses[order.status]}</dd>{order.razorpayPaymentId && <><dt>Payment ID</dt><dd>{order.razorpayPaymentId}</dd></>}{order.razorpayOrderId && <><dt>Razorpay order</dt><dd>{order.razorpayOrderId}</dd></>}{order.paidAt && <><dt>Paid at</dt><dd>{date(order.paidAt)}</dd></>}</dl>{order.paymentMethod === 'COD' && order.status === 'CONFIRMED' && <button type="button" className="ad-primary" onClick={() => { setPaymentError(''); setConfirming(true); }}>Mark payment collected</button>}</section></aside></div>
    </>}
    <dialog ref={dialog} aria-labelledby="collect-cash-title" onCancel={event => { if (collecting) event.preventDefault(); else setConfirming(false) }} className="ad-cash-dialog">
      <h2 id="collect-cash-title">Confirm cash received</h2><p>Have you received <strong>{money(order?.amount || 0)}</strong> for order <strong>{order?.number}</strong>? Confirm only after receiving the payment.</p>
      {paymentError && <p role="alert" className="ad-auth-error">{paymentError}</p>}
      <div className="ad-action-group"><button type="button" autoFocus disabled={collecting} className="ad-secondary" onClick={() => setConfirming(false)}>Cancel</button><button type="button" disabled={collecting} onClick={collectCash} className="ad-primary">{collecting ? 'Saving…' : 'Confirm payment collected'}</button></div>
    </dialog>
  </div>
}
