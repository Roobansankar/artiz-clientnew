'use client';
import Image from 'next/image';
import { useState } from 'react';
import { categoryImage, categoryPath, mainCategories } from '@/lib/category-types';
function rememberedSelection() {
    try {
        const value = JSON.parse(sessionStorage.getItem('admin-category-selection') || '{}');
        if (!value || typeof value !== 'object')
            return {};
        return {
            main: typeof value.main === 'string' ? value.main : '',
            category: typeof value.category === 'string' ? value.category : '',
            highlight: typeof value.highlight === 'string' ? value.highlight : '',
        };
    }
    catch {
        return {};
    }
}
export default function CategoryBrowser({ categories, loading, saving, onAdd, onEdit, onDelete, onToggleHome, onMove }) {
    const [mainSlug, setMainSlug] = useState(() => rememberedSelection().main || '');
    const [categorySlug, setCategorySlug] = useState(() => rememberedSelection().category || '');
    const [highlightSlug, setHighlightSlug] = useState(() => rememberedSelection().highlight || '');
    const [search, setSearch] = useState('');
    const [deleteSlug, setDeleteSlug] = useState('');
    const mains = mainCategories(categories);
    const main = mains.find(item => item.slug === mainSlug) || mains[0];
    const children = categories.filter(item => item.kind === 'category' && item.parentSlug === main?.slug);
    const selected = children.find(item => item.slug === categorySlug) || children[0];
    const subcategories = categories.filter(item => item.kind === 'category' && item.parentSlug === selected?.slug);
    const matches = search.trim() ? categories.filter(item => item.kind === 'category' && categoryPath(item.slug, categories).map(c => c.name).join(' / ').toLowerCase().includes(search.trim().toLowerCase())) : [];
    function choose(item) {
        const path = categoryPath(item.slug, categories);
        setMainSlug(path[0]?.slug || '');
        setCategorySlug(path[1]?.slug || '');
        setHighlightSlug(item.slug);
        try {
            sessionStorage.setItem('admin-category-selection', JSON.stringify({ main: path[0]?.slug, category: path[1]?.slug, highlight: item.slug }));
        }
        catch { }
        setSearch('');
        setDeleteSlug('');
    }
    function row(item, level, active = false) {
        const descendants = categories.filter(child => child.parentSlug === item.slug);
        const mainIndex = mains.findIndex(c => c.slug === item.slug);
        return <li key={item.slug} className={`ad-cb-item ${active ? 'is-selected' : ''}`}>
      <div className="ad-cb-item-top">
        <button type="button" className="ad-cb-select" onClick={() => choose(item)} aria-pressed={active}>
          <Image src={categoryImage(item, categories)} alt="" width={44} height={44}/>
          <span><strong>{item.name}</strong><small>{level === 'subcategory' ? 'Subcategory' : `${descendants.length} ${level === 'main' ? 'categories' : 'subcategories'}`}{!item.active ? ' · Inactive' : !item.showInMenu ? ' · Hidden from menu' : ''}</small></span>
          {level !== 'subcategory' && <span aria-hidden="true" className="ad-cb-chevron">›</span>}
        </button>
        <button type="button" className="ad-secondary" disabled={saving} onClick={() => { choose(item); onEdit(level, item); }} aria-label={`Edit ${item.name}`}>Edit</button>
      </div>
      <div className="ad-cb-item-bottom">
        {level !== 'main' ? <label className="ad-cb-visibility"><span>{level === 'category' ? 'Smart Living cards' : 'Subcategory slider'}</span><button type="button" role="switch" aria-checked={item.showOnHome} aria-label={`Show ${item.name} in ${level === 'category' ? 'Smart Living cards' : 'subcategory slider'}`} disabled={saving} className={`ad-cb-switch ${item.showOnHome ? 'is-on' : ''}`} onClick={() => void onToggleHome(item)}><span /> <span className="ad-cb-switch-text">{item.showOnHome ? 'On' : 'Off'}</span></button></label>
                : <label className="ad-cb-position">Menu position<select aria-label={`Menu position of ${item.name}`} value={mainIndex} disabled={saving} onChange={event => void onMove(item.id, Number(event.target.value))}>{mains.map((c, index) => <option key={c.id} value={index}>{index + 1}</option>)}</select></label>}
        <button type="button" className="ad-category-delete-button" disabled={saving} onClick={() => setDeleteSlug(deleteSlug === item.slug ? '' : item.slug)}>Delete</button>
      </div>
      {deleteSlug === item.slug && <div className="ad-cb-confirm" role="alert">
        <p>{descendants.length ? `Move or delete these first: ${descendants.map(child => child.name).join(', ')}.` : `Delete “${item.name}”? This cannot be undone.`}</p>
        <div>{!descendants.length && <button type="button" className="ad-secondary" disabled={saving} onClick={() => void onDelete(item).then(() => setDeleteSlug(''))}>Delete category</button>}<button type="button" className="ad-secondary" disabled={saving} onClick={() => setDeleteSlug('')}>Cancel</button></div>
      </div>}
    </li>;
    }
    return <div className="ad-cb">
    <div className="ad-cb-toolbar">
      <label className="ad-cb-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="Search all categories" placeholder="Find a category or subcategory…" value={search} onChange={event => setSearch(event.target.value)}/></label>
      <span className="ad-muted">{mains.length} main · {categories.filter(c => c.kind === 'category' && c.parentSlug).length} categories & subcategories</span>
    </div>
    {search.trim() ? <section className="ad-cb-results" aria-label="Category search results">
      <div className="ad-cb-results-heading"><h3>Search results <span>({matches.length})</span></h3><button type="button" className="ad-secondary" onClick={() => setSearch('')}>Back to categories</button></div>
      {matches.map(item => <button key={item.slug} type="button" className="ad-cb-result" onClick={() => choose(item)}><Image src={categoryImage(item, categories)} alt="" width={40} height={40}/><span><strong>{item.name}</strong><small>{categoryPath(item.slug, categories).map(c => c.name).join(' / ')}</small></span><span aria-hidden="true">→</span></button>)}
      {!matches.length && <p className="ad-category-empty">No matches. Try a different name.</p>}
    </section> : <>
      <div className="ad-cb-trail" aria-label="Selected category path"><span>Your store</span><span aria-hidden="true">/</span><strong>{main?.name || 'Choose a main category'}</strong>{selected && <><span aria-hidden="true">/</span><span>{selected.name}</span></>}</div>
      {loading ? <p className="ad-category-empty" role="status">Loading your categories…</p> : <div className="ad-cb-panels">
        <section className="ad-cb-panel" aria-labelledby="cb-main-title"><header><div><span className="ad-cb-step">01</span><h3 id="cb-main-title">Main categories</h3></div><p>Your store departments. Select one to explore.</p><button type="button" className="ad-secondary" disabled={saving} onClick={() => onAdd('main')}>+ Add main category</button></header><ul>{mains.map(item => row(item, 'main', item.slug === main?.slug))}</ul>{!mains.length && <p className="ad-category-empty">Add your first main category to get started.</p>}</section>
        <section className="ad-cb-panel" aria-labelledby="cb-category-title"><header><div><span className="ad-cb-step">02</span><h3 id="cb-category-title">Categories</h3></div><p>{main ? `Inside ${main.name}` : 'Choose a main category first.'}</p><button type="button" className="ad-secondary" disabled={saving || !main} onClick={() => onAdd('category', main?.slug)}>+ Add category</button></header><ul>{children.map(item => row(item, 'category', item.slug === selected?.slug))}</ul>{!children.length && <p className="ad-category-empty">{main ? `No categories in ${main.name} yet.` : 'Your categories will appear here.'}</p>}</section>
        <section className="ad-cb-panel" aria-labelledby="cb-sub-title"><header><div><span className="ad-cb-step">03</span><h3 id="cb-sub-title">Subcategories</h3></div><p>{selected ? `Inside ${selected.name}` : 'Choose a category first.'}</p><button type="button" className="ad-secondary" disabled={saving || !selected} onClick={() => onAdd('subcategory', selected?.slug)}>+ Add subcategory</button></header><ul>{subcategories.map(item => row(item, 'subcategory', item.slug === highlightSlug))}</ul>{!subcategories.length && <p className="ad-category-empty">{selected ? `No subcategories in ${selected.name} yet.` : 'Your subcategories will appear here.'}</p>}</section>
      </div>}
    </>}
    <p className="ad-cb-note">Homepage switches control the new storefront. Items appear only when they and their parent categories are active.</p>
  </div>;
}
