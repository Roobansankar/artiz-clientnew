'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TableSkeleton } from './AdminContentSkeleton';

const categories = ['Rent', 'Salaries', 'Utilities', 'Stock purchase', 'Transport & delivery', 'Marketing', 'Maintenance & repairs', 'Packaging', 'Taxes & fees', 'Other'];
const methods = [{ value: 'CASH', label: 'Cash' }, { value: 'UPI', label: 'UPI' }, { value: 'CARD', label: 'Card' }, { value: 'BANK', label: 'Bank transfer' }];
const methodLabel = Object.fromEntries(methods.map(m => [m.value, m.label]));
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);
const istToday = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
const shift = (iso, days) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
const monthStart = (iso) => `${iso.slice(0, 7)}-01`;
const lastMonth = () => { const first = monthStart(istToday()); const end = shift(first, -1); return { from: monthStart(end), to: end }; };
const showDay = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const csvCell = (value) => { const text = String(value ?? ''); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
const emptyForm = () => ({ id: null, date: istToday(), category: 'Rent', description: '', amount: '', paymentMethod: 'CASH', notes: '' });
const presets = [
    { key: 'month', label: 'This month', range: () => ({ from: monthStart(istToday()), to: istToday() }) },
    { key: 'last', label: 'Last month', range: lastMonth },
    { key: '30', label: '30 days', range: () => ({ from: shift(istToday(), -29), to: istToday() }) },
    { key: 'all', label: 'All', range: () => ({ from: '', to: '' }) },
];

export default function AdminExpenses() {
    const router = useRouter();
    const [range, setRange] = useState(presets[0].range);
    const [preset, setPreset] = useState('month');
    const [category, setCategory] = useState('ALL');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({ expenses: [], total: 0, page: 1, pageSize: 20, summary: { amount: 0, byCategory: [] } });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const formDialog = useRef(null);
    const deleteDialog = useRef(null);
    useEffect(() => { if (form) formDialog.current?.showModal(); else formDialog.current?.close(); }, [form]);
    useEffect(() => { if (deleting) deleteDialog.current?.showModal(); else deleteDialog.current?.close(); }, [deleting]);

    const params = useCallback((extra = {}) => new URLSearchParams({ ...(range.from ? { from: range.from } : {}), ...(range.to ? { to: range.to } : {}), category, search, ...extra }), [range, category, search]);

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true); setError('');
            try {
                const response = await fetch(`/api/admin/expenses?${params({ page: String(page) })}`, { cache: 'no-store', signal: controller.signal });
                if (response.status === 401) { router.replace('/admin/login'); return; }
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Could not load expenses.');
                setResult(data);
            } catch (e) { if (!controller.signal.aborted) setError(e.message); } finally { if (!controller.signal.aborted) setLoading(false); }
        }, 250);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [params, page, reload, router]);

    async function save(event) {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            const body = JSON.stringify({ date: form.date, category: form.category, description: form.description, amount: Number(form.amount), paymentMethod: form.paymentMethod, notes: form.notes });
            const response = await fetch(form.id ? `/api/admin/expenses/${form.id}` : '/api/admin/expenses', { method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body });
            if (response.status === 401) { router.replace('/admin/login'); return; }
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Could not save the expense.');
            toast.success(form.id ? 'Expense updated' : 'Expense added', { description: `${data.expense.description} · ${money(data.expense.amount)}` });
            setForm(null);
            setReload(value => value + 1);
        } catch (e) { toast.error(e.message); } finally { setSaving(false); }
    }
    async function remove() {
        if (!deleting || saving) return;
        setSaving(true);
        try {
            const response = await fetch(`/api/admin/expenses/${deleting.id}`, { method: 'DELETE' });
            if (response.status === 401) { router.replace('/admin/login'); return; }
            if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message || 'Could not delete the expense.'); }
            toast.success('Expense deleted');
            setDeleting(null);
            if (result.expenses.length === 1 && page > 1) setPage(value => value - 1); else setReload(value => value + 1);
        } catch (e) { toast.error(e.message); } finally { setSaving(false); }
    }
    async function exportCsv() {
        try {
            const response = await fetch(`/api/admin/expenses?${params({ page: '1', pageSize: '10000' })}`, { cache: 'no-store' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Could not export.');
            const rows = data.expenses.map(e => [e.date, e.category, e.description, methodLabel[e.paymentMethod] || e.paymentMethod, e.amount, e.notes]);
            const csv = [['Date', 'Category', 'Description', 'Paid by', 'Amount (INR)', 'Notes'], ...rows].map(row => row.map(csvCell).join(',')).join('\n');
            const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = url; link.download = `artiz-expenses-${range.from || 'all'}-to-${range.to || istToday()}.csv`; link.click();
            URL.revokeObjectURL(url);
            toast.success(`${rows.length} expense${rows.length === 1 ? '' : 's'} exported.`);
        } catch (e) { toast.error(e.message); }
    }

    const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
    const topCategory = result.summary.byCategory[0];
    const maxCategory = Math.max(1, ...result.summary.byCategory.map(row => row.amount));
    return <div className="ad-expenses">
      <div className="ad-report-filters">
        <div className="ad-report-dates">
          <label>From<input type="date" value={range.from} max={range.to || istToday()} onChange={e => { setPreset(''); setPage(1); setRange(r => ({ ...r, from: e.target.value })); }}/></label>
          <label>To<input type="date" value={range.to} min={range.from} onChange={e => { setPreset(''); setPage(1); setRange(r => ({ ...r, to: e.target.value })); }}/></label>
          <div className="ad-mode-options" aria-label="Quick ranges">{presets.map(p => <button type="button" key={p.key} className={preset === p.key ? 'selected' : ''} aria-pressed={preset === p.key} onClick={() => { setPreset(p.key); setPage(1); setRange(p.range()); }}>{p.label}</button>)}</div>
        </div>
        <div className="ad-action-group">
          <button type="button" className="ad-secondary" onClick={exportCsv} disabled={!result.total}>Export CSV</button>
          <button type="button" className="ad-primary" onClick={() => setForm(emptyForm())}>+ Add expense</button>
        </div>
      </div>

      <div className="ad-expense-overview">
        <section className="ad-dash-card ad-expense-total">
          <span className="ad-muted ad-small">Total spent{preset === 'all' ? ' (all time)' : ''}</span>
          <strong>{money(result.summary.amount)}</strong>
          <span className="ad-small">{result.total} expense{result.total === 1 ? '' : 's'}{topCategory ? ` · most on ${topCategory.category}` : ''}</span>
        </section>
        <section className="ad-dash-card ad-expense-categories" aria-label="Spending by category">
          {result.summary.byCategory.length ? <ul>{result.summary.byCategory.map(row => <li key={row.category}>
            <button type="button" className={category === row.category ? 'is-active' : ''} onClick={() => { setPage(1); setCategory(category === row.category ? 'ALL' : row.category); }}>
              <span className="ad-expense-cat-name">{row.category}<small>{row.count}</small></span>
              <span className="ad-expense-cat-bar"><span style={{ width: `${(row.amount / maxCategory) * 100}%` }}/></span>
              <strong>{money(row.amount)}</strong>
            </button>
          </li>)}</ul> : <p className="ad-muted ad-small">No expenses in this period.</p>}
        </section>
      </div>

      <section className="ad-order-page-card">
        <div className="ad-page-actions">
          <label className="ad-search"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input aria-label="Search expenses" placeholder="Search description or notes..." value={search} onChange={e => { setPage(1); setSearch(e.target.value); }}/></label>
          <select aria-label="Filter by category" value={category} onChange={e => { setPage(1); setCategory(e.target.value); }}><option value="ALL">All categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
        </div>
        {error && <p className="ad-auth-error" role="alert">{error} <button className="ad-inline-button" onClick={() => setReload(r => r + 1)}>Try again</button></p>}
        {loading && !result.expenses.length ? <TableSkeleton /> : <div className="ad-table-scroll"><table><thead><tr><th>S.No</th><th>Date</th><th>Category</th><th>Description</th><th>Paid by</th><th className="ad-align-right">Amount</th><th>Actions</th></tr></thead><tbody>{result.expenses.map((expense, index) => <tr key={expense.id}>
          <td className="ad-muted">{(result.page - 1) * result.pageSize + index + 1}</td>
          <td className="ad-muted">{showDay(expense.date)}</td>
          <td><span className="ad-status neutral">{expense.category}</span></td>
          <td className="ad-expense-desc">{expense.description}{expense.notes && <p className="ad-muted ad-small">{expense.notes}</p>}</td>
          <td className="ad-muted">{methodLabel[expense.paymentMethod] || expense.paymentMethod}</td>
          <td className="ad-align-right ad-medium">{money(expense.amount)}</td>
          <td><div className="ad-action-group"><button type="button" className="ad-secondary" onClick={() => setForm({ ...expense, amount: String(expense.amount) })}>Edit</button><button type="button" className="ad-secondary ad-danger" onClick={() => setDeleting(expense)}>Delete</button></div></td>
        </tr>)}</tbody></table>{!result.expenses.length && !error && <div className="ad-empty">{search || category !== 'ALL' ? 'No expenses match your filters.' : 'No expenses yet. Add your first one with “Add expense”.'}</div>}</div>}
        <div className="ad-table-footer"><span>{result.total} expense{result.total === 1 ? '' : 's'} · Page {page} of {pages}</span><span className="ad-pagination"><button disabled={page <= 1} aria-label="Previous page" onClick={() => setPage(p => p - 1)}>‹</button><button className="active" aria-current="page">{page}</button><button disabled={page >= pages} aria-label="Next page" onClick={() => setPage(p => p + 1)}>›</button></span></div>
      </section>

      <dialog ref={formDialog} aria-labelledby="expense-form-title" onCancel={event => { if (saving) event.preventDefault(); else setForm(null); }} className="ad-cash-dialog ad-expense-dialog">
        {form && <form onSubmit={save}>
          <h2 id="expense-form-title">{form.id ? 'Edit expense' : 'Add expense'}</h2>
          <div className="ad-expense-fields">
            <label>Date<input type="date" required value={form.date} max={istToday()} onChange={e => setForm({ ...form, date: e.target.value })}/></label>
            <label>Amount (₹)<input type="number" required min="0.01" step="0.01" inputMode="decimal" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" autoFocus/></label>
            <label>Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Paid by<select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>{methods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select></label>
            <label className="ad-bill-wide">Description<input required minLength={2} maxLength={200} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Shop rent for November"/></label>
            <label className="ad-bill-wide">Notes (optional)<textarea rows={2} maxLength={1000} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}/></label>
          </div>
          <div className="ad-action-group"><button type="button" className="ad-secondary" disabled={saving} onClick={() => setForm(null)}>Cancel</button><button type="submit" className="ad-primary" disabled={saving}>{saving ? 'Saving…' : form.id ? 'Save changes' : 'Add expense'}</button></div>
        </form>}
      </dialog>
      <dialog ref={deleteDialog} aria-labelledby="expense-delete-title" onCancel={event => { if (saving) event.preventDefault(); else setDeleting(null); }} className="ad-cash-dialog">
        <h2 id="expense-delete-title">Delete expense?</h2>
        <p className="ad-muted">Delete <strong>{deleting?.description}</strong> ({money(deleting?.amount)}) from {deleting ? showDay(deleting.date) : ''}? This cannot be undone.</p>
        <div className="ad-action-group"><button type="button" autoFocus disabled={saving} className="ad-secondary" onClick={() => setDeleting(null)}>Cancel</button><button type="button" disabled={saving} className="ad-primary ad-danger" onClick={remove}>{saving ? 'Deleting…' : 'Delete'}</button></div>
      </dialog>
    </div>;
}
