'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TableSkeleton } from './AdminContentSkeleton';
const labels = { NEW: 'New', READ: 'Read', RESOLVED: 'Resolved' };
const date = (value) => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
export default function ContactMessages() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ messages: [], total: 0, pageSize: 20, counts: {} });
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);
    const [reload, setReload] = useState(0);
    const load = useCallback(async (signal) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/admin/contact-messages?${new URLSearchParams({ search, status: filter, page: String(page) })}`, { cache: 'no-store', signal });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Could not load messages.');
            setResult(data);
            setLoaded(true);
        }
        catch (e) {
            if (!signal.aborted)
                setError(e instanceof Error ? e.message : 'Could not load messages.');
        }
        finally {
            if (!signal.aborted)
                setLoading(false);
        }
    }, [search, filter, page, router]);
    useEffect(() => { const controller = new AbortController(); const timer = setTimeout(() => load(controller.signal), 250); return () => { clearTimeout(timer); controller.abort(); }; }, [load, reload]);
    useEffect(() => { if (!selected)
        return; const escape = (event) => { if (event.key === 'Escape')
        setSelected(null); }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, [selected]);
    async function update(message, status) {
        setUpdating(true);
        setError('');
        try {
            const response = await fetch(`/api/admin/contact-messages/${message.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Could not update message.');
            setSelected(current => current?.id === message.id ? data.message : current);
            setReload(r => r + 1);
            window.dispatchEvent(new Event('artiz:contact-updated'));
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Could not update message.');
        }
        finally {
            setUpdating(false);
        }
    }
    function open(message) { setSelected(message); if (message.status === 'NEW')
        void update(message, 'READ'); }
    useEffect(() => {
        const controller = new AbortController();
        async function openById(id) {
            if (!/^[a-z0-9]{20,40}$/.test(id))
                return;
            try {
                const response = await fetch(`/api/admin/contact-messages/${id}`, { cache: 'no-store', signal: controller.signal });
                if (response.status === 401) {
                    router.replace('/admin/login');
                    return;
                }
                const data = await response.json();
                if (!response.ok)
                    throw new Error(data.message || 'Could not load message.');
                if (!controller.signal.aborted)
                    open(data.message);
            }
            catch (e) {
                if (!controller.signal.aborted)
                    setError(e instanceof Error ? e.message : 'Could not load message.');
            }
        }
        const initial = new URLSearchParams(window.location.search).get('message');
        if (initial)
            void openById(initial);
        const handle = (event) => { const id = event.detail; if (typeof id === 'string')
            void openById(id); };
        window.addEventListener('artiz:open-contact', handle);
        return () => { controller.abort(); window.removeEventListener('artiz:open-contact', handle); };
    }, [router]);
    return <>
    <div className="ad-settings-heading"><div><h2>Contact messages</h2><p>Messages sent through your website’s contact form.</p></div><button className="ad-secondary" onClick={() => setReload(r => r + 1)} disabled={loading}>↻ Refresh</button></div>
    <div className="ad-contact-summary">{['NEW', 'READ', 'RESOLVED'].map(status => <button key={status} className={filter === status ? 'active' : ''} onClick={() => { setFilter(filter === status ? 'ALL' : status); setPage(1); }}><span className={`ad-status ${status === 'NEW' ? 'warning' : status === 'RESOLVED' ? 'paid' : 'neutral'}`}>{labels[status]}</span><strong>{!loaded && loading ? <span className="ad-skeleton"/> : result.counts[status] || 0}</strong></button>)}</div>
    <div className="ad-page-actions"><label className="ad-search"><span aria-hidden="true">⌕</span><input aria-label="Search contact messages" placeholder="Search name, email or message…" maxLength={200} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></label><select aria-label="Filter message status" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}><option value="ALL">All messages</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    {error && <p className="ad-auth-error" role="alert">{error} <button className="ad-inline-button" onClick={() => setReload(r => r + 1)}>Try again</button></p>}
    {!loaded && loading ? <div role="status" aria-label="Loading contact messages"><TableSkeleton /></div> : <div className="ad-table-scroll" aria-busy={loading}><table><thead><tr><th>S.No</th><th>Sender</th><th>Topic</th><th>Message</th><th>Received (IST)</th><th>Status</th><th /></tr></thead><tbody>{result.messages.map((m, index) => <tr key={m.id}><td>{(page - 1) * result.pageSize + index + 1}</td><td><div className="ad-customer"><span className="ad-avatar">{m.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}</span><div><strong>{m.name}</strong><small>{m.email}</small></div></div></td><td>{m.topic}</td><td><span className="ad-contact-preview">{m.message}</span></td><td className="ad-muted">{date(m.createdAt)}</td><td><span className={`ad-status ${m.status === 'NEW' ? 'warning' : m.status === 'RESOLVED' ? 'paid' : 'neutral'}`}>{labels[m.status]}</span></td><td><button className="ad-secondary" onClick={() => open(m)}>View</button></td></tr>)}</tbody></table>{!result.messages.length && <div className="ad-empty">{search || filter !== 'ALL' ? 'No messages match your filters.' : 'No messages yet. New contact form submissions will appear here.'}</div>}</div>}
    {loaded && loading && <div className="ad-contact-refreshing" role="status"><span className="ad-auth-spinner"/>Updating messages…</div>}<div className="ad-table-footer ad-contact-footer"><span>{result.total} message(s)</span><div className="ad-contact-pagination"><button className="ad-secondary" disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page} of {Math.max(1, Math.ceil(result.total / result.pageSize))}</span><button className="ad-secondary" disabled={page * result.pageSize >= result.total || loading} onClick={() => setPage(p => p + 1)}>Next</button></div></div>
    {selected && <div className="ad-modal-backdrop" onClick={() => setSelected(null)}><section className="ad-contact-detail" role="dialog" aria-modal="true" aria-labelledby="ad-contact-title" onClick={e => e.stopPropagation()}><header><div><span className="ad-muted ad-small">Contact message</span><h2 id="ad-contact-title">{selected.topic}</h2></div><button className="ad-icon-button" aria-label="Close message" onClick={() => setSelected(null)}>×</button></header><dl><div><dt>From</dt><dd>{selected.name}</dd></div><div><dt>Email</dt><dd><a href={`mailto:${selected.email}`}>{selected.email}</a></dd></div>{selected.phone && <div><dt>WhatsApp</dt><dd><a href={`https://wa.me/${selected.phone}`} target="_blank" rel="noreferrer">+{selected.phone}</a>{selected.whatsappStatus && <span className={`ad-status ${selected.whatsappStatus === 'SENT' ? 'paid' : selected.whatsappStatus === 'FAILED' ? 'failed' : 'neutral'}`} title={selected.whatsappError || undefined} style={{ marginLeft: 8 }}>{selected.whatsappStatus === 'SENT' ? 'Auto-reply sent' : selected.whatsappStatus === 'FAILED' ? 'Auto-reply failed' : 'Auto-reply pending'}</span>}{selected.whatsappError && <small className="ad-muted" style={{ display: 'block', marginTop: 4 }}>{selected.whatsappError}</small>}</dd></div>}<div><dt>Received</dt><dd>{date(selected.createdAt)} IST</dd></div></dl><div className="ad-contact-body">{selected.message}</div><footer><label>Status <select aria-label="Update message status" disabled={updating} value={selected.status} onChange={e => void update(selected, e.target.value)}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><a className="ad-primary" href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.topic}`)}`}>Reply by email ↗</a></footer>{updating && <p role="status" className="ad-muted ad-small">Saving status…</p>}{error && <p className="ad-auth-error" role="alert">{error}</p>}</section></div>}
  </>;
}
