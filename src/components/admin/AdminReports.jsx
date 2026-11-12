'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TableSkeleton } from './AdminContentSkeleton';

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
const when = (value) => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
const istToday = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
const shift = (iso, days) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
const shortDay = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const csvCell = (value) => { const text = String(value ?? ''); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
const tabs = [{ value: 'ALL', label: 'All sales' }, { value: 'ONLINE', label: 'Online' }, { value: 'OFFLINE', label: 'Offline (in store)' }];
const presets = [{ label: 'Today', days: 0 }, { label: '7 days', days: 6 }, { label: '30 days', days: 29 }, { label: '90 days', days: 89 }];
const pageSize = 20;

function pageList(page, pages) {
    const set = new Set([1, pages, page - 1, page, page + 1].filter(n => n >= 1 && n <= pages));
    const sorted = [...set].sort((a, b) => a - b);
    return sorted.flatMap((n, i) => (i && n - sorted[i - 1] > 1 ? ['…', n] : [n]));
}

const compact = (value) => value >= 100000 ? `₹${(value / 100000).toFixed(value >= 1000000 ? 0 : 1)}L` : value >= 1000 ? `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : `₹${Math.round(value)}`;
// Round the axis top up to 1, 2, 2.5 or 5 × 10ⁿ so gridline labels are tidy.
function niceMax(value) {
    if (value <= 0) return 1000;
    const power = 10 ** Math.floor(Math.log10(value));
    return [1, 2, 2.5, 5, 10].map(step => step * power).find(step => step >= value);
}

function DailySalesChart({ daily, channel }) {
    const [hover, setHover] = useState(null);
    const showOnline = channel !== 'OFFLINE';
    const showOffline = channel !== 'ONLINE';
    const rows = daily.map(d => ({ ...d, on: showOnline ? d.online : 0, off: showOffline ? d.offline : 0 }));
    const totals = rows.reduce((sum, d) => ({ on: sum.on + d.on, off: sum.off + d.off }), { on: 0, off: 0 });
    const top = niceMax(Math.max(0, ...rows.map(d => d.on + d.off)));
    const ticks = [top, top / 2, 0];
    const labelEvery = Math.max(1, Math.ceil(rows.length / 8));
    const active = hover == null ? null : rows[hover];
    return <section className="ad-order-page-card ad-chart-daily" aria-labelledby="report-daily-title">
      <div className="ad-chart-daily-head">
        <h3 id="report-daily-title">Daily sales</h3>
        <ul className="ad-chart-daily-legend" aria-label="Legend">
          {showOnline && <li><i className="is-online" aria-hidden="true"/>Online <strong>{money(totals.on)}</strong></li>}
          {showOffline && <li><i className="is-offline" aria-hidden="true"/>Offline <strong>{money(totals.off)}</strong></li>}
        </ul>
      </div>
      <div className="ad-chart-daily-plot">
        <div className="ad-chart-daily-y" aria-hidden="true">{ticks.map(t => <span key={t}>{compact(t)}</span>)}</div>
        <div className="ad-chart-daily-area" onMouseLeave={() => setHover(null)}>
          <div className="ad-chart-daily-grid" aria-hidden="true">{ticks.map(t => <span key={t}/>)}</div>
          <div className="ad-chart-daily-bars" style={{ '--bar-gap': rows.length > 60 ? '1px' : '6px' }}>
            {rows.map((d, index) => {
              const total = d.on + d.off;
              return <button type="button" key={d.date} className={`ad-chart-daily-slot ${hover != null && hover !== index ? 'is-dim' : ''}`} onMouseEnter={() => setHover(index)} onFocus={() => setHover(index)} onBlur={() => setHover(null)} aria-label={`${shortDay(d.date)}: online ${money(d.on)}, offline ${money(d.off)}`}>
                <span className="ad-chart-daily-stack" style={{ height: `${(total / top) * 100}%` }}>
                  {d.off > 0 && <span className="is-offline" style={{ flexGrow: d.off }}/>}
                  {d.on > 0 && <span className="is-online" style={{ flexGrow: d.on }}/>}
                </span>
              </button>;
            })}
          </div>
          {active && <div className={`ad-chart-daily-tip ${(hover + 0.5) / rows.length > 0.6 ? 'is-left' : 'is-right'}`} style={{ left: `${((hover + 0.5) / rows.length) * 100}%` }} role="status">
            <strong>{new Date(`${active.date}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })}</strong>
            {showOnline && <span><i className="is-online"/>Online<b>{money(active.on)}</b></span>}
            {showOffline && <span><i className="is-offline"/>Offline<b>{money(active.off)}</b></span>}
            {showOnline && showOffline && <span className="is-total">Total<b>{money(active.on + active.off)}</b></span>}
          </div>}
        </div>
      </div>
      <div className="ad-chart-daily-x" aria-hidden="true">{rows.map((d, index) => { const last = rows.length - 1; const show = index === last || (index % labelEvery === 0 && last - index >= Math.max(1, labelEvery * 0.75)); return <span key={d.date} className={index === last && rows.length > 10 ? 'is-end' : ''}>{show ? shortDay(d.date) : ''}</span>; })}</div>
      {totals.on + totals.off === 0 && <p className="ad-chart-daily-empty">No sales in this period.</p>}
    </section>;
}

