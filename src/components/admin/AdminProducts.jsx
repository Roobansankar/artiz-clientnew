'use client';
import { useEffect, useState } from 'react';
import Image from '../ProductImage';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useCategories } from '@/components/CategoryProvider';
import { categoryLabel, matchesCategory } from '@/lib/category-types';
import ProductPrice, { formatINR } from '@/components/ProductPrice';
import { attributesOf, pricesVary, variantLabel } from '@/lib/variants';
import AdminCategories from './AdminCategories';
import VariantEditor, { blankSetup, hasVariantProblems, setupFrom, toPayload } from './VariantEditor';
import ProductCategoryPicker from './ProductCategoryPicker';
const blank = () => ({ name: '', description: '', details: '', categorySlug: '', collectionSlugs: [], material: '', dimensions: '', variants: blankSetup(), retainedImages: [], published: false, isNewArrival: true, isBestSeller: false, isFeatured: false, isCurated: false });
const productEditPath = (product) => {
    return `/admin/products/${product.slug || product.id}/edit`;
};
export default function AdminProducts() {
    const router = useRouter();
    const { refresh: refreshCategories } = useCategories();
    const [catalogCategories, setCatalogCategories] = useState([]);
    const [categoryError, setCategoryError] = useState('');
    const [categoryReload, setCategoryReload] = useState(0);
    const pathname = usePathname();
    const managingCategories = pathname.startsWith('/admin/products/categories');
    const editMatch = pathname.match(/^\/admin\/products\/([^/]+)\/edit\/?$/);
    const editingId = editMatch ? decodeURIComponent(editMatch[1]) : null;
    const creatingProduct = pathname === '/admin/products/new';
    const setManagingCategories = (open) => router.push(open ? '/admin/products/categories' : '/admin/products');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [sort, setSort] = useState('recent');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [editor, setEditor] = useState(null);
    const [detailId, setDetailId] = useState(null);
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [showVariantProblems, setShowVariantProblems] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [deleting, setDeleting] = useState(null);
    const [selected, setSelected] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    useEffect(() => {
        if (managingCategories)
            return;
        const controller = new AbortController();
        fetch('/api/admin/categories', { cache: 'no-store', signal: controller.signal }).then(async (response) => {
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Could not load categories.');
            setCatalogCategories(data.categories);
            setCategoryError('');
        }).catch(e => { if (!controller.signal.aborted)
            setCategoryError(e.message); });
        return () => controller.abort();
    }, [managingCategories, categoryReload, router]);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError('');
        fetch('/api/admin/products', { cache: 'no-store', signal: controller.signal }).then(async (response) => {
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Could not load products.');
            setProducts(data.products);
        }).catch(e => { if (!controller.signal.aborted)
            setError(e.message); }).finally(() => { if (!controller.signal.aborted)
            setLoading(false); });
        return () => controller.abort();
    }, [reload, router]);
    useEffect(() => {
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviews(urls);
        return () => urls.forEach(url => URL.revokeObjectURL(url));
    }, [files]);
    useEffect(() => {
        setSelected(current => current.filter(id => products.some(product => product.id === id)));
    }, [products]);
    useEffect(() => {
        // Opening a product replaces the list content; start the detail view at the top.
        if (detailId)
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [detailId]);
    useEffect(() => {
        if (!deleting && !bulkDeleting)
            return;
        const escape = (event) => { if (event.key === 'Escape') {
            setDeleting(null);
            setBulkDeleting(false);
        } };
        window.addEventListener('keydown', escape);
        return () => window.removeEventListener('keydown', escape);
    }, [deleting, bulkDeleting]);
    useEffect(() => {
        if (creatingProduct) {
            initializeEditor();
            return;
        }
        if (editingId) {
            const product = products.find(product => productEditPath(product) === pathname)
                || products.find(product => product.id === editingId)
                || products.find(product => product.id === editingId.split('--').slice(1).join('--'));
            if (product) {
                initializeEditor(product);
                if (pathname !== productEditPath(product))
                    router.replace(productEditPath(product));
            }
            else
                setEditor(null);
            return;
        }
        setEditor(null);
        // Initialize the form only when its route or loaded product changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingId, creatingProduct, products]);
    function edit(product) {
        router.push(product ? productEditPath(product) : '/admin/products/new');
    }
    function initializeEditor(product) {
        setFormError('');
        setFieldErrors({});
        setFiles([]);
        setShowVariantProblems(false);
        setEditor(product ? { id: product.id, name: product.name, description: product.description, details: product.details || '', categorySlug: product.categorySlug, collectionSlugs: product.collectionSlugs || [], material: product.material, dimensions: product.dimensions, variants: setupFrom(product.variants?.length ? product.variants : (product.swatches ?? []).map(color => ({ color, price: product.amount, mrp: product.mrp ?? null, stock: 0 })), product.amount, product.mrp), retainedImages: product.images || [], published: !!product.published, isNewArrival: !!product.isNewArrival, isBestSeller: !!product.isBestSeller, isFeatured: !!product.isFeatured, isCurated: !!product.isCurated } : blank());
    }
    function field(key, value) { setEditor(current => current ? { ...current, [key]: value } : current); }
    async function save(event) {
        event.preventDefault();
        if (!editor || saving)
            return;
        setFormError('');
        setFieldErrors({});
        if (editor.retainedImages.length + files.length > 6) {
            setFormError('Use at most six images.');
            return;
        }
        if (!editor.variants.rows.length) {
            setFormError('Add at least one variant with its price and stock.');
            return;
        }
        if (hasVariantProblems(editor.variants)) {
            setShowVariantProblems(true);
            setFormError('Fix the variant fields marked in red.');
            return;
        }
        setSaving(true);
        try {
            const { id, ...values } = editor;
            const body = new FormData();
            body.set('data', JSON.stringify({ ...values, variants: toPayload(values.variants) }));
            files.forEach(file => body.append('images', file));
            const response = await fetch(`/api/admin/products${id ? `/${id}` : ''}`, { method: id ? 'PATCH' : 'POST', body });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok) {
                setFieldErrors(data.errors || {});
                throw new Error(data.message || 'Could not save product.');
            }
            setEditor(null);
            setFiles([]);
            setDetailId(null);
            setReload(n => n + 1);
            router.push('/admin/products');
            router.refresh();
            toast.success(id ? 'Product updated' : 'Product created', { description: data.product.published ? 'Published changes are now available on the website.' : 'Saved as a draft. Publish when ready.' });
        }
        catch (e) {
            setFormError(e instanceof Error ? e.message : 'Could not save product.');
        }
        finally {
            setSaving(false);
        }
    }
    async function confirmDelete() {
        if (!deleting || saving)
            return;
        setSaving(true);
        setFormError('');
        try {
            const response = await fetch(`/api/admin/products/${deleting.id}`, { method: 'DELETE' });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            if (!response.ok)
                throw new Error((await response.json()).message || 'Could not delete this product.');
            toast.success('Product deleted', { description: `${deleting.name} was deleted.` });
            setDeleting(null);
            setReload(n => n + 1);
            router.refresh();
        }
        catch (e) {
            setFormError(e instanceof Error ? e.message : 'Could not delete this product.');
        }
        finally {
            setSaving(false);
        }
    }
    async function confirmBulkDelete() {
        if (!selected.length || saving)
            return;
        setSaving(true);
        setFormError('');
        const ids = [...selected];
        const failed = [];
        let unauthorized = false;
        for (const id of ids) {
            try {
                const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
                if (response.status === 401) {
                    unauthorized = true;
                    break;
                }
                if (!response.ok)
                    failed.push(id);
            }
            catch {
                failed.push(id);
            }
        }
        setSaving(false);
        setBulkDeleting(false);
        if (unauthorized) {
            router.replace('/admin/login');
            return;
        }
        const deleted = ids.length - failed.length;
        setSelected(failed);
        if (deleted)
            toast.success(deleted === 1 ? 'Product deleted' : `${deleted} products deleted`, { description: deleted === 1 ? 'The selected product was deleted.' : `${deleted} selected products were deleted.` });
        if (failed.length)
            toast.error(failed.length === 1 ? '1 product could not be deleted' : `${failed.length} products could not be deleted`, { description: 'They are still selected. Please try again.' });
        setReload(n => n + 1);
        router.refresh();
    }
    const categoryName = (slug) => catalogCategories.find(c => c.slug === slug)?.name || slug;
    const publishedCount = products.filter(p => p.published).length;
    const outOfStockCount = products.filter(p => !p.stock).length;
    const visible = products.filter(p => {
        const matchesSearch = `${p.name} ${p.id} ${categoryName(p.categorySlug)}`.toLowerCase().includes(query.trim().toLowerCase());
        const stock = p.stock || 0;
        return matchesSearch && (status === 'all' || (status === 'published' ? p.published : !p.published))
            && (categoryFilter === 'all' || matchesCategory(p, categoryFilter, catalogCategories))
            && (stockFilter === 'all' || (stockFilter === 'out' ? stock === 0 : stockFilter === 'low' ? stock > 0 && stock <= 5 : stock > 0));
    });
    if (sort === 'name')
        visible.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'price-low')
        visible.sort((a, b) => a.amount - b.amount);
    if (sort === 'price-high')
        visible.sort((a, b) => b.amount - a.amount);
    if (sort === 'stock')
        visible.sort((a, b) => (a.stock || 0) - (b.stock || 0));
    const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const pageProducts = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const pageIds = pageProducts.map(product => product.id);
    const allOnPageSelected = pageIds.length > 0 && pageIds.every(id => selected.includes(id));
    const someOnPageSelected = pageIds.some(id => selected.includes(id));
    function toggleAllOnPage() {
        setSelected(current => allOnPageSelected
            ? current.filter(id => !pageIds.includes(id))
            : [...new Set([...current, ...pageIds])]);
    }
    function toggleSelected(id) {
        setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    }
    const hasFilters = query !== '' || categoryFilter !== 'all' || stockFilter !== 'all' || status !== 'all';
    function clearFilters() { setQuery(''); setCategoryFilter('all'); setStockFilter('all'); setStatus('all'); setPage(1); }
    if (managingCategories)
        return <AdminCategories onBack={() => { setManagingCategories(false); void refreshCategories(); }}/>;
    if ((editingId || creatingProduct) && !editor)
        return <section className="ad-product-editor"><div className="ad-page-actions"><h2>{creatingProduct ? 'Create product' : 'Edit product'}</h2><button className="ad-secondary" onClick={() => { setDetailId(null); router.push('/admin/products'); }}>Back to products</button></div>{loading ? <p role="status">Loading product...</p> : error ? <div role="alert" className="ad-product-error">{error} <button className="ad-secondary" onClick={() => setReload(n => n + 1)}>Retry</button></div> : editingId && <p role="alert">Product not found.</p>}</section>;
    if ((editingId || creatingProduct) && editor)
        return <section className="ad-product-editor">
    <div className="ad-page-actions"><h2>{editor.id ? 'Edit product' : 'Create product'}</h2><button className="ad-secondary" disabled={saving} onClick={() => { setDetailId(null); router.push('/admin/products'); }}>Back to products</button></div>
    <form onSubmit={save}>
      <fieldset disabled={saving}>
        <div className="ad-editor-grid">
          <label>Product name<input required minLength={2} maxLength={180} value={editor.name} onChange={e => field('name', e.target.value)}/></label>
          <label>Product URL<input readOnly value={editor.id ? `/products/${products.find(p => p.id === editor.id)?.slug || ''}` : 'Created automatically from the product name when saved'}/><small>Generated automatically. Kept when the product name changes.</small></label>
          <ProductCategoryPicker categories={catalogCategories} value={editor.categorySlug} onChange={slug => field('categorySlug', slug)}/>
          <div className="ad-editor-wide"><button type="button" className="ad-secondary" onClick={() => setManagingCategories(true)}>Add / edit / delete categories</button></div>
          <label className="ad-editor-wide">Description<textarea required minLength={10} maxLength={10000} rows={5} value={editor.description} onChange={e => field('description', e.target.value)}/></label>
          <label>Material<input maxLength={300} value={editor.material} onChange={e => field('material', e.target.value)}/></label>
          <label>Dimensions<input maxLength={300} placeholder="e.g. 30 x 20 x 45 cm" value={editor.dimensions} onChange={e => field('dimensions', e.target.value)}/></label>
          <label className="ad-editor-wide">Product details<textarea rows={7} maxLength={10000} value={editor.details} onChange={e => field('details', e.target.value)} placeholder="Add features, craftsmanship, and other product information..."/><small>Shown in the Product details section on the product page. Line breaks are preserved.</small></label>
          <VariantEditor setup={editor.variants} onChange={value => field('variants', value)} showProblems={showVariantProblems} error={fieldErrors.variants?.join(' ')}/>
        </div>
        <details className="ad-editor-collections"><summary>Additional categories, rooms &amp; collections ({editor.collectionSlugs.length})</summary><p className="ad-muted">Choose rooms and collections where this product should also appear.</p><div>{catalogCategories.filter(c => c.slug !== editor.categorySlug && (c.active || editor.collectionSlugs.includes(c.slug))).map(c => <label key={c.slug}><input type="checkbox" checked={editor.collectionSlugs.includes(c.slug)} onChange={e => field('collectionSlugs', e.target.checked ? [...editor.collectionSlugs, c.slug] : editor.collectionSlugs.filter(slug => slug !== c.slug))}/>{c.name}</label>)}</div></details>
        <h3>Product images</h3><p className="ad-muted">Optional. Recommended image size: 1600 &times; 1500 pixels (16:15 ratio). Keep the entire product centered with a little space around it, and use the same background and framing for all photos. All uploads are resized to exactly 1600 &times; 1500 pixels. Prepare photos in this 16:15 ratio to avoid stretching. Up to 6 JPG, PNG, or WebP images, 8 MB each. Images are converted to WebP automatically. The first image is the cover. A placeholder is used when no image is uploaded.</p>
        <div className="ad-editor-images">
          {editor.retainedImages.map((url, index) => <div key={url}><Image src={url} alt={`Product image ${index + 1}`} width={130} height={130}/><button type="button" className="ad-secondary" onClick={() => field('retainedImages', editor.retainedImages.filter(u => u !== url))}>Remove</button>{index > 0 && <button type="button" className="ad-secondary" onClick={() => field('retainedImages', [url, ...editor.retainedImages.filter(u => u !== url)])}>Make cover</button>}</div>)}
          {previews.map((url, index) => <div key={url}><Image unoptimized src={url} alt={`New upload ${index + 1}`} width={130} height={130}/><button type="button" className="ad-secondary" onClick={() => setFiles(files.filter((_, i) => i !== index))}>Remove</button></div>)}
        </div>
        <label className="ad-upload-label">Upload images<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e => {
                const incoming = Array.from(e.target.files || []);
                e.target.value = '';
                if (incoming.some(f => f.size > 8 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(f.type))) {
                    setFormError('Choose JPG, PNG, or WebP files up to 8 MB each.');
                    return;
                }
                if (files.length + editor.retainedImages.length + incoming.length > 6) {
                    setFormError('Use at most six images. Remove an image before adding more.');
                    return;
                }
                setFiles(current => [...current, ...incoming]);
                setFormError('');
            }}/></label>
        <div className="ad-editor-flags">{[['published', 'Published on website'], ['isNewArrival', 'New Arrivals'], ['isBestSeller', 'Best Sellers'], ['isFeatured', 'Featured collection'], ['isCurated', 'Curated collection']].map(([key, label]) => <label key={key}><input type="checkbox" checked={editor[key]} onChange={e => field(key, e.target.checked)}/>{label}</label>)}</div>
      </fieldset>
      {formError && <div className="ad-product-error" role="alert"><p>{formError}</p>{Object.entries(fieldErrors).filter(([key]) => key !== 'variants').map(([key, errors]) => <p key={key}>{key}: {errors.join(', ')}</p>)}</div>}
      <button className="ad-primary" disabled={saving} type="submit">{saving ? 'Converting images & saving...' : editor.id ? 'Save changes' : 'Create product'}</button>
    </form>
  </section>;
    const detail = products.find(product => product.id === detailId);
    if (detail)
        return <section className="ad-product-detail">
    <div className="ad-page-actions"><h2>{detail.name}</h2><div className="ad-product-row-actions"><button className="ad-secondary" onClick={() => setDetailId(null)}>Back to products</button><button className="ad-primary" onClick={() => edit(detail)}>Edit product</button></div></div>
    <div className="ad-product-detail-images">{(detail.images?.length ? detail.images : [detail.image]).map((src, index) => <Image key={`${index}-${src}`} src={src} alt={`${detail.name}, image ${index + 1}`} width={320} height={320}/>)}</div>
    <dl className="ad-product-detail-fields">{[
                ['Product ID', detail.id], ['Status', detail.published ? 'Published' : 'Draft'], ['Price', <ProductPrice key="price" product={detail}/>], ['Total stock', String(detail.stock || 0)],
                ['Category', categoryName(detail.categorySlug)], ['Collections', detail.collectionSlugs?.map(categoryName).join(', ') || 'None'],
                ['Material', detail.material || '—'], ['Dimensions', detail.dimensions || '—'], ['Homepage', [detail.isNewArrival && 'New arrival', detail.isBestSeller && 'Best seller', detail.isFeatured && 'Featured', detail.isCurated && 'Curated'].filter(Boolean).join(', ') || 'None'],
            ].map(([label, value]) => <div key={String(label)}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <h3>Variants, pricing &amp; stock</h3>
    <div className="ad-table-scroll"><table className="ad-variant-table"><thead><tr><th scope="col">Variant</th><th scope="col">Selling price</th><th scope="col">MRP</th><th scope="col">Stock</th></tr></thead><tbody>{(detail.variants ?? []).map((variant, index) => <tr key={index}><td><span className="ad-swatch-preview"><span>{variant.color && <i style={{ background: variant.color }}/>}{variantLabel(variant, true) || (attributesOf(detail.variants).length ? `Variant ${index + 1}` : 'Default')}</span></span></td><td>{formatINR(variant.price)}</td><td>{variant.mrp == null ? '—' : formatINR(variant.mrp)}</td><td><span className={`ad-stock-dot ${!variant.stock ? 'out' : variant.stock <= 5 ? 'low' : 'in'}`} aria-hidden="true"/> {variant.stock ? variant.stock : 'Out of stock'}</td></tr>)}</tbody></table></div>
    <h3>Description</h3><p className="ad-product-detail-description">{detail.description}</p>
    <h3>Product details</h3><p className="ad-product-detail-description" style={{ whiteSpace: 'pre-wrap' }}>{detail.details || detail.description}</p>
  </section>;
    return <section className="ad-products-page">
    <div className="ad-products-heading"><div><h2>Product catalog</h2><p className="ad-muted">Manage your products, inventory, and storefront visibility.</p></div><div className="ad-product-row-actions"><button className="ad-secondary" onClick={() => setManagingCategories(true)}>Manage categories</button><button className="ad-primary" disabled={!catalogCategories.some(c => c.kind === 'category' && c.active)} onClick={() => edit()}>+ Add product</button></div></div>
    {categoryError && <div className="ad-product-error" role="alert">{categoryError} <button className="ad-secondary" onClick={() => setCategoryReload(n => n + 1)}>Retry</button></div>}
    <div className="ad-product-stats" aria-label="Catalog overview">
      {[['Total products', products.length], ['Published', publishedCount], ['Drafts', products.length - publishedCount], ['Out of stock', outOfStockCount]].map(([label, count]) => <div key={label}><span>{label}</span><strong>{loading ? '—' : count}</strong></div>)}
    </div>
    <div className="ad-product-list">
      <nav className="ad-product-tabs" aria-label="Filter products by status">{[['all', 'All products', products.length], ['published', 'Published', publishedCount], ['draft', 'Drafts', products.length - publishedCount]].map(([value, label, count]) => <button key={value} aria-pressed={status === value} onClick={() => { setStatus(String(value)); setPage(1); }}>{label}<span>{loading ? '—' : count}</span></button>)}</nav>
      <div className="ad-product-toolbar">
        <label className="ad-product-search"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></svg><input type="search" aria-label="Search products by name, ID, or category" placeholder="Search products..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }}/></label>
        <select aria-label="Filter by category" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}><option value="all">All categories</option>{catalogCategories.map(c => <option key={c.slug} value={c.slug}>{categoryLabel(c, catalogCategories)}</option>)}</select>
        <select aria-label="Filter by inventory" value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1); }}><option value="all">All inventory</option><option value="in">In stock</option><option value="low">Low stock (1-5)</option><option value="out">Out of stock</option></select>
        <select aria-label="Sort products" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}><option value="recent">Recently updated</option><option value="name">Name: A-Z</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="stock">Stock: low to high</option></select>
        {hasFilters && <button className="ad-secondary" onClick={clearFilters}>Clear filters</button>}
        {selected.length > 0 && <div className="ad-product-bulk-bar" role="group" aria-label="Bulk actions">
          <span>{selected.length} selected</span>
          <button className="ad-secondary" onClick={() => setSelected([])}>Clear</button>
          <button className="ad-secondary ad-danger" onClick={() => { setFormError(''); setBulkDeleting(true); }}>Delete selected</button>
        </div>}
      </div>
      {error && <div role="alert" className="ad-product-error">{error} <button className="ad-secondary" onClick={() => setReload(n => n + 1)}>Retry</button></div>}
      <div className="ad-table-scroll ad-products-table-scroll" tabIndex={0} role="region" aria-label="Product catalog table" aria-busy={loading}>
        <table className="ad-products-table"><thead><tr><th scope="col" className="ad-select-cell"><input type="checkbox" aria-label="Select all products on this page" checked={allOnPageSelected} onChange={toggleAllOnPage} ref={element => { if (element) element.indeterminate = someOnPageSelected && !allOnPageSelected; }}/></th><th scope="col">S.No</th><th scope="col">Product</th><th scope="col">Status</th><th scope="col">Inventory</th><th scope="col">Category</th><th scope="col">MRP</th><th scope="col">Price</th><th scope="col">Homepage</th><th scope="col" className="ad-align-right">Actions</th></tr></thead>
          <tbody>{loading ? Array.from({ length: 5 }, (_, i) => <tr key={i} aria-hidden="true">{Array.from({ length: 10 }, (_, j) => <td key={j}><span className="ad-product-loading"/></td>)}</tr>) : error ? <tr><td colSpan={10} className="ad-empty">Products could not be loaded. Please retry.</td></tr> : !pageProducts.length ? <tr><td colSpan={10}><div className="ad-product-table-empty"><strong>{products.length ? 'No matching products' : 'Your catalog is ready for its first product'}</strong><p>{products.length ? 'Try another search or clear your filters.' : 'Add product details and images to start building your collection.'}</p><button className="ad-secondary" onClick={products.length ? clearFilters : () => edit()}>{products.length ? 'Clear filters' : '+ Add product'}</button></div></td></tr> : pageProducts.map((p, index) => <tr key={p.id} className={`ad-product-clickable-row${selected.includes(p.id) ? ' ad-row-selected' : ''}`} onClick={() => setDetailId(p.id)}>
            <td className="ad-select-cell" onClick={event => event.stopPropagation()}><input type="checkbox" aria-label={`Select ${p.name}`} checked={selected.includes(p.id)} onChange={() => toggleSelected(p.id)}/></td>
            <td className="ad-product-serial">{(currentPage - 1) * pageSize + index + 1}</td>
            <td><div className="ad-table-product"><button className="ad-table-product-photo" onClick={() => setDetailId(p.id)} aria-label={`View details for ${p.name}`}><Image src={p.image} alt="" width={48} height={48}/></button><div><button className="ad-product-name" onClick={() => setDetailId(p.id)}>{p.name}</button><small>/products/{p.slug}</small></div></div></td>
            <td><span className={`ad-status ${p.published ? 'paid' : 'neutral'}`}><i aria-hidden="true"/>{p.published ? 'Published' : 'Draft'}</span></td>
            <td><div className="ad-product-stock"><span className={`ad-stock-dot ${!p.stock ? 'out' : p.stock <= 5 ? 'low' : 'in'}`} aria-hidden="true"/><span>{!p.stock ? 'Out of stock' : `${p.stock} in stock`}</span></div>{!!p.stock && p.stock <= 5 && <small className="ad-stock-hint">Low stock</small>}{(() => { const soldOut = (p.variants ?? []).filter(variant => !variant.stock).length; return !!p.stock && soldOut > 0 && <small className="ad-stock-hint">{soldOut} of {p.variants.length} variants sold out</small>; })()}</td>
            <td className="ad-product-category-cell">{categoryName(p.categorySlug)}</td>
            <td className="ad-product-price-cell">{p.mrp == null ? '—' : formatINR(p.mrp)}</td><td className="ad-product-price-cell">{pricesVary(p) && <small className="ad-muted">From </small>}{p.price}</td>
            <td><div className="ad-product-placement">{p.isNewArrival && <span>New arrival</span>}{p.isBestSeller && <span>Best seller</span>}{p.isFeatured && <span>Featured</span>}{p.isCurated && <span>Curated</span>}{!p.isNewArrival && !p.isBestSeller && !p.isFeatured && !p.isCurated && <span className="ad-muted">&mdash;</span>}</div></td>
            <td><div className="ad-product-row-actions"><button className="ad-secondary" aria-label={`Edit ${p.name}`} onClick={event => { event.stopPropagation(); edit(p); }}>Edit</button><button className="ad-secondary ad-danger" aria-label={`Delete ${p.name}`} onClick={event => { event.stopPropagation(); setFormError(''); setDeleting(p); }}>Delete</button></div></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="ad-product-list-footer"><span role="status" aria-live="polite">{loading ? 'Loading products...' : error ? 'Products unavailable' : visible.length ? `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, visible.length)} of ${visible.length} products` : '0 products'}</span><div><label>Rows per page <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label><span>Page {currentPage} of {pageCount}</span><button className="ad-secondary" aria-label="Previous page" disabled={loading || currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><button className="ad-secondary" aria-label="Next page" disabled={loading || currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>Next</button></div></div>
    </div>
    {deleting && <div className="ad-modal-backdrop" onClick={() => setDeleting(null)}><section className="ad-customer-modal" role="alertdialog" aria-modal="true" aria-labelledby="ad-delete-product-title" onClick={e => e.stopPropagation()}><header><div><h2 id="ad-delete-product-title">Delete product?</h2><p>{deleting.name} and its images will be permanently removed. This cannot be undone.</p></div></header>{formError && <p className="ad-auth-error" role="alert">{formError}</p>}<div className="ad-modal-actions"><button className="ad-secondary" autoFocus onClick={() => setDeleting(null)}>Cancel</button><button className="ad-secondary ad-danger" disabled={saving} onClick={confirmDelete}>{saving ? 'Deleting...' : 'Delete product'}</button></div></section></div>}
    {bulkDeleting && <div className="ad-modal-backdrop" onClick={() => { if (!saving) setBulkDeleting(false); }}><section className="ad-customer-modal" role="alertdialog" aria-modal="true" aria-labelledby="ad-bulk-delete-title" onClick={e => e.stopPropagation()}><header><div><h2 id="ad-bulk-delete-title">Delete selected products?</h2><p>{selected.length === 1 ? '1 product' : `${selected.length} products`} and their images will be permanently removed. This cannot be undone.</p></div></header><div className="ad-modal-actions"><button className="ad-secondary" autoFocus disabled={saving} onClick={() => setBulkDeleting(false)}>Cancel</button><button className="ad-secondary ad-danger" disabled={saving} onClick={confirmBulkDelete}>{saving ? 'Deleting...' : `Delete ${selected.length === 1 ? 'product' : `${selected.length} products`}`}</button></div></section></div>}
  </section>;
}
