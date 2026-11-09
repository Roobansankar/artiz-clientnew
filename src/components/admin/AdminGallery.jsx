'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
export default function AdminGallery() {
    const router = useRouter();
    const [images, setImages] = useState([]);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [alt, setAlt] = useState('');
    const [caption, setCaption] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    useEffect(() => {
        if (!file) {
            setPreview('');
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);
    async function load() {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/gallery', { cache: 'no-store' });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.message);
            setImages(data.images);
            setError('');
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Could not load the gallery.');
        }
        finally {
            setLoading(false);
        }
    }
    useEffect(() => { void load(); }, []);
    async function add(event) {
        event.preventDefault();
        if (!file) {
            setError('Choose an image to upload.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const body = new FormData();
            body.set('alt', alt);
            body.set('caption', caption);
            body.set('image', file);
            const response = await fetch('/api/admin/gallery', { method: 'POST', body });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            const data = await response.json();
            if (!response.ok)
                throw new Error([data.message, ...Object.values(data.errors || {}).flat()].join(' '));
            setImages(current => [data.image, ...current]);
            setFile(null);
            setAlt('');
            setCaption('');
            toast.success('Image added to the gallery');
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Could not upload the image.');
        }
        finally {
            setSaving(false);
        }
    }
    async function remove(id) {
        setSaving(true);
        setError('');
        try {
            const response = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
            if (response.status === 401) {
                router.replace('/admin/login');
                return;
            }
            if (!response.ok && response.status !== 404)
                throw new Error((await response.json()).message || 'Could not delete the image.');
            setImages(current => current.filter(image => image.id !== id));
            setDeleteId(null);
            toast.success('Image deleted');
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Could not delete the image.');
        }
        finally {
            setSaving(false);
        }
    }
    return <section className="ad-gallery">
    {error && <div role="alert" className="ad-product-error">{error}</div>}
    <form className="ad-gallery-form" onSubmit={add}><fieldset disabled={saving}>
      <label className="ad-category-upload">
        {preview
            ? <img className="ad-gallery-preview" src={preview} alt="Selected image preview"/>
            : <span className="ad-category-upload-icon" aria-hidden="true">↑</span>}
        <strong>{file ? file.name : 'Choose an image'}</strong>
        <input aria-label="Gallery image" type="file" accept={imageTypes.join(',')} onChange={event => {
            const selected = event.target.files?.[0];
            event.target.value = '';
            if (!selected)
                return;
            if (selected.size > 8 * 1024 * 1024 || !imageTypes.includes(selected.type)) {
                setError('Choose a JPG, PNG, or WebP image up to 8 MB.');
                return;
            }
            setFile(selected);
            setError('');
        }}/>
        <small>JPG, PNG, or WebP, up to 8 MB.</small>
      </label>
      <div className="ad-gallery-fields">
        <label className="ad-category-field"><span>Image description <span className="ad-required">*</span></span><input required minLength={3} maxLength={200} placeholder="e.g. A walnut bed with linen bedding in a bright room" value={alt} onChange={e => setAlt(e.target.value)}/><small className="ad-muted">Read aloud by screen readers. Describe what the photo shows.</small></label>
        <label className="ad-category-field"><span>Caption <span className="ad-muted">(optional)</span></span><input maxLength={60} placeholder="e.g. Bedroom" value={caption} onChange={e => setCaption(e.target.value)}/><small className="ad-muted">Shown on the photo.</small></label>
        <button className="ad-primary" type="submit">{saving ? 'Saving...' : 'Add to gallery'}</button>
      </div>
    </fieldset></form>
    {loading ? <p className="ad-empty" role="status">Loading gallery...</p> : !images.length ? <p className="ad-empty">No images yet. The gallery page shows its sample photos until you add your first image.</p> : <ul className="ad-gallery-grid">{images.map(image => <li key={image.id}>
      <Image src={image.image} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 640px) 50vw, 240px"/>
      <div className="ad-gallery-meta">
        {image.caption && <strong>{image.caption}</strong>}
        <small className="ad-muted">{image.alt}</small>
        {deleteId === image.id
                    ? <div className="ad-gallery-actions"><button className="ad-secondary ad-danger" disabled={saving} onClick={() => void remove(image.id)}>Confirm delete</button><button className="ad-secondary" disabled={saving} onClick={() => setDeleteId(null)}>Cancel</button></div>
                    : <div className="ad-gallery-actions"><button className="ad-secondary" disabled={saving} onClick={() => setDeleteId(image.id)}>Delete</button></div>}
      </div>
    </li>)}</ul>}
  </section>;
}
