import { notFound } from 'next/navigation'

export const metadata = { title: 'Artiz Admin workspace' }

export default async function AdminPage({ params }) {
  const { slug } = await params
  if (slug?.[0] === 'inbox') notFound()
  return null
}
