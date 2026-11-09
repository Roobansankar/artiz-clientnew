'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
const Context = createContext({ categories: [], error: '', refresh: async () => { } });
export function CategoryProvider({ children }) {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');
    const refresh = useCallback(async () => {
        try {
            const response = await fetch('/api/categories', { cache: 'no-store' });
            if (!response.ok)
                throw new Error('Categories are temporarily unavailable.');
            setCategories((await response.json()).categories);
            setError('');
        }
        catch {
            setError('Categories are temporarily unavailable.');
        }
    }, []);
    useEffect(() => {
        void refresh();
        const update = () => { if (document.visibilityState === 'visible')
            void refresh(); };
        window.addEventListener('focus', update);
        document.addEventListener('visibilitychange', update);
        return () => { window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', update); };
    }, [refresh]);
    return <Context.Provider value={{ categories, error, refresh }}>{children}</Context.Provider>;
}
export const useCategories = () => useContext(Context);
