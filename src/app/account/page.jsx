import AccountPage from '../../views/AccountPage'
import { checkoutReturnPath } from '../../lib/direct-checkout'

export const metadata = { title: 'My Account | Artiz', description: 'Sign in or create your Artiz account.' }

export default async function Page({ searchParams }) {
  const { mode, auth_error, next } = await searchParams
  const initialMode = mode === 'register' ? 'register' : 'login'
  const authErrors = {
    google_unavailable: 'Google sign-in is not configured yet. Please use email and password.',
    google_cancelled: 'Google sign-in was cancelled. You can try again.',
    invalid_state: 'Your Google sign-in request expired. Please try again.',
    account_exists: 'This email already has an account. Please sign in with your email and password.',
    google_failed: 'Google sign-in could not be completed. Please try again.',
  }
  return <AccountPage key={`${initialMode}:${auth_error || ''}`} initialMode={initialMode} initialAuthError={authErrors[auth_error] || ''} returnTo={checkoutReturnPath(next)} />
}
