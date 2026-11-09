'use client';
import { categoryPath, mainCategories } from '@/lib/category-types';
export default function ProductCategoryPicker({ categories, value, onChange }) {
    const path = categoryPath(value, categories);
    const roots = mainCategories(categories);
    const main = roots.some(c => c.slug === path[0]?.slug) ? path[0].slug : '';
    const category = main ? path[1]?.slug || '' : '';
    const subcategory = main ? path[2]?.slug || '' : '';
    const options = (parent) => categories.filter(c => c.kind === 'category' && c.parentSlug === parent && (c.active || path.some(p => p.slug === c.slug)));
    const children = main ? options(main) : [];
    const grandchildren = category ? options(category) : [];
    return <div className="ad-category-picker ad-editor-wide">
    <label><span>Main category</span><select aria-label="Main category" required value={main} onChange={e => onChange(e.target.value)}><option value="">Choose main category</option>{roots.filter(c => c.active || c.slug === main).map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
    <label><span>Category</span><select aria-label="Category" required={children.length > 0} disabled={!main || !children.length} value={category} onChange={e => onChange(e.target.value || main)}><option value="">{main && !children.length ? 'No categories yet' : 'Choose category'}</option>{children.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
    <label><span>Subcategory</span><select aria-label="Subcategory" required={grandchildren.length > 0} disabled={!category || !grandchildren.length} value={subcategory} onChange={e => onChange(e.target.value || category)}><option value="">{category && !grandchildren.length ? 'No subcategories' : 'Choose subcategory'}</option>{grandchildren.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
    {value && !main && <p className="ad-muted ad-editor-wide">Current assignment: {path.map(c => c.name).join(' / ') || value}. Choose its main category, category, and subcategory above.</p>}
  </div>;
}
