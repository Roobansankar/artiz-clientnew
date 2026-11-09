'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TableSkeleton } from './AdminContentSkeleton';
const methodLabels = { email: 'Email & password', google: 'Google' };
const date = (value) => new Date(value).toLocaleDateString('en-IN', { dateStyle: 'medium', timeZone: 'Asia/Kolkata' });
const initials = (name) => name.split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase();
export default function AdminCustomers() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ customers: [], total: 0, page: 1, pageSize: 20 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    const load = useCallback(async (signal) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/admin/customers?${new URLSearchParams({ search, page: String(page) })}`, { cache: 'no-store', signal });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Could not load customers.');
            setResult(data);
        }
        catch (e) {
            if (!signal.aborted)
                setError(e instanceof Error ? e.message : 'Could not load customers.');
        }
        finally {
            if (!signal.aborted)
                setLoading(false);
        }
    }, [search, page, router]);
    useEffect(() => { const controller = new AbortController(); const timer = setTimeout(() => load(controller.signal), 250); return () => { clearTimeout(timer); controller.abort(); }; }, [load, reload]);
    const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
    return <>
    <div className="ad-page-actions"><label className="ad-search"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input aria-label="Search customers" placeholder="Filter by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/></label><span className="ad-muted ad-small">{result.total} customer{result.total === 1 ? '' : 's'}</span></div>
    {error && <p className="ad-auth-error" role="alert">{error} <button className="ad-inline-button" onClick={() => setReload(r => r + 1)}>Try again</button></p>}
    {loading && !result.customers.length ? <TableSkeleton /> : <div className="ad-table-scroll"><table className="ad-customer-table"><thead><tr><th>Name</th><th>Email</th><th>Login method</th><th>Joined</th></tr></thead><tbody>{result.customers.map((c, i) => <tr key={c.id}><td><div className="ad-customer"><span className={`ad-avatar ad-avatar-${i % 4}`}>{initials(c.name)}</span><div><strong>{c.name}</strong></div></div></td><td className="ad-muted">{c.email}</td><td className="ad-muted">{c.loginMethods.map(method => methodLabels[method]).join(' + ') || '—'}</td><td className="ad-muted">{date(c.createdAt)}</td></tr>)}</tbody></table>{!result.customers.length && !error && <div className="ad-empty">No customers found.</div>}</div>}
    <div className="ad-table-footer"><span>Page {page} of {pages}</span><span className="ad-pagination"><button disabled={page <= 1} aria-label="Previous page" onClick={() => setPage(p => p - 1)}>‹</button><button className="active" aria-current="page">{page}</button><button disabled={page >= pages} aria-label="Next page" onClick={() => setPage(p => p + 1)}>›</button></span></div>
  </>;
}
