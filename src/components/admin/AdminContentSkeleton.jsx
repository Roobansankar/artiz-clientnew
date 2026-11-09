export function TableSkeleton() {
    return <div className="ad-skeleton-table" aria-hidden="true"><div className="ad-skeleton-table-head">{Array.from({ length: 5 }, (_, i) => <span className="ad-skeleton" key={i}/>)}</div>{Array.from({ length: 6 }, (_, row) => <div className="ad-skeleton-table-row" key={row}>{Array.from({ length: 5 }, (_, column) => <span className={`ad-skeleton ${column === 0 ? 'wide' : ''}`} key={column}/>)}</div>)}</div>;
}
export default function AdminContentSkeleton({ section }) {
    const overview = section === 'Home' || section === 'Analytics';
    return <div className="ad-content-loading" role="status" aria-label={`Loading ${section.toLowerCase()} content`}>
    {overview ? <><div className="ad-skeleton-stats">{Array.from({ length: 4 }, (_, i) => <div key={i}><span className="ad-skeleton circle"/><span className="ad-skeleton"/><span className="ad-skeleton large"/></div>)}</div><div className="ad-skeleton-chart"><span className="ad-skeleton"/><span className="ad-skeleton large"/><div /></div></> : <div className="ad-skeleton-actions"><span className="ad-skeleton"/><span className="ad-skeleton"/></div>}
    <TableSkeleton />
  </div>;
}
