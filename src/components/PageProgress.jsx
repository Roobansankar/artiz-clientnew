'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
const startEvent = 'artiz:page-loading';
export function startPageProgress() {
    window.dispatchEvent(new Event(startEvent));
}
export default function PageProgress() {
    const pathname = usePathname();
    const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/admin.login';
    return isAdmin ? <AdminPageProgress /> : null;
}
function AdminPageProgress() {
    const pathname = usePathname();
    const [progress, setProgress] = useState(12);
    const [visible, setVisible] = useState(true);
    const [color, setColor] = useState('#00a155');
    const interval = useRef(null);
    const completion = useRef(null);
    const hide = useRef(null);
    const fallback = useRef(null);
    const finish = useRef(() => { });
    const lastPath = useRef(pathname);
    useEffect(() => {
        const clear = () => {
            if (interval.current)
                clearInterval(interval.current);
            if (completion.current)
                clearTimeout(completion.current);
            if (hide.current)
                clearTimeout(hide.current);
            if (fallback.current)
                clearTimeout(fallback.current);
        };
        const complete = () => {
            if (completion.current)
                clearTimeout(completion.current);
            completion.current = setTimeout(() => {
                if (interval.current)
                    clearInterval(interval.current);
                if (fallback.current)
                    clearTimeout(fallback.current);
                setProgress(100);
                hide.current = setTimeout(() => setVisible(false), 250);
            }, 180);
        };
        finish.current = complete;
        const start = () => {
            clear();
            const admin = document.querySelector('.ad-root');
            setColor(admin ? getComputedStyle(admin).getPropertyValue('--ad-accent').trim() || '#00a155' : getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#684734');
            setProgress(12);
            setVisible(true);
            interval.current = setInterval(() => setProgress(value => Math.min(92, value + (94 - value) * .16)), 220);
            fallback.current = setTimeout(complete, 12000);
        };
        const click = (event) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
                return;
            const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
            if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('download') || (link.target && link.target !== '_self'))
                return;
            const url = new URL(link.href, window.location.href);
            if (url.origin === window.location.origin && url.pathname !== window.location.pathname)
                start();
        };
        const backOrForward = () => { if (window.location.pathname !== lastPath.current)
            start(); };
        start();
        if (document.readyState === 'complete')
            complete();
        window.addEventListener('load', complete);
        window.addEventListener(startEvent, start);
        window.addEventListener('popstate', backOrForward);
        document.addEventListener('click', click, true);
        return () => {
            clear();
            window.removeEventListener('load', complete);
            window.removeEventListener(startEvent, start);
            window.removeEventListener('popstate', backOrForward);
            document.removeEventListener('click', click, true);
        };
    }, []);
    useEffect(() => { lastPath.current = pathname; finish.current(); }, [pathname]);
    return <div className={`page-progress ${visible ? 'is-loading' : ''}`} aria-hidden="true"><span style={{ width: `${progress}%`, transition: progress === 12 ? 'none' : undefined, backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}/></div>;
}
