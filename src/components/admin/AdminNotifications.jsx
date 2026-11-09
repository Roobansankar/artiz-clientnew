'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
const timestamp = (value) => new Date(value).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });
export default function AdminNotifications({ enabled }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [data, setData] = useState({ notifications: [], unreadCount: 0 });
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState('');
    const refresh = useRef(() => { });
    const bell = useRef(null);
    function openContact(id) {
        setOpen(false);
        router.push(`/admin/contact-messages?message=${encodeURIComponent(id)}`);
        window.dispatchEvent(new CustomEvent('artiz:open-contact', { detail: id }));
    }
    const openContactRef = useRef(openContact);
    openContactRef.current = openContact;
    useEffect(() => {
        if (!enabled) {
            setData({ notifications: [], unreadCount: 0 });
            setLoaded(false);
            return;
        }
        const controller = new AbortController();
        const seen = new Set();
        let initialized = false;
        let inFlight = false;
        let newest = 0;
        async function load() {
            if (inFlight || controller.signal.aborted)
                return;
            inFlight = true;
            try {
                const response = await fetch('/api/admin/notifications', { cache: 'no-store', signal: controller.signal });
                if (response.status === 401) {
                    router.replace('/admin/login');
                    return;
                }
                if (!response.ok)
                    throw new Error('Could not load notifications.');
                const result = await response.json();
                if (controller.signal.aborted)
                    return;
                const fresh = result.notifications.filter(n => !seen.has(n.id) && new Date(n.createdAt).getTime() >= newest);
                if (initialized && fresh.length) {
                    const latest = fresh[0];
                    toast.success(fresh.length === 1 ? 'New contact message' : `${fresh.length} new contact messages`, { description: `${latest.name} · ${latest.topic}`, action: { label: 'View message', onClick: () => openContactRef.current(latest.id) } });
                }
                result.notifications.forEach(n => { seen.add(n.id); newest = Math.max(newest, new Date(n.createdAt).getTime()); });
                initialized = true;
                setData(result);
                setLoaded(true);
                setError('');
            }
            catch {
                if (!controller.signal.aborted)
                    setError('Could not load notifications. Please try again.');
            }
            finally {
                inFlight = false;
            }
        }
        refresh.current = () => { void load(); };
        void load();
        const interval = setInterval(() => { if (document.visibilityState === 'visible')
            void load(); }, 5000);
        const focus = () => { if (document.visibilityState === 'visible')
            void load(); };
        window.addEventListener('focus', focus);
        document.addEventListener('visibilitychange', focus);
        window.addEventListener('artiz:contact-updated', focus);
        return () => { controller.abort(); clearInterval(interval); window.removeEventListener('focus', focus); document.removeEventListener('visibilitychange', focus); window.removeEventListener('artiz:contact-updated', focus); };
    }, [enabled, router]);
    useEffect(() => {
        if (!open)
            return;
        const escape = (event) => { if (event.key === 'Escape') {
            setOpen(false);
            bell.current?.focus();
        } };
        window.addEventListener('keydown', escape);
        return () => window.removeEventListener('keydown', escape);
    }, [open]);
    return <>
    <button ref={bell} className="ad-icon-button ad-notification" aria-label={`Open notifications${data.unreadCount ? `, ${data.unreadCount} unread` : ''}`} aria-expanded={open} disabled={!enabled} onClick={() => { setOpen(true); refresh.current(); }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>{data.unreadCount > 0 && <span className="ad-notification-badge">{data.unreadCount > 99 ? '99+' : data.unreadCount}</span>}</button>
    {open && createPortal(<div className="ad-modal-backdrop" onClick={() => setOpen(false)}><aside className="ad-notifications-panel" role="dialog" aria-modal="true" aria-label="Notifications" onClick={e => e.stopPropagation()}><header><div><h2>Notifications {data.unreadCount > 0 && <span className="ad-count">{data.unreadCount}</span>}</h2><p>Contact form submissions · Updates every 5 seconds</p></div><button className="ad-icon-button" aria-label="Close notifications" autoFocus onClick={() => { setOpen(false); bell.current?.focus(); }}>×</button></header>{error && <div className="ad-notification-error" role="alert">{error}<button className="ad-secondary" onClick={() => refresh.current()}>Retry</button></div>}{!loaded && !error ? <div className="ad-empty" role="status">Loading notifications…</div> : !data.notifications.length && !error ? <div className="ad-empty">No notifications yet. New contact messages will appear here.</div> : data.notifications.map(n => <button className={`ad-notification-item ${n.status === 'NEW' ? 'unread' : ''}`} key={n.id} onClick={() => openContact(n.id)}><span className="ad-notification-avatar">{n.name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}</span><span><strong>New contact message {n.status === 'NEW' && <i />}</strong><span>{n.name}</span><p>{n.topic}</p><small>{timestamp(n.createdAt)} IST</small></span><span aria-hidden="true">↗</span></button>)}<footer><button className="ad-secondary" onClick={() => { setOpen(false); router.push('/admin/contact-messages'); }}>View all contact messages →</button></footer></aside></div>, document.querySelector('.ad-root') || document.body)}
  </>;
}
