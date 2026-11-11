import CheckoutPage from '../../views/CheckoutPage'
import { parseDirectCheckout } from '../../lib/direct-checkout'

export const metadata = { title: 'Checkout | Artiz', description: 'Delivery details and secure payment for your Artiz order.' }

export default async function Page({ searchParams }) {
  const { selection, error } = parseDirectCheckout(await searchParams)
  return <CheckoutPage key={selection ? JSON.stringify(selection) : error || 'cart'} directSelection={selection} directError={error} />
}
