'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TableSkeleton } from './AdminContentSkeleton';

// Keep in sync with adminPages on the server.
const pageOptions = [
    { key: 'dashboard', label: 'Home & Analytics', hint: 'Dashboard numbers and charts' },
    { key: 'orders', label: 'Orders', hint: 'View orders, delivery updates, invoices' },
    { key: 'billing', label: 'Offline Billing', hint: 'Create in-store bills' },
    { key: 'expenses', label: 'Expenses', hint: 'Add and edit expenses' },
    { key: 'reports', label: 'Reports', hint: 'Sales reports and exports' },
    { key: 'products', label: 'Products', hint: 'Products, categories, bulk upload' },
    { key: 'customers', label: 'Customers', hint: 'Customer accounts' },
    { key: 'contact', label: 'Contact Messages', hint: 'Messages and notifications' },
    { key: 'newsletter', label: 'Newsletter', hint: 'Subscriber list' },
    { key: 'hero', label: 'Home Hero', hint: 'Homepage banners' },
    { key: 'gallery', label: 'Gallery', hint: 'Gallery images' },
];
const pageLabel = Object.fromEntries(pageOptions.map(p => [p.key, p.label]));
const when = (value) => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }) : 'Never';
const emptyForm = () => ({ id: null, name: '', username: '', password: '', permissions: [], isActive: true });

