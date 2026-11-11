'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

function DownloadIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></svg>;
}
function UploadIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21V9m-5 5 5-5 5 5M4 4h16" /></svg>;
}

export default function AdminBulkUpload({ notify }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const input = useRef(null);

  async function downloadTemplate() {
    setDownloading(true);
    try {
      const response = await fetch('/api/admin/products/template', { credentials: 'same-origin', cache: 'no-store' });
      if (response.status === 401) { window.location.href = '/admin/login'; return; }
      if (!response.ok) {
        let message = 'Could not download the template.';
        try { message = (await response.json()).message || message; } catch { /* binary error */ }
        throw new Error(message);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'artiz-product-template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      notify?.('Demo template downloaded. Fill it in and upload it below.');
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setDownloading(false);
    }
  }

  function choose(next) {
    setError('');
    setResult(null);
    if (!next) { setFile(null); return; }
    if (!/\.xlsx$/i.test(next.name)) { setError('Choose an Excel workbook (.xlsx).'); setFile(null); return; }
    if (next.size > 10 * 1024 * 1024) { setError('The workbook must be 10 MB or smaller.'); setFile(null); return; }
    setFile(next);
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/admin/products/bulk', { method: 'POST', body, credentials: 'same-origin', cache: 'no-store' });
      if (response.status === 401) { window.location.href = '/admin/login'; return; }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Could not import this workbook.');
      setResult(data);
      if (data.created.length) notify?.(`${data.created.length} product${data.created.length === 1 ? '' : 's'} imported successfully.`);
      else toast.error('No products were imported. Check the failed rows below.');
      setFile(null);
      if (input.current) input.current.value = '';
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }

  return <div className="ad-bulk-page">
    <div className="ad-products-heading">
      <div>
        <h2>Bulk Upload</h2>
        <p>Add many products at once with an Excel workbook.</p>
      </div>
      <Link href="/admin/products" className="ad-secondary">← Back to products</Link>
    </div>

    <div className="ad-bulk-grid">
      <section className="ad-bulk-card">
        <span className="ad-bulk-step">Step 1</span>
        <h3>Download the demo template</h3>
        <p>Each row is one variant. Rows with the same product code (or product name) combine into one product with multiple variants.</p>
        <ul className="ad-bulk-list">
          <li>Keep the header row exactly as provided.</li>
          <li>The template includes sample rows: rows 2–4 are one product with 3 variants, row 5 is a normal product. Delete them before uploading.</li>
          <li>Same Product code or name → one product with several variants.</li>
          <li>Category, subcategory and collections accept slug or name.</li>
          <li>Up to 1000 rows per workbook.</li>
        </ul>
        <button type="button" className="ad-neutral-button" onClick={downloadTemplate} disabled={downloading}>
          <DownloadIcon /> {downloading ? 'Preparing…' : 'Download template'}
        </button>
      </section>

      <section className="ad-bulk-card">
        <span className="ad-bulk-step">Step 2</span>
        <h3>Upload your filled workbook</h3>
        <p>Upload the template after adding your products. Valid rows are saved; invalid rows are reported so you can fix and retry.</p>
        <label
          className={`ad-bulk-drop ${dragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={event => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={event => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files?.[0]); }}
        >
          <input ref={input} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={event => choose(event.target.files?.[0])} />
          <span className="ad-bulk-drop-icon"><UploadIcon /></span>
          {file ? <><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(0)} KB · click to choose another file</small></>
            : <><strong>Drop your .xlsx file here</strong><small>or click to browse · maximum 10 MB</small></>}
        </label>
        {error && <p className="ad-product-error" role="alert">{error}</p>}
        <div className="ad-bulk-actions">
          <button type="button" className="ad-primary" onClick={upload} disabled={!file || uploading}>
            <UploadIcon /> {uploading ? 'Importing…' : 'Import products'}
          </button>
          {file && !uploading && <button type="button" className="ad-secondary" onClick={() => choose(null)}>Clear</button>}
        </div>
      </section>
    </div>

    {result && <section className="ad-bulk-results">
      <div className="ad-bulk-summary">
        <div><strong>{result.created.length}</strong><span>products imported</span></div>
        <div className={result.failed.length ? 'has-failures' : ''}><strong>{result.failed.length}</strong><span>rows failed</span></div>
        <div><strong>{result.total}</strong><span>rows in file</span></div>
      </div>
      {result.created.length > 0 && <details className="ad-bulk-created" open={!result.failed.length}>
        <summary>Imported products</summary>
        <ul>{result.created.map(product => <li key={product.id}><span>{product.name}</span><Link href={`/admin/products/${product.slug}/edit`}>Edit</Link></li>)}</ul>
      </details>}
      {result.failed.length > 0 && <div className="ad-bulk-failures">
        <h3>Rows that need attention</h3>
        <div className="ad-table-scroll">
          <table className="ad-table">
            <thead><tr><th>Row</th><th>Product</th><th>Problem</th></tr></thead>
            <tbody>{result.failed.map(failure => <tr key={`${failure.row}-${failure.name}`}><td>{failure.row}</td><td>{failure.name}</td><td>{failure.message}</td></tr>)}</tbody>
          </table>
        </div>
        <p className="ad-muted ad-small">Fix these rows in the same workbook and upload it again. Products that already imported are not duplicated.</p>
      </div>}
      <Link href="/admin/products" className="ad-primary ad-bulk-done">View products</Link>
    </section>}
  </div>;
}
