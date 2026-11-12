'use client';
import { useState } from 'react';
export default function AdminLoginForm({ onAuthenticated }) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    async function submit(event) {
        event.preventDefault();
        if (pending)
            return;
        const form = new FormData(event.currentTarget);
        setPending(true);
        setError('');
        try {
            const response = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
                signal: AbortSignal.timeout(15000),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || 'Unable to sign in. Please try again.');
                return;
            }
            onAuthenticated(data.admin);
        }
        catch {
            setError('Unable to reach the server. Please try again.');
        }
        finally {
            setPending(false);
        }
    }
    return <form onSubmit={submit} aria-busy={pending}>
    <label>Email or username<input type="text" name="email" placeholder="admin@artiz.com or username" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={254} required disabled={pending}/></label>
    <label>Password<div className="ad-password"><input type={showPassword ? 'text' : 'password'} name="password" placeholder="Enter your password" autoComplete="current-password" maxLength={72} required disabled={pending}/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{showPassword && <path d="m3 3 18 18"/>}</svg></button></div></label>
    {error && <p className="ad-auth-error" role="alert">{error}</p>}
    <button className="ad-primary ad-login-submit" disabled={pending}>{pending ? <><span className="ad-auth-spinner"/>Signing in…</> : <>Sign in <span>→</span></>}</button>
  </form>;
}
