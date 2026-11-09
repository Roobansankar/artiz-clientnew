import AccountPage from '../../views/AccountPage'

export const metadata = { title: 'My Account | Artiz', description: 'Sign in or create your Artiz account.' }

export default async function Page({ searchParams }) {
  const { mode } = await searchParams
  const initialMode = mode === 'register' ? 'register' : 'login'
  return <AccountPage key={initialMode} initialMode={initialMode} />
}
