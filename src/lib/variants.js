export const variantAttributes = ['seater', 'size', 'color', 'fabric'];
export const attributeLabels = { seater: 'Seater', size: 'Size', color: 'Colour', fabric: 'Fabric' };
// The price, MRP and stock of one variant (by index). Products without variants
// fall back to their own fields; a variant that no longer exists has no stock.
export function optionOf(product, index) {
    const variants = product.variants ?? [];
    if (!variants.length)
        return { price: product.amount ?? 0, mrp: product.mrp ?? null, stock: product.stock ?? 0 };
    return variants[index ?? 0] ?? { price: product.amount ?? 0, mrp: product.mrp ?? null, stock: 0 };
}
export const firstAvailable = (product) => Math.max(0, (product.variants ?? []).findIndex(option => option.stock > 0));
export const pricesVary = (product) => new Set((product.variants ?? []).map(option => option.price)).size > 1;
// The attributes this product's variants actually use, with their values in admin order.
export function attributesOf(variants = []) {
    return variantAttributes
        .map(key => ({ key, values: [...new Set(variants.map(v => v[key]).filter((value) => !!value))] }))
        .filter(attribute => attribute.values.length > 0);
}
// "3-Seater · King · Velvet" (colour is shown as a swatch, so it is left out unless asked).
export const variantLabel = (variant, withColour = false) => variantAttributes.filter(key => withColour || key !== 'color').map(key => variant[key]).filter(Boolean).join(' · ');
