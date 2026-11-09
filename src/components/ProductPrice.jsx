import { pricesVary } from '@/lib/variants';
// Whole rupees show no paise (₹2,600); other amounts show two places (₹2,600.50).
export const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 }).format(amount);
// Without a chosen colour, the cheapest colour is shown, marked "From" when colours cost different amounts.
export default function ProductPrice({ product, option }) {
    const price = option ? option.price : product.amount;
    const mrp = option ? option.mrp : product.mrp;
    const discounted = mrp != null && price != null && mrp > price;
    const from = !option && pricesVary(product);
    return <span className="store-product-price">{discounted && <del aria-label={`MRP ${formatINR(mrp)}`}>{formatINR(mrp)}</del>}<span aria-label="Selling price">{from && <small className="store-price-from">From </small>}{price == null ? product.price : formatINR(price)}</span></span>;
}
