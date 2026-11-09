export const mainCategories = (categories) => categories.filter(c => c.kind === 'category' && !c.parentSlug);
export function categoryPath(slug, categories) {
    const path = [];
    const seen = new Set();
    let current = categories.find(c => c.slug === slug);
    while (current && !seen.has(current.slug)) {
        path.unshift(current);
        seen.add(current.slug);
        current = categories.find(c => c.slug === current.parentSlug);
    }
    return path;
}
export function categoryLabel(category, categories) {
    const names = [category.name];
    const seen = new Set([category.slug]);
    let parent = categories.find(c => c.slug === category.parentSlug);
    while (parent && !seen.has(parent.slug)) {
        names.unshift(parent.name);
        seen.add(parent.slug);
        parent = categories.find(c => c.slug === parent.parentSlug);
    }
    return names.join(' → ');
}
export function categoryImage(category, categories) {
    const seen = new Set();
    let current = category;
    while (current && !seen.has(current.slug)) {
        if (current.image)
            return current.image;
        seen.add(current.slug);
        current = categories.find(c => c.slug === current.parentSlug);
    }
    return '/images/categories/decor.jpg';
}
export function matchesCategory(product, slug, categories) {
    const descendants = new Set([slug]);
    let changed = true;
    while (changed) {
        changed = false;
        for (const category of categories)
            if (category.parentSlug && descendants.has(category.parentSlug) && !descendants.has(category.slug)) {
                descendants.add(category.slug);
                changed = true;
            }
    }
    return [product.categorySlug, ...(product.collectionSlugs || [])].some(s => descendants.has(s));
}