export default function AdminReports() {
    const router = useRouter();
    const [to, setTo] = useState(istToday);
    const [from, setFrom] = useState(() => shift(istToday(), -29));
    const [channel, setChannel] = useState('ALL');
    const [allTime, setAllTime] = useState(false);
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);

    useEffect(() => {
        if (!allTime && (!from || !to)) return;
        const controller = new AbortController();
        setLoading(true); setError('');
        fetch(`/api/admin/reports?${new URLSearchParams(allTime ? { channel, all: 'true' } : { from, to, channel })}`, { cache: 'no-store', signal: controller.signal })
            .then(async response => {
                if (response.status === 401) { router.replace('/admin/login'); return; }
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Could not load the report.');
                setData(result);
                setPage(1);
            }).catch(e => { if (!controller.signal.aborted) setError(e.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [from, to, channel, allTime, reload, router]);


    function exportCsv() {
        if (!data?.sales.length) return;
        const rows = data.sales.map(s => [s.number, when(s.createdAt), s.channel === 'OFFLINE' ? 'Offline' : 'Online', s.name, s.phone, s.email, s.paymentLabel, s.status === 'PAID' ? 'Paid' : 'COD due', s.items, s.amount]);
        const csv = [['Order / bill', 'Date (IST)', 'Channel', 'Customer', 'Mobile', 'Email', 'Payment', 'Status', 'Items', 'Amount (INR)'], ...rows].map(row => row.map(csvCell).join(',')).join('\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url; link.download = `artiz-sales-${channel.toLowerCase()}-${data.from}-to-${data.to}.csv`; link.click();
        URL.revokeObjectURL(url);
        toast.success(`${rows.length} sale${rows.length === 1 ? '' : 's'} exported.`);
    }

    const s = data?.summary;
    const pages = Math.max(1, Math.ceil((data?.sales.length || 0) / pageSize));
    const currentPage = Math.min(page, pages);
    const cards = s ? [
        { key: 'ALL', label: 'Total sales', totals: s.all },
        { key: 'ONLINE', label: 'Online sales', totals: s.online },
        { key: 'OFFLINE', label: 'Offline sales', totals: s.offline },
    ] : [];
    return <div className="ad-reports">
      <div className="ad-report-filters">
        <div className="ad-report-dates">
          <label>From<input type="date" value={allTime && data?.all ? data.from : from} max={to} onChange={e => { setAllTime(false); setFrom(e.target.value); }}/></label>
          <label>To<input type="date" value={allTime && data?.all ? data.to : to} min={from} max={istToday()} onChange={e => { setAllTime(false); setTo(e.target.value); }}/></label>
          <div className="ad-mode-options" aria-label="Quick ranges"><button type="button" className={allTime ? 'selected' : ''} aria-pressed={allTime} onClick={() => setAllTime(true)}>All</button>{presets.map(p => { const active = !allTime && to === istToday() && from === shift(istToday(), -p.days); return <button type="button" key={p.label} className={active ? 'selected' : ''} aria-pressed={active} onClick={() => { const today = istToday(); setAllTime(false); setTo(today); setFrom(shift(today, -p.days)); }}>{p.label}</button>; })}</div>
        </div>
        <button type="button" className="ad-secondary" onClick={exportCsv} disabled={!data?.sales.length}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg>Export CSV</button>
      </div>
      <div className="ad-product-tabs ad-report-tabs" role="tablist">{tabs.map(t => <button key={t.value} type="button" role="tab" aria-pressed={channel === t.value} aria-selected={channel === t.value} onClick={() => { setChannel(t.value); setPage(1); }}>{t.label}{s && <span>{(t.value === 'ALL' ? s.all : t.value === 'ONLINE' ? s.online : s.offline).count}</span>}</button>)}</div>

      {error ? <div className="ad-auth-error" role="alert">{error} <button className="ad-inline-button" onClick={() => setReload(r => r + 1)}>Try again</button></div> : loading && !data ? <TableSkeleton /> : data && <>
        <div className="ad-report-cards">{cards.map(card => <button type="button" key={card.key} className={`ad-report-card ${channel === card.key ? 'active' : ''}`} onClick={() => setChannel(card.key)}>
          <span className="ad-muted ad-small">{card.label}</span>
          <strong>{money(card.totals.amount)}</strong>
          <span className="ad-small">{card.totals.count} {card.key === 'OFFLINE' ? 'bill' : 'order'}{card.totals.count === 1 ? '' : 's'}{card.totals.due > 0 ? ` · ${money(card.totals.due)} COD due` : ''}</span>
        </button>)}</div>

        <div className="ad-report-split">
          <DailySalesChart daily={data.daily} channel={channel} />
          <section className="ad-order-page-card" aria-labelledby="report-payment-title">
            <h3 id="report-payment-title">By payment method</h3>
            {data.byPayment.length ? <ul className="ad-report-methods">{data.byPayment.map(m => <li key={m.method}><div><strong>{m.label}</strong><small className="ad-muted">{m.count} sale{m.count === 1 ? '' : 's'}</small></div><span className="ad-medium">{money(m.amount)}</span></li>)}</ul> : <p className="ad-muted ad-small">No sales in this period.</p>}
          </section>
        </div>

        <section className="ad-order-page-card" aria-labelledby="report-list-title">
          <div className="ad-page-actions"><h3 id="report-list-title">{tabs.find(t => t.value === channel).label} · {data.all ? 'All time' : `${shortDay(data.from)} – ${shortDay(data.to)}`}</h3><span className="ad-muted ad-small">{data.sales.length} sale{data.sales.length === 1 ? '' : 's'}{data.truncated ? ' (first 5,000)' : ''}</span></div>
          <div className="ad-table-scroll"><table><thead><tr><th>S.No</th><th>Order / bill</th><th>Date</th><th>Channel</th><th>Customer</th><th>Payment</th><th>Status</th><th className="ad-align-right">Amount</th></tr></thead><tbody>{data.sales.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((sale, index) => <tr key={sale.id}>
            <td className="ad-muted">{(currentPage - 1) * pageSize + index + 1}</td>
            <td>{sale.channel === 'ONLINE' ? <Link href={`/admin/orders/${sale.id}`} className="ad-inline-button">{sale.number}</Link> : <span className="ad-medium">{sale.number}</span>}</td>
            <td className="ad-muted">{when(sale.createdAt)}</td>
            <td><span className={`ad-status ${sale.channel === 'OFFLINE' ? 'warning' : 'neutral'}`}>{sale.channel === 'OFFLINE' ? 'Offline' : 'Online'}</span></td>
            <td>{sale.name}<p className="ad-muted ad-small">{sale.phone}</p></td>
            <td className="ad-muted">{sale.paymentLabel}</td>
            <td><span className={`ad-status ${sale.status === 'PAID' ? 'paid' : 'warning'}`}>{sale.status === 'PAID' ? 'Paid' : 'COD due'}</span></td>
            <td className="ad-align-right ad-medium">{money(sale.amount)}</td>
          </tr>)}</tbody></table>{!data.sales.length && <div className="ad-empty">No sales in this period.</div>}</div>
          {data.sales.length > 0 && <div className="ad-table-footer"><span>Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, data.sales.length)} of {data.sales.length}</span><span className="ad-pagination"><button disabled={currentPage <= 1} aria-label="Previous page" onClick={() => setPage(currentPage - 1)}>‹</button>{pageList(currentPage, pages).map((n, i) => n === '…' ? <span key={`gap-${i}`} className="ad-pagination-gap">…</span> : <button key={n} className={n === currentPage ? 'active' : ''} aria-current={n === currentPage ? 'page' : undefined} onClick={() => setPage(n)}>{n}</button>)}<button disabled={currentPage >= pages} aria-label="Next page" onClick={() => setPage(currentPage + 1)}>›</button></span></div>}
        </section>
      </>}
    </div>;
}
