'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Box, Globe, Package, Store, Users, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RevenueChart from './RevenueChart'
import { TableSkeleton } from './AdminContentSkeleton'

const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
const growth = (value, previous) => previous ? `${value >= previous ? '+' : ''}${((value - previous) / previous * 100).toFixed(1)}%` : value ? 'New' : 'No change'
export default function AdminDashboard({ range, period }) {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)
  const days = range === 'Last 7 days' ? 7 : range === 'Last 30 days' ? 30 : 14
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true); setError('')
    fetch(`/api/admin/dashboard?days=${days}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (response.status === 401) { router.replace('/admin/login'); return }
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Could not load dashboard.')
        setData(result)
      }).catch(reason => { if (!controller.signal.aborted) setError(reason.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [days, version, router])
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') setVersion(value => value + 1) }
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])
  if (loading) return <div role="status"><p className="ad-muted ad-small">Loading dashboard…</p><TableSkeleton /></div>
  if (error) return <div role="alert" className="ad-auth-error">{error} <button className="ad-inline-button" onClick={() => setVersion(value => value + 1)}>Try again</button></div>
  if (!data) return null
  const m = data.metrics
  const cards = [
    { label: 'New customers', value: m.customers.toLocaleString('en-IN'), change: growth(m.customers, m.previousCustomers), icon: Users, href: '/admin/customers' },
    { label: 'Placed orders', value: m.orders.toLocaleString('en-IN'), change: growth(m.orders, m.previousOrders), icon: Package, href: '/admin/orders' },
    { label: 'Collected revenue', value: money(m.revenue), change: growth(m.revenue, m.previousRevenue), icon: Wallet, href: '/admin/reports' },
    { label: 'Published products', value: m.products.toLocaleString('en-IN'), change: 'Current catalog', icon: Box, href: '/admin/products' },
  ]
  const channels = [
    { label: 'Online sales', value: money(m.onlineRevenue || 0), share: m.revenue ? Math.round((m.onlineRevenue || 0) / m.revenue * 100) : 0, icon: Globe, href: '/admin/reports' },
    { label: 'Offline sales (in store)', value: money(m.offlineRevenue || 0), share: m.revenue ? Math.round((m.offlineRevenue || 0) / m.revenue * 100) : 0, icon: Store, href: '/admin/billing' },
  ]
  return <>
    <div className="ad-stats">{cards.map(({ label, value, change, icon: Icon, href }) => <Link href={href} className="ad-stat" key={label}><span className="ad-stat-icon"><Icon size={20} /></span><span className="ad-stat-label">{label}</span><div><strong>{value}</strong><span className="ad-muted ad-small">{change}</span></div></Link>)}</div>
    <div className="ad-channel-stats">{channels.map(({ label, value, share, icon: Icon, href }) => <Link href={href} className="ad-channel-stat" key={label}><span className="ad-stat-icon"><Icon size={18} /></span><div><span className="ad-stat-label">{label}</span><strong>{value}</strong></div><span className="ad-channel-share"><span style={{ width: `${share}%` }} /></span><span className="ad-muted ad-small">{share}% of collected revenue</span></Link>)}</div>
    <RevenueChart range={range} period={period} total={m.revenue} previousTotal={m.previousRevenue} points={data.daily} />
    <section className="ad-order-page-card" aria-label="Recent orders"><div className="ad-page-actions"><h2>Recent orders</h2><Link href="/admin/orders" className="ad-secondary">View all orders</Link></div><p className="ad-muted ad-small" style={{ marginBottom: 16 }}>Placed orders in the selected period · Times shown in India time</p><div className="ad-table-scroll"><table><thead><tr><th>S.No</th><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Status</th><th className="ad-align-right">Amount</th></tr></thead><tbody>{data.recentOrders.map((order, index) => <tr key={order.id}><td className="ad-muted">{index + 1}</td><td><Link href={`/admin/orders/${order.id}`} className="ad-inline-button">{order.number}</Link></td><td>{order.name}<p className="ad-muted ad-small">{order.email}</p></td><td className="ad-muted">{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' })}</td><td className="ad-muted">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod === 'EMI' ? 'Razorpay EMI' : 'Razorpay online'}</td><td><span className={`ad-status ${order.status === 'PAID' ? 'paid' : 'warning'}`}><i />{order.status === 'PAID' ? 'Paid' : 'COD confirmed'}</span></td><td className="ad-align-right ad-medium">{money(order.amount)}</td></tr>)}</tbody></table>{!data.recentOrders.length && <div className="ad-empty">No placed orders in this period.</div>}</div></section>
  </>
}
