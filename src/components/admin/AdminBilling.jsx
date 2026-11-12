'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TableSkeleton } from './AdminContentSkeleton';

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);
const when = (value) => new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
const variantLabel = (v) => ['seater', 'size', 'color', 'fabric'].map(key => v?.[key]).filter(Boolean).join(' · ');
const methods = [{ value: 'CASH', label: 'Cash' }, { value: 'UPI', label: 'UPI' }, { value: 'CARD', label: 'Card' }];
const methodLabel = { CASH: 'Cash', UPI: 'UPI', CARD: 'Card' };
const emptyCustomer = { name: '', phone: '', address: '' };
const lastWhatsapp = (bill) => bill.whatsappLog?.at(-1);

function optionsOf(product) {
    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (!variants.length) return [{ index: null, label: '', price: Number(product.amount) || 0, stock: Number(product.stock) || 0 }];
    return variants.map((v, index) => ({ index, label: variantLabel(v) || `Option ${index + 1}`, price: Number(v.price) || 0, stock: Number(v.stock) || 0 }));
}

function ProductRow({ product, onAdd }) {
    const options = optionsOf(product);
    const [choice, setChoice] = useState(() => String(Math.max(0, options.findIndex(o => o.stock > 0))));
    const option = options[Number(choice)] || options[0];
    return <li className="ad-bill-product">
      <img src={product.image || '/images/product-placeholder.svg'} alt="" width={48} height={48}/>
      <div className="ad-bill-product-info">
        <strong>{product.name}</strong>
        {options.length > 1 && <select aria-label={`Option for ${product.name}`} value={choice} onChange={e => setChoice(e.target.value)}>{options.map((o, i) => <option key={i} value={i}>{o.label} — {money(o.price)} ({o.stock} left)</option>)}</select>}
        <small className={option.stock > 0 ? 'ad-muted' : 'ad-bill-out'}>{money(option.price)} · {option.stock > 0 ? `${option.stock} in stock` : 'Out of stock'}</small>
      </div>
      <button type="button" className="ad-secondary" disabled={option.stock <= 0} onClick={() => onAdd(product, option)}>Add</button>
    </li>;
}

