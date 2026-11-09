'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';
import { useCategories } from '@/components/CategoryProvider';
import CategoryBrowser from './CategoryBrowser';
import { categoryPath, mainCategories } from '@/lib/category-types';
const blank = () => ({ name: '', slug: '', description: '', image: '', kind: 'category', parentSlug: null, sortOrder: 0, active: true, showInMenu: true, showOnHome: false });
export default function AdminCategories({ onBack }) {
    const router = useRouter();
    const { refresh } = useCategories();
    const pathname = usePathname();
    const editorOpen = pathname.includes('/categories/new/') || pathname.includes('/categories/edit/');
    const closeForm = () => router.push('/admin/products/categories');
    const formRef = useRef(null);
    const nameRef = useRef(null);
    const [categories, setCategories] = useState([]);
    const [editor, setEditor] = useState(blank);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    useEffect(() => {
        if (!imageFile) {
            setImagePreview('');
            return;
        }
        const url = URL.createObjectURL(imageFile);
        setImagePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);
    const resetEditor = () => { setEditor(blank()); setImageFile(null); };
    const [level, setLevel] = useState('main');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    async function load() {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/categories', { cache: 'no-store' });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message);
            setCategories(data.categories);
            setError('');
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Could not load categories.');
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => { void load(); }, []);
    async function save(event) {
        event.preventDefault();
        setSaving(true);
        setError('');
        try {
            const body = new FormData();
            // A new main category joins the end of the menu rather than jumping to the front.
            const lastPosition = Math.max(-1, ...mainCategories(categories).map(c => c.sortOrder));
            body.set('data', JSON.stringify(!editor.id && level === 'main' ? { ...editor, sortOrder: lastPosition + 1 } : editor));
            if (imageFile)
                body.set('image', imageFile);
            const response = await fetch(`/api/admin/categories${editor.id ? `/${editor.id}` : ''}`, { method: editor.id ? 'PATCH' : 'POST', body });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok)
                throw new Error([data.message, ...Object.values(data.errors || {}).flat()].join(' '));
            resetEditor();
            closeForm();
            toast.success(editor.id ? 'Category updated' : 'Category created');
            await load();
            await refresh();
            router.refresh();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Could not save category.');
        }
        finally {
            setSaving(false);
        }
    }
    // Shown straight away, then put back if the server refuses, so the list never lies about what's saved.
    async function moveMain(id, position) {
        const current = mainCategories(categories);
        const ids = current.map(c => c.id).filter(other => other !== id);
        ids.splice(position, 0, id);
        if (ids.every((other, index) => other === current[index].id))
            return;
        const previous = categories;
        const reordered = ids.map((other, sortOrder) => ({ ...current.find(c => c.id === other), sortOrder }));
        setCategories([...reordered, ...categories.filter(c => !ids.includes(c.id))]);
        setSaving(true);
        setError('');
        try {
            const response = await fetch('/api/admin/categories/order', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Could not save the order.');
            setCategories(data.categories);
            toast.success('Order saved', { description: 'Your store menu has been updated.' });
            await refresh();
            router.refresh();
        }
        catch (e) {
            setCategories(previous);
            setError(e instanceof Error ? e.message : 'Could not save the order.');
        }
        finally {
            setSaving(false);
        }
    }
    async function toggleHome(category) {
        setSaving(true);
        setError('');
        try {
            const response = await fetch('/api/admin/categories/' + category.id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...category, showOnHome: !category.showOnHome }) });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Could not update homepage visibility.');
            setCategories(current => current.map(c => c.id === category.id ? data.category : c));
            toast.success(category.showOnHome ? 'Hidden from homepage' : 'Shown on homepage');
            await refresh();
            router.refresh();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Could not update homepage visibility.');
        }
        finally {
            setSaving(false);
        }
    }
    async function remove(category) {
        if (categories.some(child => child.parentSlug === category.slug)) {
            toast.error('This category contains other categories.', { description: 'Move or delete its child categories first.' });
            return;
        }
        setSaving(true);
        setError('');
        try {
            const response = await fetch('/api/admin/categories/' + category.id, { method: 'DELETE' });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            if (!response.ok)
                throw new Error((await response.json()).message || 'Could not delete category.');
            if (editor.id === category.id)
                resetEditor();
            toast.success('Category deleted');
            await load();
            await refresh();
            router.refresh();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Could not delete category.');
        }
        finally {
            setSaving(false);
        }
    }
    const descendants = new Set(editor.slug ? [editor.slug] : []);
    for (let i = 0; i < categories.length; i++)
        for (const c of categories)
            if (c.parentSlug && descendants.has(c.parentSlug))
                descendants.add(c.slug);
    const parentPath = categoryPath(editor.parentSlug || '', categories);
    const editingMain = level === 'main';
    const mainSlug = editingMain ? '' : parentPath[0]?.slug || '';
    const categorySlug = parentPath[1]?.slug || '';
    function showForm(nextLevel, category, parentSlug = null) {
        setError('');
        router.push(category ? '/admin/products/categories/edit/' + category.id : '/admin/products/categories/new/' + nextLevel + (parentSlug ? '/' + parentSlug : ''));
    }
    useEffect(() => {
        if (!editorOpen || !categories.length)
            return;
        const segments = pathname.split('/');
        const editing = segments[4] === 'edit';
        const selected = editing ? categories.find(c => c.id === segments[5]) : undefined;
        const nextLevel = editing && selected ? (categoryPath(selected.slug, categories).length === 1 ? 'main' : categoryPath(selected.slug, categories).length === 2 ? 'category' : 'subcategory') : segments[5];
        setLevel(nextLevel === 'category' || nextLevel === 'subcategory' ? nextLevel : 'main');
        setEditor(selected || { ...blank(), parentSlug: segments[6] || null });
        setImageFile(null);
        setError('');
    }, [pathname, categories, editorOpen]);
    const levelName = level === 'main' ? 'main category' : level;
    return <section className={`ad-category-manager ${editorOpen ? 'ad-category-form-page' : ''}`}>
    {!editorOpen && <header className="ad-category-heading"><div><span className="ad-category-eyebrow">YOUR STORE CATALOG</span><h2>Manage categories</h2><p className="ad-muted">Choose a main category, then manage its categories and subcategories.</p></div><button className="ad-secondary" disabled={saving} onClick={onBack}>Back to products</button></header>}
    {error && <div role="alert" className="ad-product-error">{error} {loading && <span>Loading...</span>}<button className="ad-secondary" disabled={saving} onClick={load}>Retry</button></div>}
    {editorOpen && <form ref={formRef} className="ad-category-form" onSubmit={save}><fieldset disabled={saving || loading}>
      <div className="ad-category-form-heading"><div><span className="ad-category-eyebrow">{editor.id ? 'UPDATE YOUR CATALOG' : 'GROW YOUR CATALOG'}</span><h3>{editor.id ? 'Edit' : 'Add'} {levelName}</h3><p className="ad-muted">{editingMain ? 'Give your store department a name and a picture.' : level === 'category' ? 'Choose where this category belongs, then give it a name.' : 'Choose a main category and category for this subcategory.'}</p></div><button type="button" className="ad-secondary" onClick={() => { resetEditor(); closeForm(); }}>Back to categories</button></div>
      <div className="ad-category-form-columns"><div className="ad-category-form-fields"><div className="ad-cb-form-section"><span className="ad-cb-step">01</span><h4>Category details</h4></div>
        {!editingMain && <div className="ad-editor-grid">
          <label><span>Main category <span className="ad-required">*</span></span><select aria-label="Main category" required value={mainSlug} onChange={e => setEditor({ ...editor, parentSlug: e.target.value || null })}><option value="">Choose main category</option>{mainCategories(categories).filter(c => !descendants.has(c.slug)).map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></label>
          {level === 'subcategory' && <label><span>Category <span className="ad-required">*</span></span><select aria-label="Category" required disabled={!mainSlug} value={categorySlug} onChange={e => setEditor({ ...editor, parentSlug: e.target.value || mainSlug })}><option value="">Choose category</option>{categories.filter(c => c.kind === 'category' && c.parentSlug === mainSlug && !descendants.has(c.slug)).map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></label>}
        </div>}
        <label className="ad-category-field"><span>{editingMain ? 'Main category name' : level === 'subcategory' ? 'Subcategory name' : 'Category name'} <span className="ad-required">*</span></span><input ref={nameRef} aria-label={editingMain ? 'Main category name' : level === 'subcategory' ? 'Subcategory name' : 'Category name'} required minLength={2} maxLength={100} placeholder={editingMain ? 'e.g. Home Decor' : level === 'category' ? 'e.g. Mirrors' : 'e.g. Wall Mirror'} value={editor.name} onChange={e => setEditor({ ...editor, name: e.target.value, slug: editor.id ? editor.slug : e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })}/></label>
        <div className="ad-category-location"><small>STORE LOCATION</small><span>{[...parentPath.map(c => c.name), editor.name || 'New ' + levelName].join(' / ')}</span></div>
        <label className="ad-category-field">Description <span className="ad-muted">(optional)</span><textarea rows={3} maxLength={2000} placeholder="A short introduction for customers browsing this category." value={editor.description} onChange={e => setEditor({ ...editor, description: e.target.value })}/></label>
        <details className="ad-category-advanced"><summary>{editingMain ? 'Link' : 'Link & display order'}</summary><div className="ad-editor-grid"><label>URL slug<input pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} disabled={!!editor.id} value={editor.slug} onChange={e => setEditor({ ...editor, slug: e.target.value })}/><small className="ad-muted">Filled from the name. Permanent after creation.</small></label>{!editingMain && <label>Display order<input type="number" min={0} max={10000} required value={editor.sortOrder} onChange={e => setEditor({ ...editor, sortOrder: Number(e.target.value) })}/><small className="ad-muted">Smaller numbers appear first.</small></label>}</div></details>
      </div><aside className="ad-category-visual"><div className="ad-cb-form-section"><span className="ad-cb-step">02</span><h4>Category image</h4></div><label className="ad-category-upload"><span className="ad-category-upload-icon" aria-hidden="true">↑</span><strong>{imagePreview || editor.image ? 'Change category image' : 'Upload category image'}</strong><span>Choose a JPG, PNG, or WebP image</span><input aria-label="Category image" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (!file)
                    return;
                if (file.size > 8 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                    setError('Choose a JPG, PNG, or WebP image up to 8 MB.');
                    return;
                }
                setImageFile(file);
                setError('');
            }}/><small>Up to 8 MB. Saved as WebP automatically.</small></label>
      {(imagePreview || editor.image) ? <div className="ad-category-image-preview"><Image unoptimized={!!imagePreview} src={imagePreview || editor.image} alt="Category image preview" width={240} height={180}/>{imageFile && <small>{imageFile.name}</small>}<button type="button" className="ad-secondary" onClick={() => { setImageFile(null); setEditor({ ...editor, image: '' }); }}>Remove image</button></div> : <p className="ad-muted ad-category-image-hint">Optional. Without an image, we use the parent category picture.</p>}
      </aside></div>
      <div className="ad-cb-form-visibility"><div className="ad-cb-form-section"><span className="ad-cb-step">03</span><h4>Where it appears</h4></div><div className="ad-category-visibility"><label><input type="checkbox" checked={editor.active} onChange={e => setEditor({ ...editor, active: e.target.checked })}/><span><strong>Active</strong><small>Available on your store</small></span></label><label><input type="checkbox" checked={editor.showInMenu} onChange={e => setEditor({ ...editor, showInMenu: e.target.checked })}/><span><strong>Show in navigation</strong><small>Include in the store menu</small></span></label>{level !== 'main' && <label><input type="checkbox" checked={!!editor.showOnHome} onChange={e => setEditor({ ...editor, showOnHome: e.target.checked })}/><span><strong>{level === 'category' ? 'Smart Living cards' : 'Subcategory slider'}</strong><small>Show this on the homepage</small></span></label>}</div></div><div className="ad-category-form-bottom"><button type="button" className="ad-secondary" onClick={closeForm}>Cancel</button><button className="ad-primary" type="submit">{saving ? 'Saving...' : editor.id ? 'Save changes' : 'Create ' + levelName}</button></div>
    </fieldset></form>}
    {!editorOpen && <CategoryBrowser categories={categories} loading={loading} saving={saving} onAdd={(nextLevel, parentSlug) => showForm(nextLevel, undefined, parentSlug)} onEdit={(nextLevel, category) => showForm(nextLevel, category)} onDelete={remove} onToggleHome={toggleHome} onMove={moveMain}/>}
  </section>;
}
