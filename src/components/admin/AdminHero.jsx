'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from '../ProductImage'

const blank = () => ({ name: '', alt: '', mode: 'text', titleBefore: '', titleAccent: '', titleAfter: '', description: '', buttonText: 'Shop Now', buttonHref: '/shop/furniture', textTone: 'dark', alignment: 'center', imageFit: 'cover', active: true })
export default function AdminHero() {
  const router = useRouter()
  const [slides, setSlides] = useState([])
  const [editor, setEditor] = useState(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [mobileFile, setMobileFile] = useState(null)
  const [mobilePreview, setMobilePreview] = useState('')
  const [previewMode, setPreviewMode] = useState('desktop')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(null)
  useEffect(() => {
    if (!file) { setPreview(''); return }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])
  useEffect(() => {
    if (!mobileFile) { setMobilePreview(''); return }
    const url = URL.createObjectURL(mobileFile)
    setMobilePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [mobileFile])
  async function api(path = '', options = {}) {
    const response = await fetch(`/api/admin/hero-slides${path}`, { cache: 'no-store', ...options })
    if (response.status === 401) { router.replace('/admin/login'); throw new Error('Please sign in again.') }
    if (response.status === 204) return null
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Could not update hero slides.')
    return data
  }
  async function load() {
    setLoading(true)
    try { setSlides((await api()).slides); setError('') }
    catch (reason) { setError(reason.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  function edit(slide = blank()) { setEditor({ ...slide, removeMobileImage: false }); setFile(null); setMobileFile(null); setPreviewMode('desktop'); setError(''); setDeleting(null) }
  function field(key, value) { setEditor(current => ({ ...current, [key]: value })) }
  function changed() {
    // Clear the Next Router Cache so navigation home gets the just-saved slides.
    router.refresh()
    try { localStorage.setItem('artiz-hero-updated', String(Date.now())) } catch {}
  }
  async function save(event) {
    event.preventDefault()
    if (!editor.id && !file) { setError('Choose a hero image.'); return }
    setBusy(true); setError('')
    try {
      const body = new FormData()
      body.set('data', JSON.stringify(editor))
      if (file) body.set('image', file)
      if (mobileFile) body.set('mobileImage', mobileFile)
      const { slide } = await api(editor.id ? `/${editor.id}` : '', { method: editor.id ? 'PATCH' : 'POST', body })
      setSlides(current => [...current.filter(item => item.id !== slide.id), slide].sort((a, b) => a.sortOrder - b.sortOrder))
      setEditor(null); setFile(null); setMobileFile(null); changed(); toast.success('Home hero saved')
    } catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }
  async function action(work, message) {
    setBusy(true); setError('')
    try { await work(); changed(); toast.success(message) }
    catch (reason) { setError(reason.message) }
    finally { setBusy(false) }
  }
  function move(index, offset) {
    const ordered = [...slides]
    ;[ordered[index], ordered[index + offset]] = [ordered[index + offset], ordered[index]]
    void action(async () => setSlides((await api('/order', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: ordered.map(item => item.id) }) })).slides), 'Slide order saved')
  }
  const desktopImage = preview || editor?.image
  const mobileImage = mobilePreview || (!editor?.removeMobileImage && editor?.mobileImage) || ''
  const selectedImage = previewMode === 'mobile' ? mobileImage || desktopImage : desktopImage
  const isFilePreview = previewMode === 'mobile' && mobileImage ? Boolean(mobilePreview) : Boolean(preview)
  return <section className="ad-hero-manager">
    <div className="ad-page-actions"><div><h2>Home hero</h2><p className="ad-muted">Manage the first banner on your homepage. Use up to 10 slides.</p></div><button type="button" disabled={busy || loading || slides.length >= 10} className="ad-primary" onClick={() => edit()}>Add slide</button></div>
    {error && <div role="alert" className="ad-product-error">{error}{!editor && <button className="ad-secondary" disabled={busy} onClick={load}>Reload slides</button>}</div>}
    {editor && <form className="ad-hero-editor" onSubmit={save}><fieldset disabled={busy}>
      <div className="ad-page-actions"><h3>{editor.id ? 'Edit slide' : 'New slide'}</h3><button type="button" className="ad-secondary" onClick={() => { setEditor(null); setFile(null); setMobileFile(null); setError('') }}>Cancel</button></div>
      <div className="ad-hero-fields">
        <label className="ad-category-field"><span>Slide name *</span><input required minLength={2} maxLength={100} value={editor.name} onChange={event => field('name', event.target.value)} /></label>
        <label className="ad-category-field"><span>Slide type</span><select aria-label="Slide type" value={editor.mode} onChange={event => field('mode', event.target.value)}><option value="text">Image + text</option><option value="image">Image only</option></select></label>
        <label className="ad-category-field"><span>Desktop hero image {editor.id ? '(optional replacement)' : '*'}</span><input aria-label="Hero image" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
          const chosen = event.target.files?.[0]; event.target.value = ''
          if (!chosen) return
          if (chosen.size > 8 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(chosen.type)) { setError('Choose a JPG, PNG or WebP image up to 8 MB.'); return }
          setFile(chosen); setError('')
        }} /><small className="ad-muted">Recommended desktop size: 2400 × 900 pixels. JPG, PNG or WebP, up to 8 MB.</small></label>
        <div className="ad-category-field"><label><span>Mobile hero image (optional)</span><input aria-label="Mobile hero image" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => {
          const chosen = event.target.files?.[0]; event.target.value = ''
          if (!chosen) return
          if (chosen.size > 8 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(chosen.type)) { setError('Choose a JPG, PNG or WebP mobile image up to 8 MB.'); return }
          setMobileFile(chosen); field('removeMobileImage', false); setPreviewMode('mobile'); setError('')
        }} /></label><small className="ad-muted">Recommended mobile size: 900 × 1100 pixels. Used below 768px. Up to 8 MB. Without it, the desktop image is used.</small>
          {mobileImage && <button type="button" className="ad-secondary" onClick={() => { setMobileFile(null); field('removeMobileImage', true) }}>Remove mobile image</button>}
        </div>
        <label className="ad-category-field"><span>Image description</span><input maxLength={200} value={editor.alt} onChange={event => field('alt', event.target.value)} placeholder="Describe the image for screen readers" /></label>
        <label className="ad-category-field"><span>Image fit</span><select aria-label="Image fit" value={editor.imageFit} onChange={event => field('imageFit', event.target.value)}><option value="cover">Fill banner (may crop edges)</option><option value="contain">Show full image</option></select></label>
        <label className="ad-category-field"><span>{editor.mode === 'image' ? 'Image link (optional)' : 'Button link'}</span><input maxLength={300} value={editor.buttonHref} onChange={event => field('buttonHref', event.target.value)} placeholder="/shop/furniture" /><small className="ad-muted">Use a page on this site, such as /shop/furniture.</small></label>
        {editor.mode === 'text' && <>
          {[['titleBefore', 'Heading before highlight'], ['titleAccent', 'Highlighted words'], ['titleAfter', 'Heading after highlight'], ['buttonText', 'Button text']].map(([key, label]) => <label key={key} className="ad-category-field"><span>{label}</span><input maxLength={key === 'buttonText' ? 60 : 100} value={editor[key]} onChange={event => field(key, event.target.value)} /></label>)}
          <label className="ad-category-field ad-hero-wide"><span>Description</span><textarea rows={3} maxLength={500} value={editor.description} onChange={event => field('description', event.target.value)} /></label>
          <label className="ad-category-field"><span>Text color</span><select aria-label="Text color" value={editor.textTone} onChange={event => field('textTone', event.target.value)}><option value="dark">Dark</option><option value="light">Light</option></select></label>
          <label className="ad-category-field"><span>Text position</span><select aria-label="Text position" value={editor.alignment} onChange={event => field('alignment', event.target.value)}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
        </>}
      </div>
      <label className="ad-hero-active"><input type="checkbox" checked={editor.active} onChange={event => field('active', event.target.checked)} /> Show on homepage</label>
      {selectedImage && <><div className="ad-hero-actions" aria-label="Banner preview size"><button type="button" className="ad-secondary" aria-pressed={previewMode === 'desktop'} onClick={() => setPreviewMode('desktop')}>Desktop preview</button><button type="button" className="ad-secondary" aria-pressed={previewMode === 'mobile'} onClick={() => setPreviewMode('mobile')}>Mobile preview</button></div><div className={`ad-hero-preview ${previewMode === 'mobile' ? 'ad-hero-preview-mobile' : ''} ad-hero-${editor.alignment} ${editor.textTone === 'light' ? 'ad-hero-light' : ''}`}>
        <Image src={selectedImage} unoptimized={isFilePreview} alt={editor.alt || editor.name} fill sizes="(max-width: 900px) 100vw, 900px" style={{ objectFit: editor.imageFit }} />
        {editor.mode === 'text' && <div className="ad-hero-preview-copy"><h3>{editor.titleBefore} <span>{editor.titleAccent}</span> {editor.titleAfter}</h3><p>{editor.description}</p>{editor.buttonText && editor.buttonHref && <span className="ad-hero-preview-button">{editor.buttonText}</span>}</div>}
      </div></>}
      <button type="submit" className="ad-primary">{busy ? 'Saving…' : 'Save slide'}</button>
    </fieldset></form>}
    {loading ? <p role="status" className="ad-empty">Loading hero slides…</p> : !slides.length ? <p className="ad-empty">No hero slides. Add an image or an image with text to get started.</p> : <ul className="ad-hero-list">{slides.map((slide, index) => <li key={slide.id}>
      <div className="ad-hero-thumbnail"><Image src={slide.image} alt={slide.alt || slide.name} fill sizes="240px" style={{ objectFit: slide.imageFit }} /></div>
      <div className="ad-hero-slide-meta"><strong>{slide.name}</strong><p className="ad-muted">{slide.mode === 'image' ? 'Image only' : 'Image + text'} · {slide.active ? 'Visible' : 'Hidden'} · {slide.mobileImage ? 'Desktop + mobile images' : 'Desktop image on all screens'}</p><div className="ad-hero-actions">
        <button className="ad-secondary" disabled={busy} onClick={() => edit(slide)}>Edit</button>
        <button className="ad-secondary" aria-label={`Move ${slide.name} up`} disabled={busy || index === 0} onClick={() => move(index, -1)}>↑ Move up</button>
        <button className="ad-secondary" aria-label={`Move ${slide.name} down`} disabled={busy || index === slides.length - 1} onClick={() => move(index, 1)}>↓ Move down</button>
        {deleting === slide.id ? <><button className="ad-secondary ad-danger" disabled={busy} onClick={() => void action(async () => { await api(`/${slide.id}`, { method: 'DELETE' }); setSlides(current => current.filter(item => item.id !== slide.id)); setDeleting(null); if (editor?.id === slide.id) setEditor(null) }, 'Slide deleted')}>Confirm delete</button><button className="ad-secondary" disabled={busy} onClick={() => setDeleting(null)}>Cancel</button></> : <button className="ad-secondary ad-danger" disabled={busy} onClick={() => setDeleting(slide.id)}>Delete</button>}
      </div></div>
    </li>)}</ul>}
  </section>
}
