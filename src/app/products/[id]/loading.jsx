export default function Loading() {
  return (
    <div className="container-x py-8 md:py-12" role="status" aria-busy="true">
      <span className="sr-only">Loading product details…</span>
      <div aria-hidden="true" className="motion-safe:animate-pulse">
        <div className="mb-8 h-4 w-60 rounded bg-sand/60" />
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="aspect-square rounded-2xl bg-sand/50" />
          <div className="space-y-6 py-4">
            <div className="h-4 w-24 rounded bg-sand/60" /><div className="h-12 w-4/5 rounded bg-sand/60" /><div className="h-7 w-36 rounded bg-sand/60" />
            <div className="space-y-3">{[0, 1, 2].map(i => <div key={i} className="h-4 rounded bg-sand/50" />)}</div>
            <div className="h-14 w-full rounded-full bg-terra/15" /><div className="h-28 rounded-xl bg-sand/50" />
          </div>
        </div>
      </div>
    </div>
  )
}
