'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TableSkeleton } from './AdminContentSkeleton';

const date = (value) => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
const sourceLabels = { footer: 'Footer form', popup: 'Sign-up popup' };
const csvCell = (value) => { const text = String(value ?? ''); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };

export default function AdminNewsletter({ notify }) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ subscribers: [], total: 0, page: 1, pageSize: 20 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    const [deleting, setDeleting] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [exporting, setExporting] = useState(false);
    const deleteDialog = useRef(null);

    useEffect(() => {
        if (deleting) deleteDialog.current?.showModal();
        else deleteDialog.current?.close();
    }, [deleting]);

    const fetchSubscribers = useCallback(async (params, signal) => {
        const response = await fetch(`/api/admin/newsletter?${new URLSearchParams({ search, ...params })}`, { cache: 'no-store', signal });
        if (response.status === 401) { router.replace('/admin/login'); return null; }
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not load subscribers.');
        return data;
    }, [search, router]);

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true); setError('');
            try {
                const data = await fetchSubscribers({ page: String(page) }, controller.signal);
                if (data) setResult(data);
            } catch (e) {
                if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Could not load subscribers.');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 250);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [fetchSubscribers, page, reload]);

    async function removeSubscriber() {
        if (!deleting || saving) return;
        setSaving(true); setDeleteError('');
        try {
            const response = await fetch(`/api/admin/newsletter/${deleting.id}`, { method: 'DELETE' });
            if (response.status === 401) { router.replace('/admin/login'); return; }
            if (!response.ok) { const data = await response.json(); throw new Error(data.message || 'Could not remove subscriber.'); }
            setDeleting(null);
            notify?.('Subscriber removed.');
            if (result.subscribers.length === 1 && page > 1) setPage(value => value - 1);
            else setReload(value => value + 1);
        } catch (reason) { setDeleteError(reason.message || 'Could not remove subscriber.'); }
        finally { setSaving(false); }
    }

    async function exportCsv() {
        setExporting(true);
        try {
            const data = await fetchSubscribers({ page: '1', pageSize: '10000' });
            if (!data) return;
            const rows = data.subscribers.map(s => [s.email, sourceLabels[s.source] || s.source, date(s.createdAt)]);
            const csv = [['Email', 'Signed up from', 'Subscribed on (IST)'], ...rows].map(row => row.map(csvCell).join(',')).join('\n');
            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `artiz-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            notify?.(`${rows.length} subscriber${rows.length === 1 ? '' : 's'} exported.`);
        } catch (e) {
            notify?.(e instanceof Error ? e.message : 'Could not export subscribers.');
        } finally {
            setExporting(false);
        }
    }

    const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
    return <>
    <div className="ad-page-actions">
      <label className="ad-search"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input aria-label="Search subscribers" placeholder="Filter by email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></label>
      <div className="ad-action-group">
        <span className="ad-muted ad-small">{result.total} subscriber{result.total === 1 ? '' : 's'}</span>
        <button className="ad-secondary" onClick={exportCsv} disabled={exporting || !result.total}><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg>{exporting ? 'Exporting…' : 'Export'}</button>
      </div>
    </div>
    {error && <p className="ad-auth-error" role="alert">{error} <button className="ad-inline-button" onClick={() => setReload(r => r + 1)}>Try again</button></p>}
    {loading && !result.subscribers.length ? <TableSkeleton /> : <div className="ad-table-scroll"><table><thead><tr><th>S.No</th><th>Email</th><th>Signed up from</th><th>Subscribed on</th><th>Actions</th></tr></thead><tbody>{result.subscribers.map((s, i) => <tr key={s.id}>
      <td className="ad-muted">{(result.page - 1) * result.pageSize + i + 1}</td>
      <td><a href={`mailto:${s.email}`}>{s.email}</a></td>
      <td><span className="ad-status neutral">{sourceLabels[s.source] || s.source}</span></td>
      <td className="ad-muted">{date(s.createdAt)}</td>
      <td><button className="ad-secondary ad-danger" disabled={loading || saving} aria-label={`Remove ${s.email}`} onClick={() => { setDeleteError(''); setDeleting(s); }}>Remove</button></td>
    </tr>)}</tbody></table>{!result.subscribers.length && !error && <div className="ad-empty">{search ? 'No subscribers match your search.' : 'No subscribers yet. Sign-ups from the footer and popup will appear here.'}</div>}</div>}
    <div className="ad-table-footer"><span>Page {page} of {pages}</span><span className="ad-pagination"><button disabled={page <= 1} aria-label="Previous page" onClick={() => setPage(p => p - 1)}>‹</button><button className="active" aria-current="page">{page}</button><button disabled={page >= pages} aria-label="Next page" onClick={() => setPage(p => p + 1)}>›</button></span></div>
    <dialog ref={deleteDialog} aria-labelledby="delete-subscriber-title" onCancel={event => { if (saving) event.preventDefault(); else setDeleting(null); }} className="ad-cash-dialog">
      <h2 id="delete-subscriber-title">Remove subscriber?</h2>
      <p className="ad-muted">Remove <strong>{deleting?.email}</strong> from the newsletter list? They can subscribe again later.</p>
      {deleteError && <p className="ad-auth-error" role="alert">{deleteError}</p>}
      <div className="ad-action-group"><button type="button" autoFocus disabled={saving} className="ad-secondary" onClick={() => setDeleting(null)}>Cancel</button><button type="button" disabled={saving} className="ad-primary ad-danger" onClick={removeSubscriber}>{saving ? 'Removing...' : 'Remove'}</button></div>
    </dialog>
  </>;
}
