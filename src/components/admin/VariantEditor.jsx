'use client';
import { useState } from 'react';
import { attributeLabels, variantAttributes } from '@/lib/variants';
export const maxVariants = 60;
const presets = {
    seater: ['2-Seater', '3-Seater', '4-Seater', '5-Seater'],
    size: ['Single', 'Double', 'Queen', 'King'],
    color: [],
    fabric: ['Velvet', 'Linen', 'Cotton', 'Leatherette'],
};
const placeholders = { seater: 'e.g. 6 or 7-Seater', size: 'e.g. Super King or 72 x 78 in', color: '#C9A57A', fabric: 'e.g. Boucle' };
const none = () => ({ seater: [], size: [], color: [], fabric: [] });
const emptyValues = { seater: '', size: '', color: '', fabric: '' };
export const isHex = (value) => /^#[0-9a-f]{6}$/i.test(value.trim());
// Accepts "a1b2c3" or "#A1B2C3" and stores the standard "#A1B2C3" form.
export const normaliseHex = (value) => `#${value.trim().replace(/^#/, '')}`.toUpperCase();
const isMoney = (value) => /^\d+(\.\d{1,2})?$/.test(value.trim()) && Number(value) > 0 && Number(value) <= 9999999999.99;
const keyOf = (row) => variantAttributes.map(key => row[key].toLowerCase()).join('\u0000');
const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();
const activeKeys = (setup) => variantAttributes.filter(key => setup.enabled[key] && setup.values[key].length);
export function blankSetup() {
    return { enabled: { seater: false, size: false, color: false, fabric: false }, values: none(), basePrice: '', baseMrp: '', rows: [{ ...emptyValues, price: '', mrp: '', stock: '0' }] };
}
// Rebuilds the editor from saved variants; the cheapest price becomes the base price.
export function setupFrom(variants, basePrice, baseMrp) {
    const values = none();
    for (const key of variantAttributes)
        values[key] = [...new Set(variants.map(v => v[key]).filter((v) => !!v))];
    const enabled = Object.fromEntries(variantAttributes.map(key => [key, values[key].length > 0]));
    const rows = variants.map(v => ({ seater: v.seater ?? '', size: v.size ?? '', color: v.color ?? '', fabric: v.fabric ?? '', price: String(v.price), mrp: v.mrp == null ? '' : String(v.mrp), stock: String(v.stock) }));
    return { enabled, values, basePrice: basePrice == null ? '' : String(basePrice), baseMrp: baseMrp == null ? '' : String(baseMrp), rows: rows.length ? rows : blankSetup().rows };
}
export function variantProblems(row) {
    const problems = {};
    if (!isMoney(row.price))
        problems.price = 'Enter a selling price above 0, with up to 2 decimals.';
    if (row.mrp.trim() && !isMoney(row.mrp))
        problems.mrp = 'Enter a valid MRP, or leave it empty.';
    else if (row.mrp.trim() && isMoney(row.price) && Number(row.mrp) < Number(row.price))
        problems.mrp = 'MRP must be at least the selling price.';
    if (!/^\d+$/.test(row.stock.trim()) || Number(row.stock) > 1000000)
        problems.stock = 'Enter a whole number from 0.';
    return problems;
}
// Problems with the option setup itself (an option switched on without any values).
export const setupProblems = (setup) => variantAttributes.filter(key => setup.enabled[key] && !setup.values[key].length).map(key => `${key === 'color' ? 'Add at least one colour' : `Choose a ${attributeLabels[key].toLowerCase()}`} or switch ${attributeLabels[key]} off.`);
export const hasVariantProblems = (setup) => setupProblems(setup).length > 0 || setup.rows.some(row => Object.keys(variantProblems(row)).length > 0);
export const toPayload = (setup) => setup.rows.map(row => ({
    seater: row.seater || null, size: row.size || null, color: row.color ? normaliseHex(row.color) : null, fabric: row.fabric || null,
    price: Number(row.price), mrp: row.mrp.trim() ? Number(row.mrp) : null, stock: Number(row.stock),
}));
function dedupe(rows) {
    const seen = new Set();
    return rows.filter(row => { const key = keyOf(row); if (seen.has(key))
        return false; seen.add(key); return true; });
}
// Every combination of the given options' values.
function combinations(setup, keys) {
    return keys.reduce((combos, key) => combos.flatMap(combo => setup.values[key].map(value => ({ ...combo, [key]: value }))), [{ ...emptyValues }]);
}
const newRow = (setup, values) => ({ ...values, price: setup.basePrice, mrp: setup.baseMrp, stock: '0' });
export function missingCombinations(setup) {
    const existing = new Set(setup.rows.map(keyOf));
    return combinations(setup, activeKeys(setup)).filter(combo => !existing.has(keyOf(combo)));
}
function addValue(setup, key, value) {
    if (setup.values[key].some(existing => same(existing, value)))
        return `${value} is already added.`;
    const values = { ...setup.values, [key]: [...setup.values[key], value] };
    // The first value of an option applies to every existing variant.
    if (!setup.values[key].length)
        return { ...setup, values, rows: setup.rows.map(row => ({ ...row, [key]: value })) };
    // Further values add one variant for each combination with the other options.
    const others = activeKeys(setup).filter(other => other !== key);
    const added = combinations(setup, others).map(combo => newRow(setup, { ...combo, [key]: value }));
    if (setup.rows.length + added.length > maxVariants)
        return `That would make ${setup.rows.length + added.length} variants. The limit is ${maxVariants}.`;
    return { ...setup, values, rows: [...setup.rows, ...added] };
}
// Every value becomes part of the variant combinations (cartesian product).
const isSingleValue = () => false;
function setSingle(setup, key, value) {
    return { ...setup, values: { ...setup.values, [key]: [value] }, rows: dedupe(setup.rows.map(row => ({ ...row, [key]: value }))) };
}
function removeValue(setup, key, value) {
    const values = { ...setup.values, [key]: setup.values[key].filter(existing => existing !== value) };
    let rows = values[key].length ? setup.rows.filter(row => row[key] !== value) : dedupe(setup.rows.map(row => ({ ...row, [key]: '' })));
    if (!rows.length) {
        const first = Object.fromEntries(variantAttributes.map(k => [k, values[k][0] ?? '']));
        rows = [newRow(setup, first)];
    }
    return { ...setup, values, rows };
}
function setEnabled(setup, key, on) {
    if (on)
        return { ...setup, enabled: { ...setup.enabled, [key]: true } };
    const cleared = setup.values[key].reduce((current, value) => removeValue(current, key, value), setup);
    return { ...cleared, enabled: { ...cleared.enabled, [key]: false } };
}
function OptionCard({ setup, attribute, onChange }) {
    const [draft, setDraft] = useState(attribute === 'color' ? '#C9A57A' : '');
    const [message, setMessage] = useState('');
    const label = attributeLabels[attribute];
    const single = isSingleValue(attribute);
    const selected = setup.values[attribute];
    const custom = selected.filter(value => !presets[attribute].some(preset => same(preset, value)));
    function add(raw) {
        let value = raw.trim().replace(/\s+/g, ' ');
        if (!value)
            return;
        if (attribute === 'color') {
            if (!isHex(normaliseHex(value))) {
                setMessage('Use six characters, like #C9A57A.');
                return;
            }
            value = normaliseHex(value);
        }
        else if (attribute === 'seater' && /^\d+$/.test(value))
            value = `${value}-Seater`;
        if (value.length > 60) {
            setMessage('Keep it under 60 characters.');
            return;
        }
        if (single) {
            onChange(setSingle(setup, attribute, value));
            setMessage('');
            setDraft('');
            return;
        }
        const result = addValue(setup, attribute, value);
        if (typeof result === 'string') {
            setMessage(result);
            return;
        }
        onChange(result);
        setMessage('');
        if (attribute !== 'color')
            setDraft('');
    }
    const toggle = (value) => {
        const existing = selected.find(item => same(item, value));
        if (existing) {
            onChange(removeValue(setup, attribute, existing));
            setMessage('');
        }
        else
            add(value);
    };
    return <section className="ad-option-card" aria-labelledby={`ad-option-${attribute}`}>
    <header><h4 id={`ad-option-${attribute}`}>{label}</h4><span className="ad-muted">{single ? (selected.length ? `Selected: ${selected[0]}` : 'Choose one') : (selected.length ? `${selected.length} added` : 'Add at least one')}</span><button type="button" className="ad-option-off" onClick={() => onChange(setEnabled(setup, attribute, false))}>Remove {label.toLowerCase()}</button></header>
    {presets[attribute].length > 0 && <div className="ad-chip-row" role={single ? 'radiogroup' : 'group'} aria-label={`${label} presets`}>
      {presets[attribute].map(preset => { const on = selected.some(value => same(value, preset)); return <button key={preset} type="button" className="ad-chip" {...(single ? { role: 'radio', 'aria-checked': on } : { 'aria-pressed': on })} onClick={() => toggle(preset)}>{on && <Check />}{preset}</button>; })}
    </div>}
    {(custom.length > 0) && <div className="ad-chip-row" role="list" aria-label={attribute === 'color' ? 'Selected colours' : `Custom ${label.toLowerCase()} values`}>
      {custom.map(value => <span key={value} role="listitem" className={`ad-chip ad-chip-custom${single ? ' is-selected' : ''}`}>{attribute === 'color' && <i style={{ background: value }}/>}{value}<button type="button" aria-label={`Remove ${value}`} onClick={() => onChange(removeValue(setup, attribute, value))}>×</button></span>)}
    </div>}
    <div className="ad-option-add">
      {attribute === 'color' && <input type="color" aria-label="Pick a colour" value={isHex(normaliseHex(draft)) ? normaliseHex(draft).toLowerCase() : '#000000'} onChange={event => setDraft(event.target.value.toUpperCase())}/>}
      <input aria-label={attribute === 'color' ? 'Colour hex code' : `Custom ${label.toLowerCase()}`} className={attribute === 'color' ? 'ad-swatch-hex' : undefined} value={draft} maxLength={attribute === 'color' ? 7 : 60} placeholder={placeholders[attribute]} onChange={event => { setDraft(event.target.value); setMessage(''); }} onKeyDown={event => { if (event.key === 'Enter') {
        event.preventDefault();
        add(draft);
    } }}/>
      <button type="button" className="ad-secondary" onClick={() => add(draft)}>{attribute === 'color' ? '+ Add colour' : 'Use custom'}</button>
    </div>
    {message && <small className="ad-swatch-error" role="alert">{message}</small>}
  </section>;
}
const Check = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>;
export default function VariantEditor({ setup, onChange, error, showProblems }) {
    const active = activeKeys(setup);
    const missing = missingCombinations(setup);
    const totalStock = setup.rows.reduce((total, row) => total + (/^\d+$/.test(row.stock.trim()) ? Number(row.stock) : 0), 0);
    const updateRow = (index, changes) => onChange({ ...setup, rows: setup.rows.map((row, position) => (position === index ? { ...row, ...changes } : row)) });
    // Variants still on the base price follow it; variants with their own price keep it.
    const setBase = (field, value) => {
        const rowField = field === 'basePrice' ? 'price' : 'mrp';
        onChange({ ...setup, [field]: value, rows: setup.rows.map(row => (row[rowField] === setup[field] ? { ...row, [rowField]: value } : row)) });
    };
    const applyBaseToAll = () => onChange({ ...setup, rows: setup.rows.map(row => ({ ...row, price: setup.basePrice, mrp: setup.baseMrp })) });
    const optionErrors = setupProblems(setup);
    return <fieldset className="ad-variants ad-editor-wide">
    <legend>Variants</legend>
    <p className="ad-muted">Add every seater, size, colour and fabric this product comes in. Each combination becomes its own variant with its own price, MRP and stock — for example 2 seaters × 3 colours gives 6 variants.</p>

    <div className="ad-variant-base">
      <label>Base selling price (INR)<input type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0.00" value={setup.basePrice} onChange={event => setBase('basePrice', event.target.value)}/></label>
      <label>Base MRP (INR)<input type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="Optional" value={setup.baseMrp} onChange={event => setBase('baseMrp', event.target.value)}/></label>
      <small className="ad-muted">The common price. New variants start at it, and variants without their own price follow it. Change a variant&apos;s price below to make it differ.</small>
    </div>

    <div className="ad-variant-options">
      <span>Product options</span>
      <div className="ad-chip-row" role="group" aria-label="Variant options">
        {variantAttributes.map(key => <button key={key} type="button" className="ad-chip ad-chip-toggle" aria-pressed={setup.enabled[key]} onClick={() => onChange(setEnabled(setup, key, !setup.enabled[key]))}>{setup.enabled[key] ? <Check /> : <span aria-hidden="true">+</span>}{attributeLabels[key]}</button>)}
      </div>
    </div>
    {variantAttributes.filter(key => setup.enabled[key]).map(key => <OptionCard key={key} attribute={key} setup={setup} onChange={onChange}/>)}
    {showProblems && optionErrors.map(message => <small key={message} className="ad-swatch-error" role="alert">{message}</small>)}

    <div className="ad-variant-list-head"><h4>Variants, price &amp; stock ({setup.rows.length})</h4>{setup.rows.length > 1 && <button type="button" className="ad-option-off" disabled={!setup.basePrice} onClick={applyBaseToAll}>Reset all to base price</button>}</div>
    <div className="ad-variant-head" aria-hidden="true"><span>{active.length ? 'Options' : 'Product'}</span><span>Selling price (INR)</span><span>MRP (INR)</span><span>Stock</span><span /></div>
    <ol>{setup.rows.map((row, index) => {
            const problems = variantProblems(row);
            const messages = showProblems ? Object.values(problems) : [];
            const custom = !!setup.basePrice && row.price !== setup.basePrice;
            const name = active.map(key => row[key]).join(', ') || 'Default';
            return <li key={keyOf(row) || index}>
        <div className="ad-variant-name">
          {active.length ? active.map(key => key === 'color' ? <span key={key} className="ad-variant-tag" title="Colour"><i style={{ background: row.color }} />{row.color}</span> : <span key={key} className="ad-variant-tag" title={attributeLabels[key]}>{row[key]}</span>) : <span className="ad-muted">One price for this product</span>}
          {custom && <span className="ad-variant-custom">Custom price</span>}
        </div>
        <label className="ad-variant-field"><span>Selling price (INR)</span><input type="number" inputMode="decimal" aria-label={`${name} selling price in INR`} aria-invalid={showProblems && !!problems.price} min="0.01" max="9999999999.99" step="0.01" placeholder={setup.basePrice || '0.00'} value={row.price} onChange={event => updateRow(index, { price: event.target.value })}/></label>
        <label className="ad-variant-field"><span>MRP (INR)</span><input type="number" inputMode="decimal" aria-label={`${name} MRP in INR, optional`} aria-invalid={showProblems && !!problems.mrp} min="0.01" max="9999999999.99" step="0.01" placeholder="Optional" value={row.mrp} onChange={event => updateRow(index, { mrp: event.target.value })}/></label>
        <label className="ad-variant-field"><span>Stock</span><input type="number" inputMode="numeric" aria-label={`${name} stock`} aria-invalid={showProblems && !!problems.stock} min="0" max="1000000" step="1" value={row.stock} onChange={event => updateRow(index, { stock: event.target.value })}/></label>
        <button type="button" className="ad-variant-remove" aria-label={`Remove variant ${name}`} disabled={setup.rows.length === 1} title={setup.rows.length === 1 ? 'A product needs at least one variant.' : 'Remove this variant'} onClick={() => onChange({ ...setup, rows: setup.rows.filter((_, position) => position !== index) })}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
        </button>
        {messages.length > 0 && <small className="ad-swatch-error">{messages.join(' ')}</small>}
      </li>;
        })}</ol>
    <div className="ad-variant-footer">
      {missing.length > 0 ? <button type="button" className="ad-secondary" disabled={setup.rows.length + missing.length > maxVariants} onClick={() => onChange({ ...setup, rows: [...setup.rows, ...missing.map(combo => newRow(setup, combo))] })}>+ Add {missing.length} removed combination{missing.length === 1 ? '' : 's'}</button> : <span />}
      <span className="ad-muted">Total stock: <strong>{totalStock}</strong></span>
    </div>
    {error && <small className="ad-swatch-error" role="alert">{error}</small>}
  </fieldset>;
}
