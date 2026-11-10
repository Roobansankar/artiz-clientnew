'use client';
import { useId, useMemo, useState } from 'react';
const currency = (value) => '₹' + Math.round(value).toLocaleString('en-IN');
const shortCurrency = (value) => value >= 100000 ? `₹${+(value / 100000).toFixed(1)}L` : value >= 1000 ? `₹${+(value / 1000).toFixed(1)}k` : currency(value);
function groupData(points, period) {
    const buckets = new Map();
    const label = value => new Date(`${value}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    points.forEach((point, index) => {
        const key = period === 'Monthly' ? point.date.slice(0, 7) : period === 'Weekly' ? String(Math.floor(index / 7)) : point.date;
        const bucket = buckets.get(key) || { first: point.date, last: point.date, current: 0, previous: 0 };
        bucket.last = point.date;
        bucket.current += point.current;
        bucket.previous += point.previous;
        buckets.set(key, bucket);
    });
    return [...buckets.values()].map(bucket => ({ ...bucket, label: period === 'Monthly' ? new Date(`${bucket.first}T00:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }) : period === 'Weekly' ? `${label(bucket.first)} – ${label(bucket.last)}` : label(bucket.first) }));
}
export default function RevenueChart({ range, period, total = 0, previousTotal = 0, points = [] }) {
    const gradientId = useId().replace(/:/g, '');
    const [mode, setMode] = useState('line');
    const [compare, setCompare] = useState(true);
    const [hovered, setHovered] = useState(null);
    const data = useMemo(() => groupData(points, period), [points, period]);
    const maximum = Math.max(1, ...data.map(p => Math.max(p.current, compare ? p.previous : 0)));
    const magnitude = 10 ** Math.floor(Math.log10(maximum));
    const ceiling = Math.ceil(maximum / magnitude * 1.15) * magnitude;
    const change = previousTotal > 0 ? ((total - previousTotal) / previousTotal * 100) : null;
    const changeLabel = change === null ? (total > 0 ? 'New revenue' : 'No change') : `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    const width = 1000;
    const height = 240;
    const x = (i) => (i + .5) * width / data.length;
    const y = (value) => height - value / ceiling * height;
    const path = (key) => data.map((p, i) => {
        if (i === 0)
            return `M${x(i)},${y(p[key])}`;
        const middle = (x(i - 1) + x(i)) / 2;
        return `C${middle},${y(data[i - 1][key])} ${middle},${y(p[key])} ${x(i)},${y(p[key])}`;
    }).join(' ');
    const currentPath = path('current');
    const activeIndex = hovered === null ? null : Math.min(hovered, data.length - 1);
    const active = activeIndex === null ? null : data[activeIndex];
    const barWidth = Math.min(38, width / data.length * .32);
    const labelStep = Math.max(1, Math.ceil(data.length / 7));
    return <section className="ad-revenue-card ad-chart-card" aria-label="Revenue report">
    <div className="ad-chart-card-header">
      <div><div className="ad-chart-title">Revenue overview</div><div className="ad-chart-total"><h2>{currency(total)}</h2><span className="ad-change" style={change < 0 ? { color: 'var(--ad-muted)' } : undefined}>{changeLabel}</span></div><p>Compared with {currency(previousTotal)} in the previous period</p></div>
      <div className="ad-chart-controls"><div className="ad-chart-mode" role="group" aria-label="Chart display"><button aria-pressed={mode === 'line'} onClick={() => setMode('line')}><svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 3v14h14M5 12l4-5 4 3 4-7"/></svg>Line</button><button aria-pressed={mode === 'bar'} onClick={() => setMode('bar')}><svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 16V9m6 7V4m6 12V7"/></svg>Bars</button></div><button className={`ad-chart-compare ${compare ? 'selected' : ''}`} aria-pressed={compare} onClick={() => setCompare(!compare)}><span>{compare ? '✓' : '+'}</span>Compare</button></div>
    </div>
    <div className="ad-chart-legend"><span><i />Current period</span>{compare && <span><i className="previous"/>Previous period</span>}<span className="ad-chart-unit">Revenue in INR</span></div>
    <div className="ad-revenue-visual">
      <div className="ad-chart-y-labels" aria-hidden="true">{[4, 3, 2, 1, 0].map(tick => <span key={tick}>{shortCurrency(ceiling * tick / 4)}</span>)}</div>
      <div className="ad-chart-plot" onPointerLeave={() => setHovered(null)}>
        <svg className="ad-chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={`${period} revenue, ${range.toLowerCase()}. Total ${currency(total)}. ${compare ? 'Includes previous period comparison.' : ''}`}>
          <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--ad-accent)" stopOpacity=".2"/><stop offset="100%" stopColor="var(--ad-accent)" stopOpacity=".01"/></linearGradient></defs>
          {[0, 1, 2, 3, 4].map(tick => <line key={tick} x1="0" x2={width} y1={height * tick / 4} y2={height * tick / 4} stroke="var(--ad-line)" strokeDasharray={tick === 4 ? undefined : '3 5'} vectorEffect="non-scaling-stroke"/>)}
          {mode === 'line' && data.length > 1 ? <>
            <path d={`${currentPath} L${x(data.length - 1)},${height} L${x(0)},${height} Z`} fill={`url(#${gradientId})`}/>
            {compare && <path d={path('previous')} fill="none" stroke="var(--ad-chart-previous)" strokeWidth="2" strokeDasharray="5 6" vectorEffect="non-scaling-stroke"/>}
            <path d={currentPath} fill="none" stroke="var(--ad-accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/>
          </> : data.map((p, i) => <g key={p.label}>{compare && <rect x={x(i) - barWidth - 2} y={y(p.previous)} width={barWidth} height={height - y(p.previous)} rx="4" fill="var(--ad-chart-previous)" opacity=".45"/>}<rect x={compare ? x(i) + 2 : x(i) - barWidth / 2} y={y(p.current)} width={barWidth} height={height - y(p.current)} rx="4" fill="var(--ad-accent)" opacity={activeIndex === null || activeIndex === i ? '.9' : '.4'}/></g>)}
          {activeIndex !== null && <line x1={x(activeIndex)} x2={x(activeIndex)} y1="0" y2={height} stroke="var(--ad-accent)" strokeDasharray="3 4" opacity=".4" vectorEffect="non-scaling-stroke"/>}
        </svg>
        {data.map((p, i) => <button key={p.label} className="ad-chart-hit" style={{ left: `${i / data.length * 100}%`, width: `${100 / data.length}%` }} aria-label={`${p.label}: ${currency(p.current)}${compare ? `, previous period ${currency(p.previous)}` : ''}`} onPointerEnter={() => setHovered(i)} onPointerMove={() => setHovered(i)} onFocus={() => setHovered(i)} onBlur={() => setHovered(null)} onClick={() => setHovered(activeIndex === i ? null : i)}/>)}
        {active && activeIndex !== null && <><span className="ad-chart-active-dot" style={{ left: `${x(activeIndex) / width * 100}%`, top: `${y(active.current) / height * 100}%` }}/><div className="ad-chart-tooltip" role="status" style={{ left: `${Math.max(16, Math.min(84, x(activeIndex) / width * 100))}%` }}><strong>{active.label}</strong><div><span><i />Revenue</span><b>{currency(active.current)}</b></div>{compare && <div><span><i className="previous"/>Previous</span><b>{currency(active.previous)}</b></div>}</div></>}
      </div>
      <div className="ad-chart-x-labels" aria-hidden="true">{data.map((p, i) => (i % labelStep === 0 || i === data.length - 1) && <span key={p.label} style={{ left: `${x(i) / width * 100}%` }}>{p.label}</span>)}</div>
    </div>
    <div className="ad-chart-bottom"><span><i />Collected payments only · Cash on Delivery is excluded until paid</span><span>{range} · {period}</span></div>
  </section>;
}