export default function AdminStaff() {
    const router = useRouter();
    const [staff, setStaff] = useState([]);
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

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true); setError('');
        fetch('/api/admin/staff', { cache: 'no-store', signal: controller.signal })
            .then(async response => {
                if (response.status === 401) { router.replace('/admin/login'); return; }
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Could not load staff.');
                setStaff(data.staff);
            }).catch(e => { if (!controller.signal.aborted) setError(e.message); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [reload, router]);

    const toggle = (key) => setForm(f => ({ ...f, permissions: f.permissions.includes(key) ? f.permissions.filter(k => k !== key) : [...f.permissions, key] }));

    async function save(event) {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            const body = form.id
                ? { name: form.name, permissions: form.permissions, isActive: form.isActive, password: form.password }
                : { name: form.name, username: form.username, password: form.password, permissions: form.permissions };
            const response = await fetch(form.id ? `/api/admin/staff/${form.id}` : '/api/admin/staff', { method: form.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (response.status === 401) { router.replace('/admin/login'); return; }
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Could not save.');
            toast.success(form.id ? 'Staff member updated' : 'Staff member created', { description: form.id ? undefined : `They can sign in with username “${data.staff.username}”.` });
            setForm(null);
            setReload(r => r + 1);
        } catch (e) { toast.error(e.message); } finally { setSaving(false); }
    }
    async function remove() {
        if (!deleting || saving) return;
        setSaving(true);
        try {
            const response = await fetch(`/api/admin/staff/${deleting.id}`, { method: 'DELETE' });
            if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message || 'Could not delete.'); }
            toast.success('Staff member removed');
            setDeleting(null);
            setReload(r => r + 1);
        } catch (e) { toast.error(e.message); } finally { setSaving(false); }
    }

    return <div className="ad-staff">
      <div className="ad-page-actions">
        <div><h2 className="ad-staff-title">Staff accounts</h2><p className="ad-muted ad-small">Give staff their own login and choose exactly which pages they can open. Only you (the owner) can see this page.</p></div>
        <button type="button" className="ad-primary" onClick={() => setForm(emptyForm())}>+ Add staff</button>
      </div>
      {error && <p className="ad-auth-error" role="alert">{error} <button className="ad-inline-button" onClick={() => setReload(r => r + 1)}>Try again</button></p>}
      <section className="ad-order-page-card">
        {loading && !staff.length ? <TableSkeleton /> : <div className="ad-table-scroll"><table><thead><tr><th>S.No</th><th>Name</th><th>Username</th><th>Pages they can open</th><th>Status</th><th>Last sign-in</th><th>Actions</th></tr></thead><tbody>{staff.map((member, index) => <tr key={member.id}>
          <td className="ad-muted">{index + 1}</td>
          <td className="ad-medium">{member.name}</td>
          <td className="ad-muted">{member.username}</td>
          <td className="ad-staff-pages">{member.permissions.length ? member.permissions.map(key => <span key={key} className="ad-staff-chip">{pageLabel[key] || key}</span>) : <span className="ad-muted ad-small">No pages yet</span>}</td>
          <td><span className={`ad-status ${member.isActive ? 'paid' : 'failed'}`}><i />{member.isActive ? 'Active' : 'Disabled'}</span></td>
          <td className="ad-muted">{when(member.lastLoginAt)}</td>
          <td><div className="ad-action-group"><button type="button" className="ad-secondary" onClick={() => setForm({ ...member, password: '' })}>Edit</button><button type="button" className="ad-secondary ad-danger" onClick={() => setDeleting(member)}>Delete</button></div></td>
        </tr>)}</tbody></table>{!staff.length && !error && <div className="ad-empty">No staff yet. Use “Add staff” to create a login for someone on your team.</div>}</div>}
      </section>

      <dialog ref={formDialog} aria-labelledby="staff-form-title" onCancel={event => { if (saving) event.preventDefault(); else setForm(null); }} className="ad-cash-dialog ad-staff-dialog">
        {form && <form onSubmit={save}>
          <h2 id="staff-form-title">{form.id ? `Edit ${form.name}` : 'Add staff'}</h2>
          <div className="ad-expense-fields">
            <label>Full name<input required minLength={2} maxLength={120} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Karthik S" autoFocus/></label>
            <label>Username<input required={!form.id} disabled={!!form.id} pattern="[A-Za-z0-9._\-]{3,32}" title="3-32 letters, numbers, dot, dash or underscore" autoCapitalize="none" spellCheck={false} value={form.username} onChange={e => setForm({ ...form, username: e.target.value.toLowerCase() })} placeholder="e.g. karthik"/></label>
            <label className="ad-bill-wide">{form.id ? 'New password (leave empty to keep the current one)' : 'Password'}<input type="password" autoComplete="new-password" required={!form.id} minLength={8} maxLength={72} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters"/></label>
          </div>
          <fieldset className="ad-staff-perms">
            <legend>Pages this person can open <span className="ad-muted">({form.permissions.length} selected)</span></legend>
            <div className="ad-staff-perm-actions"><button type="button" className="ad-inline-button" onClick={() => setForm({ ...form, permissions: pageOptions.map(p => p.key) })}>Select all</button><button type="button" className="ad-inline-button" onClick={() => setForm({ ...form, permissions: [] })}>Clear</button></div>
            <div className="ad-staff-perm-grid">{pageOptions.map(option => <label key={option.key} className={form.permissions.includes(option.key) ? 'is-on' : ''}><input type="checkbox" checked={form.permissions.includes(option.key)} onChange={() => toggle(option.key)}/><span><strong>{option.label}</strong><small>{option.hint}</small></span></label>)}</div>
          </fieldset>
          {form.id && <label className="ad-bill-check ad-staff-active"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}/> Account active (untick to block sign-in immediately)</label>}
          <div className="ad-action-group"><button type="button" className="ad-secondary" disabled={saving} onClick={() => setForm(null)}>Cancel</button><button type="submit" className="ad-primary" disabled={saving}>{saving ? 'Saving…' : form.id ? 'Save changes' : 'Create login'}</button></div>
        </form>}
      </dialog>
      <dialog ref={deleteDialog} aria-labelledby="staff-delete-title" onCancel={event => { if (saving) event.preventDefault(); else setDeleting(null); }} className="ad-cash-dialog">
        <h2 id="staff-delete-title">Delete {deleting?.name}?</h2>
        <p className="ad-muted">Their login (<strong>{deleting?.username}</strong>) will stop working immediately. This cannot be undone. To block access temporarily, edit them and untick “Account active” instead.</p>
        <div className="ad-action-group"><button type="button" autoFocus disabled={saving} className="ad-secondary" onClick={() => setDeleting(null)}>Cancel</button><button type="button" disabled={saving} className="ad-primary ad-danger" onClick={remove}>{saving ? 'Deleting…' : 'Delete'}</button></div>
      </dialog>
    </div>;
}
