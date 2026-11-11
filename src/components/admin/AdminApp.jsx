'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AdminOrders from './AdminOrders';
import AdminOrderDetail from './AdminOrderDetail';
import AdminCustomers from './AdminCustomers';
import AdminProducts from './AdminProducts';
import AdminGallery from './AdminGallery';
import AdminHero from './AdminHero';
import './admin.css';
import AdminDashboard from './AdminDashboard';
import ContactMessages from './ContactMessages';
import AdminNotifications from './AdminNotifications';
import AdminContentSkeleton from './AdminContentSkeleton';
import AdminLoginForm from './AdminLoginForm';
import { startPageProgress } from '@/components/PageProgress';
const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-8h6v8"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3"/></>,
    settings: <><path d="m10 3-1 3-3 1-3 1 1 4-1 4 3 1 3 1 1 3h4l1-3 3-1 3-1-1-4 1-4-3-1-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/></>,
    search: <><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></>,
    bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>,
    plus: <path d="M12 5v14M5 12h14"/>, chevron: <path d="m8 4 4 4 4-4M8 20l4-4 4 4"/>,
    panel: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M13 8l4 4-4 4"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
    moon: <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/>,
    palette: <><path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-4c-2-1-1-3 1-3h3a3 3 0 0 0 3-3 9 9 0 0 0-9-8Z"/><path d="M7 9h.01M11 6h.01M16 8h.01M6 14h.01"/></>,
    logout: <path d="M9 4H4v16h5M9 12h12m-4-4 4 4-4 4"/>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1 .7-1.7 1.2-1.7 2.7M12 17h.01"/></>,
    message: <path d="M21 11.5a8.5 8.5 0 0 1-9 8.5 9 9 0 0 1-4-.9L3 21l1.9-5a9 9 0 0 1-.9-4 8.5 8.5 0 1 1 17-.5Z"/>,
    box: <path d="m12 3 9 5v9l-9 5-9-5V8Zm-9 5 9 5 9-5M12 13v9M7 5.8l9 5"/>,
    cart: <><path d="M2 3h3l3 13h11l3-9H6"/><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/></>,
    chart: <path d="M4 3v18h17M8 16v-5m5 5V7m5 9V3"/>,
    dollar: <><circle cx="12" cy="12" r="9"/><path d="M12 6v12m3-10h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9"/></>,
    pie: <><path d="M12 3v9h9A9 9 0 0 0 12 3Z"/><path d="M8 4a9 9 0 1 0 12 12H8Z"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>,
    arrow: <path d="m7 17 10-10M7 7h10v10"/>, close: <path d="m6 6 12 12M6 18 18 6"/>,
    check: <path d="m5 12 4 4L19 6"/>, download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m21 16-5-5-9 9"/></>,
    more: <><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></>,
};
function Icon({ name, size = 18 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>; }
const nav = [
    { label: 'Home', path: '/admin', icon: 'home' },
    { label: 'Home Hero', path: '/admin/home-hero', icon: 'image' },
    { label: 'Contact Messages', path: '/admin/contact-messages', icon: 'message' },
    { label: 'Customers', path: '/admin/customers', icon: 'users' }, { label: 'Orders', path: '/admin/orders', icon: 'cart' },
    { label: 'Products', path: '/admin/products', icon: 'box' }, { label: 'Gallery', path: '/admin/gallery', icon: 'image' }, { label: 'Analytics', path: '/admin/analytics', icon: 'chart' },
];
const settingLinks = ['General', 'Members', 'Notifications', 'Security'];
const colors = [{ name: 'Green', value: '#00a155' }, { name: 'Blue', value: '#2563eb' }, { name: 'Violet', value: '#7c3aed' }, { name: 'Rose', value: '#e11d48' }, { name: 'Orange', value: '#ea580c' }];
export default function AdminApp({ login = false }) {
    const pathname = usePathname();
    const router = useRouter();
    const isLogin = login || pathname === '/admin/login';
    const [admin, setAdmin] = useState(null);
    const [error, setError] = useState('');
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        if (isLogin)
            return;
        const controller = new AbortController();
        setError('');
        fetch('/api/admin/auth/me', { cache: 'no-store', credentials: 'same-origin', signal: controller.signal })
            .then(async (response) => {
            if (response.status === 401) {
                setAdmin(null);
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message || 'Unable to verify your session.');
            setAdmin(data.admin);
        })
            .catch(e => { if (!controller.signal.aborted) {
            setError(e.message || 'Unable to connect to the admin server.');
        } });
        return () => controller.abort();
    }, [isLogin, pathname, retry, router]);
    async function logout() {
        const response = await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'same-origin' });
        if (!response.ok)
            throw new Error('Sign out failed.');
        setAdmin(null);
        startPageProgress();
        router.replace('/admin/login');
        router.refresh();
    }
    return <AdminWorkspace login={isLogin} admin={admin} contentLoading={!isLogin && !admin} authError={isLogin ? '' : error} onRetry={() => setRetry(r => r + 1)} onAuthenticated={account => { setAdmin(account); startPageProgress(); router.push('/admin'); }} onLogout={logout}/>;
}
function AdminWorkspace({ login = false, admin, contentLoading, authError, onRetry, onAuthenticated, onLogout }) {
    const pathname = usePathname();
    const router = useRouter();
    const isLogin = login || pathname === '/admin/login';
    const isSettings = pathname.startsWith('/admin/settings');
    const section = isSettings ? 'Settings' : pathname.startsWith('/admin/products/') ? 'Products' : pathname.startsWith('/admin/orders/') ? 'Orders' : nav.find(n => n.path === pathname)?.label || 'Home';
    const settingsTab = pathname.split('/')[3] || 'general';
    const [dark, setDark] = useState(false);
    const [accent, setAccent] = useState(colors[0].value);
    const [menu, setMenu] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(true);
    const [themeOpen, setThemeOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [navQuery, setNavQuery] = useState('');
    const [period, setPeriod] = useState('Daily');
    const [range, setRange] = useState('Last 14 days');
    const [notice, setNotice] = useState('');
    const searchRef = useRef(null);
    useEffect(() => {
        setDark(localStorage.getItem('artiz-admin-dark') === 'true');
        const saved = localStorage.getItem('artiz-admin-accent');
        if (saved && colors.some(c => c.value === saved))
            setAccent(saved);
    }, []);
    useEffect(() => { setMenu(false); setProfileOpen(false); }, [pathname]);
    useEffect(() => { if (!notice)
        return; const t = setTimeout(() => setNotice(''), 4500); return () => clearTimeout(t); }, [notice]);
    useEffect(() => { if (searchOpen)
        searchRef.current?.focus(); }, [searchOpen]);
    useEffect(() => { const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(o => !o);
    } if (e.key === 'Escape') {
        setSearchOpen(false);
        setThemeOpen(false);
        setMenu(false);
    } }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, []);
    const chooseMode = (value) => { document.documentElement.dataset.adminTheme = value ? 'dark' : 'light'; setDark(value); localStorage.setItem('artiz-admin-dark', String(value)); };
    const chooseColor = (value) => { setAccent(value); localStorage.setItem('artiz-admin-accent', value); };
    const appearance = <div className="ad-appearance"><button className="ad-icon-button" aria-label="Choose theme color" aria-expanded={themeOpen} onClick={() => setThemeOpen(!themeOpen)}><Icon name="palette"/></button><button className="ad-icon-button" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => chooseMode(!dark)}><Icon name={dark ? 'sun' : 'moon'}/></button>{themeOpen && <div className="ad-theme-popover"><strong>Theme color</strong><p>Customize your workspace.</p><div className="ad-color-options">{colors.map(c => <button key={c.name} onClick={() => chooseColor(c.value)} aria-pressed={accent === c.value} className={accent === c.value ? 'selected' : ''}><i style={{ background: c.value }}/>{c.name}{accent === c.value && <Icon name="check" size={13}/>}</button>)}</div></div>}</div>;
    return <div className={`ad-root ${dark ? 'ad-dark' : ''} ${collapsed ? 'ad-collapsed' : ''}`} style={{ '--ad-accent': accent }}>
    {isLogin ? <main className="ad-login"><Link href="/" className="ad-login-brand"><span className="ad-logo">A</span>Artiz <span>Admin</span></Link><div className="ad-login-tools">{appearance}</div><section className="ad-login-card"><div className="ad-login-symbol"><Icon name="lock" size={25}/></div><h1>Log in to your account</h1><p>Welcome back! Enter your details to continue.</p><AdminLoginForm onAuthenticated={onAuthenticated}/><div className="ad-login-divider"><span>Admin access</span></div><p className="ad-login-demo">Sign in with your Artiz administrator account.</p><Link href="/" className="ad-back">← Back to Artiz storefront</Link></section><footer className="ad-login-footer">© 2026 Artiz. All rights reserved.</footer></main> : <>
      {menu && <button className="ad-overlay" aria-label="Close navigation" onClick={() => setMenu(false)}/>}
      <aside className={`ad-sidebar ${menu ? 'open' : ''}`}><Link href="/admin" className="ad-team"><span className="ad-logo">A</span><strong className="ad-sidebar-text">Artiz</strong><span className="ad-team-tag ad-sidebar-text">Workspace</span><span className="ad-sidebar-text ad-team-chevron"><Icon name="chevron" size={15}/></span></Link><div className="ad-sidebar-body"><button className="ad-sidebar-search" onClick={() => setSearchOpen(true)} title="Search navigation"><Icon name="search" size={17}/><span className="ad-sidebar-text">Search...</span><kbd className="ad-sidebar-text">Ctrl K</kbd></button><nav aria-label="Admin navigation">{nav.map(n => <Link key={n.path} href={n.path} title={n.label} className={section === n.label ? 'active' : ''}><Icon name={n.icon}/><span className="ad-sidebar-text">{n.label}</span>{n.badge && <span className="ad-count ad-sidebar-text">{n.badge}</span>}</Link>)}<button type="button" title="Settings" className={`ad-settings-trigger ${isSettings ? 'active' : ''}`} aria-expanded={settingsOpen} aria-controls="ad-settings-submenu" onClick={() => { if (collapsed) {
            setCollapsed(false);
            setSettingsOpen(true);
        }
        else {
            setSettingsOpen(!settingsOpen);
        } }}><Icon name="settings"/><span className="ad-sidebar-text">Settings</span><span className={`ad-settings-chevron ad-sidebar-text ${settingsOpen ? 'open' : ''}`}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span></button><div id="ad-settings-submenu" className="ad-subnav ad-sidebar-text" hidden={!settingsOpen}>{settingLinks.map(n => <Link key={n} href={n === 'General' ? '/admin/settings' : '/admin/settings/' + n.toLowerCase()} className={isSettings && settingsTab === n.toLowerCase() ? 'active' : ''}>{n}</Link>)}</div></nav><div className="ad-sidebar-links"><button title="Feedback" onClick={() => setNotice('This is a frontend preview. Feedback integration will be available when the backend is connected.')}><Icon name="message"/><span className="ad-sidebar-text">Feedback</span><span className="ad-sidebar-text ad-link-arrow">↗</span></button><button title="Help & Support" onClick={() => setNotice('Demo help: use the sidebar to explore pages. Customize colors with the palette button and switch modes with the sun or moon.')}><Icon name="help"/><span className="ad-sidebar-text">Help & Support</span><span className="ad-sidebar-text ad-link-arrow">↗</span></button></div></div><div className="ad-sidebar-footer">{profileOpen && <div className="ad-profile-menu"><strong>{admin?.name}</strong><span>{admin?.email}</span><Link href="/admin/settings"><Icon name="settings" size={16}/>Settings</Link><button onClick={() => chooseMode(!dark)}><Icon name={dark ? 'sun' : 'moon'} size={16}/>{dark ? 'Light mode' : 'Dark mode'}</button><button onClick={async () => { try {
            await onLogout();
        }
        catch {
            setNotice('Could not sign out. Please try again.');
        } }}><Icon name="logout" size={16}/>Log out</button></div>}<button className="ad-profile" title="Account menu" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><span className="ad-avatar">AD</span><span className="ad-sidebar-text">{admin?.name || 'Admin'}</span><span className="ad-sidebar-text ad-team-chevron"><Icon name="chevron" size={15}/></span></button></div></aside>
      <div className="ad-workarea"><header className="ad-topbar"><div className="ad-topbar-title"><button className="ad-icon-button ad-desktop-collapse" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed(!collapsed)}><Icon name="panel"/></button><button className="ad-icon-button ad-mobile-menu" aria-label="Open navigation" onClick={() => setMenu(true)}><Icon name="panel"/></button><h1>{section}</h1></div><div className="ad-topbar-actions">{appearance}<AdminNotifications enabled={!!admin && !isLogin}/></div></header>
      {(section === 'Home' || section === 'Analytics') && <div className="ad-toolbar"><div className="ad-date-select"><Icon name="calendar" size={16}/><select aria-label="Date range" value={range} onChange={e => setRange(e.target.value)}><option>Last 14 days</option><option>Last 7 days</option><option>Last 30 days</option></select></div><span className="ad-toolbar-separator"/><select className="ad-period" aria-label="Chart interval" value={period} onChange={e => setPeriod(e.target.value)}><option>Daily</option><option>Weekly</option><option>Monthly</option></select><span className="ad-muted ad-small">India time</span></div>}
      {isSettings && <nav className="ad-settings-tabs" aria-label="Settings tabs">{settingLinks.map(n => <Link key={n} href={n === 'General' ? '/admin/settings' : '/admin/settings/' + n.toLowerCase()} className={settingsTab === n.toLowerCase() ? 'active' : ''}>{n}</Link>)}</nav>}
      <main className="ad-main" aria-busy={contentLoading}>
      {authError ? <section className="ad-workspace-error" role="alert"><h2>Could not load this page</h2><p>{authError}</p><button className="ad-primary" onClick={onRetry}>Try again</button><Link href="/admin/login">Back to login</Link></section> : contentLoading ? <AdminContentSkeleton section={section}/> : <>
      {(section === 'Home' || section === 'Analytics') && <AdminDashboard range={range} period={period}/>} 
      {section === 'Contact Messages' && <ContactMessages />}
      {section === 'Orders' && (pathname.startsWith('/admin/orders/') ? <AdminOrderDetail id={pathname.split('/')[3]} /> : <AdminOrders notify={setNotice}/>)}
      {section === 'Customers' && <AdminCustomers />}
      {section === 'Products' && <AdminProducts />}
      {section === 'Gallery' && <AdminGallery />}
      {section === 'Home Hero' && <AdminHero />}
      {isSettings && settingsTab === 'general' && <><div className="ad-settings-heading"><div><h2>Profile</h2><p>Manage your profile and store details.</p></div><button className="ad-neutral-button" type="submit" form="ad-profile-settings">Save changes</button></div><form id="ad-profile-settings" className="ad-settings-card" onSubmit={e => { e.preventDefault(); localStorage.setItem('artiz-admin-settings', JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))); setNotice('Profile updated in this browser.'); }}><ProfileFields admin={admin}/></form><div className="ad-settings-heading"><div><h2>Appearance</h2><p>Customize the look and feel of your workspace.</p></div></div><div className="ad-settings-card"><div className="ad-setting-row"><div><strong>Color mode</strong><p>Choose light or dark mode.</p></div><div className="ad-mode-options"><button className={!dark ? 'selected' : ''} onClick={() => chooseMode(false)}><Icon name="sun" size={16}/>Light</button><button className={dark ? 'selected' : ''} onClick={() => chooseMode(true)}><Icon name="moon" size={16}/>Dark</button></div></div><div className="ad-setting-row"><div><strong>Primary color</strong><p>Your accent color across the admin area.</p></div><div className="ad-color-options">{colors.map(c => <button key={c.name} aria-pressed={accent === c.value} className={accent === c.value ? 'selected' : ''} onClick={() => chooseColor(c.value)}><i style={{ background: c.value }}/>{c.name}</button>)}</div></div></div></>}
      {isSettings && settingsTab === 'members' && <><div className="ad-settings-heading"><div><h2>Team members</h2><p>Manage the people who have access to your workspace.</p></div></div><div className="ad-settings-card">{[{ name: 'Admin', email: 'admin@artiz.com', role: 'Owner' }, { name: 'Priya Verma', email: 'priya@example.com', role: 'Editor' }, { name: 'Arjun Rao', email: 'arjun@example.com', role: 'Viewer' }].map(m => <div key={m.email} className="ad-member"><span className="ad-avatar">{m.name.slice(0, 2).toUpperCase()}</span><div><strong>{m.name}</strong><small>{m.email}</small></div><span className="ad-status neutral">{m.role}</span></div>)}</div></>}
      {isSettings && settingsTab === 'notifications' && <NotificationSettings notify={setNotice}/>}
      {isSettings && settingsTab === 'security' && <><div className="ad-settings-heading"><div><h2>Password</h2><p>Update the password associated with your account.</p></div></div><form className="ad-settings-card ad-security-form" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); if (f.get('new') !== f.get('confirm')) {
                setNotice('The new passwords do not match.');
                return;
            } setNotice('Password form validated. This demo does not change your account.'); e.currentTarget.reset(); }}><label>Current password<input type="password" name="current" autoComplete="current-password" required/></label><label>New password<input type="password" name="new" autoComplete="new-password" minLength={8} required/></label><label>Confirm new password<input type="password" name="confirm" autoComplete="new-password" minLength={8} required/></label><button className="ad-primary">Update password</button><p className="ad-muted ad-small">UI preview only. No password is stored or changed.</p></form></>}
      </>}</main></div>
    </>}
    {notice && <div className="ad-toast" role="status"><span className="ad-toast-check"><Icon name="check" size={18}/></span><div><strong>Workspace update</strong><p>{notice}</p></div><button className="ad-icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}><Icon name="close" size={15}/></button></div>}
    {searchOpen && <div className="ad-modal-backdrop" onClick={() => setSearchOpen(false)}><section className="ad-search-dialog" role="dialog" aria-modal="true" aria-label="Search pages" onClick={e => e.stopPropagation()}><div className="ad-command-input"><Icon name="search"/><input ref={searchRef} value={navQuery} onChange={e => setNavQuery(e.target.value)} placeholder="Search pages..." aria-label="Search admin pages"/><button className="ad-icon-button" aria-label="Close search" onClick={() => setSearchOpen(false)}><Icon name="close" size={16}/></button></div><p>Go to</p>{[...nav, { label: 'Settings', path: '/admin/settings', icon: 'settings' }].filter(n => n.label.toLowerCase().includes(navQuery.toLowerCase())).map(n => <Link key={n.path} href={n.path} onClick={() => { setSearchOpen(false); setNavQuery(''); }}><Icon name={n.icon}/>{n.label}<span>↵</span></Link>)}{![...nav.map(n => n.label), 'Settings'].some(n => n.toLowerCase().includes(navQuery.toLowerCase())) && <div className="ad-empty">No pages found.</div>}</section></div>}
  </div>;
}
function ProfileFields({ admin }) {
    const [values, setValues] = useState({ name: admin?.name || 'Admin', email: admin?.email || '', username: 'artizadmin', store: 'Artiz Home & Living', bio: '' });
    useEffect(() => { try {
        const saved = localStorage.getItem('artiz-admin-settings');
        if (saved) {
            const data = JSON.parse(saved);
            setValues(v => ({ ...v, ...Object.fromEntries(Object.entries(data).filter(([k, value]) => k in v && typeof value === 'string')) }));
        }
    }
    catch { /* Retain defaults if local settings are invalid. */ } }, []);
    const descriptions = { name: 'Will appear on receipts and other communication.', email: 'Used for account updates and store communication.', username: 'Your unique username in this workspace.', store: 'The name displayed for your store.', bio: 'A brief description of your profile or store.' };
    return <>{Object.entries(values).map(([name, value]) => <label className="ad-setting-row" key={name}><span><strong>{name === 'store' ? 'Store name' : name.charAt(0).toUpperCase() + name.slice(1)}{name !== 'bio' && <em>*</em>}</strong><span className="ad-field-description">{descriptions[name]}</span></span>{name === 'bio' ? <textarea name={name} rows={4} value={value} onChange={e => setValues({ ...values, [name]: e.target.value })} placeholder="Tell us a little about your store..."/> : <input name={name} type={name === 'email' ? 'email' : 'text'} value={value} onChange={e => setValues({ ...values, [name]: e.target.value })} required/>}</label>)}</>;
}
function NotificationSettings({ notify }) {
    const [preferences, setPreferences] = useState({ 'New orders': true, 'Customer messages': true, 'Low stock alerts': true, 'Weekly summary': false });
    useEffect(() => { try {
        const saved = localStorage.getItem('artiz-admin-notifications');
        if (saved)
            setPreferences(p => ({ ...p, ...JSON.parse(saved) }));
    }
    catch { /* Retain defaults. */ } }, []);
    return <><div className="ad-settings-heading"><div><h2>Notifications</h2><p>Choose the updates you would like to receive.</p></div></div><div className="ad-settings-card">{Object.entries(preferences).map(([name, enabled]) => <div className="ad-setting-row" key={name}><div><strong>{name}</strong><p>Receive updates about {name.toLowerCase()}.</p></div><button role="switch" aria-checked={enabled} aria-label={name} className={`ad-switch ${enabled ? 'on' : ''}`} onClick={() => { const next = { ...preferences, [name]: !enabled }; setPreferences(next); localStorage.setItem('artiz-admin-notifications', JSON.stringify(next)); notify('Notification preference saved on this device.'); }}><span /></button></div>)}</div></>;
}
