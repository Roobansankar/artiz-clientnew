'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AlertTriangle, TrendingUp, ReceiptIndianRupee, ArrowDownRight, ArrowUpRight, Box, CheckCircle2, IndianRupee, Mail, Package, Truck, Users, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RevenueChart from './RevenueChart'
import { TableSkeleton } from './AdminContentSkeleton'

const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0)
const change = (value, previous) => {
  if (!previous) return value ? { label: 'New', tone: 'up' } : { label: 'No change', tone: 'flat' }
  const pct = (value - previous) / previous * 100
  return { label: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, tone: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat' }
}
const initials = name => String(name || '?').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
const paymentLabel = method => method === 'COD' ? 'Cash on Delivery' : method === 'EMI' ? 'Razorpay EMI' : 'Razorpay online'

function Sparkline({ points }) {
  if (points.length < 2) return null
  const max = Math.max(1, ...points)
  const step = 100 / (points.length - 1)
  const line = points.map((value, index) => `${index ? 'L' : 'M'}${(index * step).toFixed(2)},${(30 - (value / max) * 26 - 2).toFixed(2)}`).join(' ')
  return <svg className="ad-dash-spark" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><path d={`${line} L100,30 L0,30 Z`} className="area" /><path d={line} className="line" /></svg>
}

export default function AdminDashboard({ range, period, adminName }) {
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
  if (loading && !data) return <div role="status"><p className="ad-muted ad-small">Loading dashboard…</p><TableSkeleton /></div>
  if (error) return <div role="alert" className="ad-auth-error">{error} <button className="ad-inline-button" onClick={() => setVersion(value => value + 1)}>Try again</button></div>
  if (!data) return null
  const m = data.metrics
  const attention = data.attention || {}
  const cards = [
    { label: 'Collected revenue', value: money(m.revenue), trend: change(m.revenue, m.previousRevenue), icon: Wallet, tone: 'green', href: '/admin/reports', spark: data.daily.map(day => day.current) },
    { label: 'Expenses', value: money(m.expenses || 0), trend: (() => { const t = change(m.expenses || 0, m.previousExpenses || 0); return { ...t, tone: t.tone === 'up' ? 'down' : t.tone === 'down' ? 'up' : t.tone, arrow: t.tone } })(), icon: ReceiptIndianRupee, tone: 'rose', href: '/admin/expenses', foot: 'Recorded under Expenses' },
    { label: 'Profit', value: money(m.profit || 0), trend: change(m.profit || 0, m.previousProfit || 0), icon: TrendingUp, tone: (m.profit || 0) < 0 ? 'rose' : 'teal', href: '/admin/expenses', foot: m.revenue ? `Margin ${Math.round(((m.profit || 0) / m.revenue) * 100)}% · revenue minus expenses` : 'Revenue minus expenses', negative: (m.profit || 0) < 0 },
    { label: 'Placed orders', value: m.orders.toLocaleString('en-IN'), trend: change(m.orders, m.previousOrders), icon: Package, tone: 'blue', href: '/admin/orders' },
    { label: 'New customers', value: m.customers.toLocaleString('en-IN'), trend: change(m.customers, m.previousCustomers), icon: Users, tone: 'violet', href: '/admin/customers' },
    { label: 'Published products', value: m.products.toLocaleString('en-IN'), trend: { label: 'In catalogue', tone: 'flat' }, icon: Box, tone: 'amber', href: '/admin/products', foot: 'Live on your store now' },
  ]
  const online = m.onlineRevenue || 0
  const offline = m.offlineRevenue || 0
  const channelTotal = online + offline
  const onlineShare = channelTotal ? Math.round(online / channelTotal * 100) : 0
  const tasks = [
    { label: 'Orders to dispatch', detail: 'Placed online, not yet shipped', count: attention.toDispatch, icon: Truck, href: '/admin/orders' },
    { label: 'Cash on Delivery to collect', detail: attention.codDueCount ? `${money(attention.codDueAmount)} pending` : 'Nothing pending', count: attention.codDueCount, icon: IndianRupee, href: '/admin/orders' },
    { label: 'New contact messages', detail: 'Waiting for a reply', count: attention.newMessages, icon: Mail, href: '/admin/contact-messages' },
    { label: 'Low stock products', detail: '3 or fewer left', count: attention.lowStockCount, icon: AlertTriangle, href: '/admin/products' },
  ]
  const topMax = Math.max(1, ...(data.topProducts || []).map(product => product.revenue))
  return <div className="ad-dash">

    <div className="ad-dash-kpis">{cards.map(({ label, value, trend, icon: Icon, tone, href, spark, foot, negative }) => <Link href={href} className={`ad-dash-kpi tone-${tone}`} key={label}>
      <div className="ad-dash-kpi-top"><span className="ad-dash-kpi-icon"><Icon size={19} /></span><span className={`ad-dash-trend is-${trend.tone}`}>{(trend.arrow || trend.tone) === 'up' ? <ArrowUpRight size={13} /> : (trend.arrow || trend.tone) === 'down' ? <ArrowDownRight size={13} /> : null}{trend.label}</span></div>
      <span className="ad-dash-kpi-label">{label}</span>
      <strong className={`ad-dash-kpi-value ${negative ? 'is-negative' : ''}`}>{value}</strong>
      {spark ? <Sparkline points={spark} /> : <span className="ad-dash-kpi-foot">{foot || `vs previous ${days} days`}</span>}
    </Link>)}</div>

    <div className="ad-dash-grid">
      <div className="ad-dash-main"><RevenueChart range={range} period={period} total={m.revenue} previousTotal={m.previousRevenue} points={data.daily} /></div>
      <aside className="ad-dash-side">
        <section className="ad-dash-card" aria-labelledby="dash-channel-title">
          <div className="ad-dash-card-head"><h3 id="dash-channel-title">Sales by channel</h3><Link href="/admin/reports" className="ad-dash-link">Report →</Link></div>
          <strong className="ad-dash-channel-total">{money(channelTotal)}</strong>
          <div className="ad-dash-split" role="img" aria-label={`Online ${onlineShare}%, offline ${100 - onlineShare}%`}>{channelTotal ? <><span className="is-online" style={{ flexGrow: online }} /><span className="is-offline" style={{ flexGrow: offline }} /></> : <span className="is-empty" />}</div>
          <ul className="ad-dash-channel-list">
            <li><i className="is-online" />Online<span>{channelTotal ? onlineShare : 0}%</span><strong>{money(online)}</strong></li>
            <li><i className="is-offline" />In store<span>{channelTotal ? 100 - onlineShare : 0}%</span><strong>{money(offline)}</strong></li>
          </ul>
        </section>
        <section className="ad-dash-card" aria-labelledby="dash-attention-title">
          <div className="ad-dash-card-head"><h3 id="dash-attention-title">Needs attention</h3></div>
          <ul className="ad-dash-tasks">{tasks.map(({ label, detail, count, icon: Icon, href }) => <li key={label}><Link href={href} className={count ? '' : 'is-clear'}>
            <span className="ad-dash-task-icon">{count ? <Icon size={16} /> : <CheckCircle2 size={16} />}</span>
            <span className="ad-dash-task-text"><strong>{label}</strong><small>{count ? detail : 'All clear'}</small></span>
            <span className="ad-dash-task-count">{count || 0}</span>
          </Link></li>)}</ul>
        </section>
      </aside>
    </div>

    <div className="ad-dash-grid">
      <section className="ad-dash-card ad-dash-main" aria-labelledby="dash-recent-title">
        <div className="ad-dash-card-head"><div><h3 id="dash-recent-title">Recent orders</h3><p className="ad-muted ad-small">Online orders in the selected period · India time</p></div><Link href="/admin/orders" className="ad-secondary">View all</Link></div>
        <div className="ad-table-scroll"><table className="ad-dash-orders"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th className="ad-align-right">Amount</th></tr></thead><tbody>{data.recentOrders.map(order => <tr key={order.id} onClick={() => router.push(`/admin/orders/${order.id}`)}>
          <td><Link href={`/admin/orders/${order.id}`} className="ad-inline-button" onClick={event => event.stopPropagation()}>{order.number}</Link><p className="ad-muted ad-small">{order.itemCount} item{order.itemCount === 1 ? '' : 's'}</p></td>
          <td><div className="ad-dash-customer"><span className="ad-dash-avatar">{initials(order.name)}</span><div className="ad-dash-customer-text">{order.name}<p className="ad-muted ad-small" title={order.email}>{order.email}</p></div></div></td>
          <td className="ad-muted">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })}</td>
          <td><span className={`ad-status ${order.status === 'PAID' ? 'paid' : 'warning'}`}><i />{order.status === 'PAID' ? 'Paid' : 'COD due'}</span><p className="ad-muted ad-small">{paymentLabel(order.paymentMethod)}</p></td>
          <td className="ad-align-right ad-medium">{money(order.amount)}</td>
        </tr>)}</tbody></table>{!data.recentOrders.length && <div className="ad-empty">No placed orders in this period.</div>}</div>
      </section>
      <section className="ad-dash-card ad-dash-side" aria-labelledby="dash-top-title">
        <div className="ad-dash-card-head"><h3 id="dash-top-title">Top products</h3><span className="ad-muted ad-small">Last {days} days</span></div>
        {data.topProducts?.length ? <ol className="ad-dash-top">{data.topProducts.map((product, index) => <li key={product.id || product.name}>
          <span className="ad-dash-rank">{index + 1}</span>
          <img src={product.image || '/images/product-placeholder.svg'} alt="" width={40} height={40} />
          <div className="ad-dash-top-info"><strong>{product.name}</strong><span className="ad-dash-top-bar"><span style={{ width: `${(product.revenue / topMax) * 100}%` }} /></span><small className="ad-muted">{product.quantity} sold</small></div>
          <span className="ad-medium">{money(product.revenue)}</span>
        </li>)}</ol> : <p className="ad-muted ad-small">No sales in this period yet.</p>}
      </section>
    </div>
  </div>
}
