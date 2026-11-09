'use client';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TableSkeleton } from './AdminContentSkeleton';
const statusLabels = { PAID: 'Paid', PENDING: 'Awaiting payment', FAILED: 'Failed' };
const statusClass = { PAID: 'paid', PENDING: 'warning', FAILED: 'failed' };
const money = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
const when = (value) => new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });
const csvCell = (value) => { const text = String(value ?? ''); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
function SearchIcon() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>; }
export default function AdminOrders({ notify }) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('PAID');
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ orders: [], total: 0, page: 1, pageSize: 20, summary: { paidOrders: 0, revenue: 0 } });
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    const [open, setOpen] = useState('');
    const fetchOrders = useCallback(async (params, signal) => {
        const response = await fetch(`/api/admin/orders?${new URLSearchParams({ search, status, ...params })}`, { cache: 'no-store', signal });
        if (response.status === 401) {
            router.replace('/admin/login');
            return null;
        }
        const data = await response.json();
        if (!response.ok)
            throw new Error(data.message || 'Could not load orders.');
        return data;
    }, [search, status, router]);
    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchOrders({ page: String(page) }, controller.signal);
                if (data)
                    setResult(data);
            }
            catch (e) {
                if (!controller.signal.aborted)
                    setError(e instanceof Error ? e.message : 'Could not load orders.');
            }
            finally {
                if (!controller.signal.aborted)
                    setLoading(false);
            }
        }, 250);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [fetchOrders, page, reload]);
    async function exportCsv() {
        setExporting(true);
        try {
            const data = await fetchOrders({ page: '1', pageSize: '5000' });
            if (!data)
                return;
            const rows = data.orders.map(o => [o.number, when(o.paidAt ?? o.createdAt), statusLabels[o.status], o.name, o.email, o.phone, o.items.map(i => `${i.quantity} x ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ''}`).join('; '), [o.shipping.line1, o.shipping.line2, o.shipping.city, o.shipping.state, o.shipping.postalCode, o.shipping.country].filter(Boolean).join(', '), o.amount, o.razorpayPaymentId ?? '']);
            const csv = [['Order', 'Date', 'Status', 'Name', 'Email', 'Phone', 'Items', 'Delivery address', 'Amount (INR)', 'Razorpay payment ID'], ...rows].map(row => row.map(csvCell).join(',')).join('\n');
            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `artiz-orders-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            notify(`${data.orders.length} order${data.orders.length === 1 ? '' : 's'} exported.`);
        }
        catch (e) {
            notify(e instanceof Error ? e.message : 'Could not export orders.');
        }
        finally {
            setExporting(false);
        }
    }
    const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
    return <>
    <div className="ad-page-actions">
      <label className="ad-search"><SearchIcon /><input aria-label="Search orders" placeholder="Order no., name, email, phone, product..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></label>
      <div className="ad-action-group">
        <select aria-label="Order status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="PAID">Paid</option><option value="PENDING">Awaiting payment</option><option value="FAILED">Failed</option><option value="ALL">All</option></select>
        <button className="ad-secondary" onClick={exportCsv} disabled={exporting || !result.total}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14"/></svg>{exporting ? 'Exporting...' : 'Export'}</button>
      </div>
    </div>
    <p className="ad-muted ad-small ad-orders-summary">{result.summary.paidOrders} paid order{result.summary.paidOrders === 1 ? '' : 's'} · {money(result.summary.revenue)} received in total</p>
    {error && <p className="ad-auth-error" role="alert">{error} <button className="ad-inline-button" onClick={() => setReload(r => r + 1)}>Try again</button></p>}
    {loading && !result.orders.length ? <TableSkeleton /> : <div className="ad-table-scroll"><table className="ad-orders-table">
      <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Status</th><th className="ad-align-right">Amount</th></tr></thead>
      <tbody>{result.orders.map(o => {
                const expanded = open === o.id;
                return <Fragment key={o.id}>
          <tr className="ad-order-row" aria-expanded={expanded} tabIndex={0} onClick={() => setOpen(expanded ? '' : o.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpen(expanded ? '' : o.id);
                } }}>
            <td className="ad-medium">{o.number}</td>
            <td className="ad-muted">{when(o.paidAt ?? o.createdAt)}</td>
            <td><strong>{o.name}</strong><div className="ad-muted ad-small">{o.email}</div></td>
            <td className="ad-muted">{o.items.reduce((n, i) => n + i.quantity, 0)} · {o.items[0]?.name}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ''}</td>
            <td><span className={`ad-status ${statusClass[o.status]}`}><i />{statusLabels[o.status]}</span></td>
            <td className="ad-align-right ad-medium">{money(o.amount)}</td>
          </tr>
          {expanded && <tr className="ad-order-detail"><td colSpan={6}><div className="ad-order-detail-grid">
            <section><h3>Items</h3><ul>{o.items.map((i, index) => <li key={index}><span>{i.quantity} × {i.name}{i.variantLabel && <span className="ad-muted"> · {i.variantLabel}</span>}</span><span>{money(i.unitPrice * i.quantity)}</span></li>)}<li className="ad-order-total"><span>Total</span><span>{money(o.amount)}</span></li></ul></section>
            <section><h3>Deliver to</h3><address>{o.shipping.fullName}<br />{o.shipping.line1}{o.shipping.line2 && <>, {o.shipping.line2}</>}<br />{o.shipping.city}, {o.shipping.state} {o.shipping.postalCode}<br />{o.shipping.country}<br />{o.phone}</address></section>
            <section><h3>Payment</h3><dl><dt>Razorpay payment</dt><dd>{o.razorpayPaymentId ?? '—'}</dd><dt>Razorpay order</dt><dd>{o.razorpayOrderId}</dd><dt>Checkout started</dt><dd>{when(o.createdAt)}</dd>{o.paidAt && <><dt>Paid</dt><dd>{when(o.paidAt)}</dd></>}</dl></section>
          </div></td></tr>}
        </Fragment>;
            })}</tbody>
    </table>{!result.orders.length && !error && <div className="ad-empty">{search ? 'No orders match your search.' : status === 'PAID' ? 'No paid orders yet. They appear here as soon as a customer completes payment.' : 'No orders found.'}</div>}</div>}
    <div className="ad-table-footer"><span>{result.total} order{result.total === 1 ? '' : 's'} · Page {page} of {pages}</span><span className="ad-pagination"><button disabled={page <= 1} aria-label="Previous page" onClick={() => setPage(p => p - 1)}>‹</button><button className="active" aria-current="page">{page}</button><button disabled={page >= pages} aria-label="Next page" onClick={() => setPage(p => p + 1)}>›</button></span></div>
  </>;
}