export default function AdminBilling() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productError, setProductError] = useState('');
    const [query, setQuery] = useState('');
    const [lines, setLines] = useState([]);
    const [customer, setCustomer] = useState(emptyCustomer);
    const [discount, setDiscount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [sendWhatsapp, setSendWhatsapp] = useState(true);
    const [saving, setSaving] = useState(false);
    const [created, setCreated] = useState(null);
    const [bills, setBills] = useState({ bills: [], total: 0, page: 1, pageSize: 20 });
    const [billSearch, setBillSearch] = useState('');
    const [billsLoading, setBillsLoading] = useState(true);
    const [reloadBills, setReloadBills] = useState(0);
    const [busyId, setBusyId] = useState('');
    const nameRef = useRef(null);

    const unauthorized = useCallback(() => router.replace('/admin/login'), [router]);

    const loadProducts = useCallback(async () => {
        setProductsLoading(true); setProductError('');
        try {
            const response = await fetch('/api/admin/products', { cache: 'no-store' });
            if (response.status === 401) { unauthorized(); return; }
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Could not load products.');
            setProducts(data.products || []);
        } catch (e) { setProductError(e.message); } finally { setProductsLoading(false); }
    }, [unauthorized]);
    useEffect(() => { loadProducts(); }, [loadProducts]);

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setBillsLoading(true);
            try {
                const response = await fetch(`/api/admin/offline-bills?${new URLSearchParams({ search: billSearch })}`, { cache: 'no-store', signal: controller.signal });
                if (response.status === 401) { unauthorized(); return; }
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Could not load bills.');
                setBills(data);
            } catch (e) { if (!controller.signal.aborted) toast.error(e.message); } finally { if (!controller.signal.aborted) setBillsLoading(false); }
        }, 250);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [billSearch, reloadBills, unauthorized]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return products.filter(p => !q || p.name.toLowerCase().includes(q) || String(p.slug || '').includes(q)).slice(0, 60);
    }, [products, query]);

    function addLine(product, option) {
        setCreated(null);
        setLines(current => {
            const key = `${product.id}:${option.index ?? ''}`;
            const existing = current.find(line => line.key === key);
            if (existing) {
                if (existing.quantity >= option.stock) { toast.error(`Only ${option.stock} in stock.`); return current; }
                return current.map(line => line.key === key ? { ...line, quantity: line.quantity + 1 } : line);
            }
            return [...current, { key, productId: product.id, variantIndex: option.index, name: product.name, label: option.label, image: product.image, stock: option.stock, quantity: 1, unitPrice: String(option.price) }];
        });
    }
    const updateLine = (key, patch) => setLines(current => current.map(line => line.key === key ? { ...line, ...patch } : line));
    const removeLine = (key) => setLines(current => current.filter(line => line.key !== key));

    const subtotal = lines.reduce((sum, line) => sum + (Number(line.unitPrice) || 0) * line.quantity, 0);
    const discountValue = Math.max(0, Number(discount) || 0);
    const total = Math.max(0, subtotal - discountValue);
    const canSubmit = lines.length > 0 && customer.name.trim().length >= 2 && customer.phone.replace(/\D/g, '').length >= 10 && total > 0 && !saving;

    async function createBill(event) {
        event.preventDefault();
        if (!canSubmit) return;
        setSaving(true);
        try {
            const response = await fetch('/api/admin/offline-bills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customer, discount: discountValue, paymentMethod, sendWhatsapp, items: lines.map(line => ({ productId: line.productId, variantIndex: line.variantIndex, quantity: line.quantity, unitPrice: Number(line.unitPrice) || 0 })) }),
            });
            if (response.status === 401) { unauthorized(); return; }
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Could not create the bill.');
            setCreated(data);
            setLines([]); setCustomer(emptyCustomer); setDiscount(''); setPaymentMethod('CASH');
            setReloadBills(value => value + 1);
            loadProducts();
            if (!sendWhatsapp) toast.success(`Bill ${data.bill.number} created`);
            else if (data.whatsapp?.status === 'SENT') toast.success(`Bill ${data.bill.number} created`, { description: 'Invoice sent to the customer on WhatsApp.' });
            else toast.warning(`Bill ${data.bill.number} created`, { description: `Invoice not sent on WhatsApp: ${data.whatsapp?.error || 'unknown error'}` });
        } catch (e) { toast.error(e.message); } finally { setSaving(false); }
    }

    async function downloadInvoice(bill) {
        setBusyId(bill.id);
        try {
            const response = await fetch(`/api/admin/orders/${bill.id}/invoice`, { cache: 'no-store' });
            if (response.status === 401) { unauthorized(); return; }
            if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message || 'Could not create the invoice.'); }
            const url = URL.createObjectURL(await response.blob());
            const link = document.createElement('a');
            link.href = url; link.download = `Artiz-Invoice-${bill.number}.pdf`; link.click();
            URL.revokeObjectURL(url);
        } catch (e) { toast.error(e.message); } finally { setBusyId(''); }
    }
    async function resend(bill) {
        setBusyId(bill.id);
        try {
            const response = await fetch(`/api/admin/orders/${bill.id}/notify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'INVOICE' }) });
            if (response.status === 401) { unauthorized(); return; }
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Could not send the invoice.');
            if (data.whatsapp?.status === 'SENT') toast.success('Invoice sent on WhatsApp'); else toast.warning('Invoice not sent', { description: data.whatsapp?.error });
            setReloadBills(value => value + 1);
            if (created?.bill.id === bill.id) setCreated(current => ({ ...current, bill: { ...current.bill, whatsappLog: data.order.whatsappLog }, whatsapp: data.whatsapp }));
        } catch (e) { toast.error(e.message); } finally { setBusyId(''); }
    }

    const pages = Math.max(1, Math.ceil(bills.total / bills.pageSize));
    return <div className="ad-billing">
      <div className="ad-bill-grid">
        <section className="ad-bill-panel" aria-labelledby="bill-products-title">
          <header className="ad-bill-panel-head"><h2 id="bill-products-title">Products</h2><span className="ad-muted ad-small">{products.length} in catalogue</span></header>
          <label className="ad-search ad-bill-search"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input aria-label="Search products" placeholder="Search products by name..." value={query} onChange={e => setQuery(e.target.value)}/></label>
          {productError && <p className="ad-auth-error" role="alert">{productError} <button className="ad-inline-button" onClick={loadProducts}>Try again</button></p>}
          {productsLoading && !products.length ? <TableSkeleton /> : <ul className="ad-bill-products">{filtered.map(product => <ProductRow key={product.id} product={product} onAdd={addLine}/>)}{!filtered.length && <li className="ad-empty">No products match your search.</li>}</ul>}
        </section>

        <form className="ad-bill-panel ad-bill-form" onSubmit={createBill} aria-labelledby="bill-title">
          <header className="ad-bill-panel-head"><h2 id="bill-title">New bill</h2>{lines.length > 0 && <button type="button" className="ad-inline-button" onClick={() => setLines([])}>Clear items</button>}</header>
          <fieldset className="ad-bill-customer">
            <legend>Customer</legend>
            <label>Name<input ref={nameRef} required minLength={2} maxLength={120} value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} placeholder="Customer name"/></label>
            <label>Mobile number<input required type="tel" inputMode="tel" maxLength={20} value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} placeholder="98765 43210"/></label>
            <label className="ad-bill-wide">Address<textarea rows={2} maxLength={500} value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} placeholder="Street, town, PIN code"/></label>
          </fieldset>

          <div className="ad-bill-lines">
            {lines.length ? <table><thead><tr><th>Item</th><th>Qty</th><th>Price (₹)</th><th className="ad-align-right">Amount</th><th aria-label="Remove"/></tr></thead><tbody>{lines.map(line => <tr key={line.key}>
              <td><strong>{line.name}</strong>{line.label && <small className="ad-muted">{line.label}</small>}</td>
              <td><div className="ad-bill-qty"><button type="button" aria-label="Decrease quantity" disabled={line.quantity <= 1} onClick={() => updateLine(line.key, { quantity: line.quantity - 1 })}>−</button><span>{line.quantity}</span><button type="button" aria-label="Increase quantity" disabled={line.quantity >= line.stock} onClick={() => updateLine(line.key, { quantity: line.quantity + 1 })}>+</button></div></td>
              <td><input className="ad-bill-price" type="number" min="0" step="0.01" inputMode="decimal" aria-label={`Price for ${line.name}`} value={line.unitPrice} onChange={e => updateLine(line.key, { unitPrice: e.target.value })}/></td>
              <td className="ad-align-right">{money((Number(line.unitPrice) || 0) * line.quantity)}</td>
              <td><button type="button" className="ad-icon-button" aria-label={`Remove ${line.name}`} onClick={() => removeLine(line.key)}>×</button></td>
            </tr>)}</tbody></table> : <p className="ad-empty">Add products from the list to start a bill.</p>}
          </div>

          <div className="ad-bill-footer">
            <div className="ad-bill-options">
              <div><span className="ad-bill-label">Payment</span><div className="ad-mode-options" role="radiogroup" aria-label="Payment method">{methods.map(m => <button type="button" key={m.value} role="radio" aria-checked={paymentMethod === m.value} className={paymentMethod === m.value ? 'selected' : ''} onClick={() => setPaymentMethod(m.value)}>{m.label}</button>)}</div></div>
              <label className="ad-bill-discount"><span className="ad-bill-label">Discount (₹)</span><input type="number" min="0" step="0.01" inputMode="decimal" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0"/></label>
              <label className="ad-bill-check"><input type="checkbox" checked={sendWhatsapp} onChange={e => setSendWhatsapp(e.target.checked)}/> Send invoice to customer on WhatsApp</label>
            </div>
            <dl className="ad-bill-totals"><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>{discountValue > 0 && <div><dt>Discount</dt><dd>− {money(discountValue)}</dd></div>}<div className="ad-bill-grand"><dt>Total</dt><dd>{money(total)}</dd></div></dl>
            <button type="submit" className="ad-primary ad-bill-submit" disabled={!canSubmit}>{saving ? 'Creating bill…' : sendWhatsapp ? 'Create bill & send invoice' : 'Create bill'}</button>
          </div>

          {created && <div className="ad-bill-created" role="status">
            <div><strong>Bill {created.bill.number} created · {money(created.bill.amount)}</strong><small className="ad-muted">{created.whatsapp ? (created.whatsapp.status === 'SENT' ? `Invoice sent on WhatsApp to ${created.bill.phone}` : `WhatsApp not sent: ${created.whatsapp.error}`) : 'WhatsApp not requested'}</small></div>
            <div className="ad-action-group"><button type="button" className="ad-secondary" disabled={busyId === created.bill.id} onClick={() => downloadInvoice(created.bill)}>Download invoice</button>{created.whatsapp?.status !== 'SENT' && <button type="button" className="ad-secondary" disabled={busyId === created.bill.id} onClick={() => resend(created.bill)}>Send on WhatsApp</button>}<button type="button" className="ad-secondary" onClick={() => { setCreated(null); nameRef.current?.focus(); }}>New bill</button></div>
          </div>}
        </form>
      </div>

      <section className="ad-order-page-card" aria-labelledby="recent-bills-title">
        <div className="ad-page-actions"><h2 id="recent-bills-title">Recent bills</h2><label className="ad-search"><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input aria-label="Search bills" placeholder="Bill no., name or mobile..." value={billSearch} onChange={e => setBillSearch(e.target.value)}/></label></div>
        {billsLoading && !bills.bills.length ? <TableSkeleton /> : <div className="ad-table-scroll"><table><thead><tr><th>Bill</th><th>Date</th><th>Customer</th><th>Payment</th><th>WhatsApp</th><th className="ad-align-right">Amount</th><th>Actions</th></tr></thead><tbody>{bills.bills.map(bill => { const wa = lastWhatsapp(bill); return <tr key={bill.id}>
          <td className="ad-medium">{bill.number}</td>
          <td className="ad-muted">{when(bill.createdAt)}</td>
          <td>{bill.name}<p className="ad-muted ad-small">{bill.phone}</p></td>
          <td className="ad-muted">{methodLabel[bill.paymentMethod] || bill.paymentMethod}</td>
          <td>{wa ? <span className={`ad-status ${wa.status === 'SENT' ? 'paid' : wa.status === 'FAILED' ? 'failed' : 'neutral'}`} title={wa.error || undefined}>{wa.status === 'SENT' ? 'Sent' : wa.status === 'FAILED' ? 'Failed' : 'Skipped'}</span> : <span className="ad-muted ad-small">Not sent</span>}</td>
          <td className="ad-align-right ad-medium">{money(bill.amount)}</td>
          <td><div className="ad-action-group"><button type="button" className="ad-secondary" disabled={busyId === bill.id} onClick={() => downloadInvoice(bill)}>Invoice</button><button type="button" className="ad-secondary" disabled={busyId === bill.id} onClick={() => resend(bill)}>{wa?.status === 'SENT' ? 'Resend' : 'Send'}</button></div></td>
        </tr>; })}</tbody></table>{!bills.bills.length && <div className="ad-empty">{billSearch ? 'No bills match your search.' : 'No offline bills yet.'}</div>}</div>}
        {bills.total > bills.pageSize && <div className="ad-table-footer"><span>{bills.total} bills · showing latest {bills.pageSize}</span><span className="ad-muted ad-small">Page 1 of {pages} · use search to find older bills</span></div>}
      </section>
    </div>;
}
