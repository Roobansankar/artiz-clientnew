function Placeholder({ className = '' }) {
  return <div className={`rounded-lg bg-sand/60 motion-safe:animate-pulse ${className}`} />
}

export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading collection and products…</span>
      <div aria-hidden="true">
        <div className="border-b border-sand bg-white">
          <div className="container-x py-10 md:py-14">
            <Placeholder className="h-10 w-40" />
            <Placeholder className="mt-3 h-4 w-28" />
            <Placeholder className="mt-5 h-4 w-64 max-w-full" />
          </div>
        </div>
        <div className="container-x py-10 md:py-14">
          <Placeholder className="mb-7 h-7 w-52" />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className={index > 1 ? 'hidden sm:block' : ''}>
                <Placeholder className="aspect-[328/250] rounded-xl" />
                <Placeholder className="mt-4 h-4 w-3/5" />
                <Placeholder className="mt-2 h-3 w-1/4" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-cream py-10 md:py-14">
          <div className="container-x">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-muted">
                <span className="h-5 w-5 rounded-full border-2 border-sand border-t-terra motion-safe:animate-spin" />
                Finding your next favorite…
              </div>
              <Placeholder className="hidden h-10 w-48 sm:block" />
            </div>
            <div className="flex gap-8">
              <div className="hidden w-[260px] shrink-0 space-y-6 lg:block">
                {[0, 1, 2].map(index => <div key={index} className="space-y-4 border-b border-sand pb-6"><Placeholder className="h-5 w-24" /><Placeholder className="h-4 w-40" /><Placeholder className="h-4 w-32" /></div>)}
              </div>
              <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index}>
                    <Placeholder className="aspect-square rounded-xl" />
                    <Placeholder className="mx-auto mt-4 h-3 w-1/3" />
                    <Placeholder className="mx-auto mt-3 h-5 w-3/4" />
                    <Placeholder className="mx-auto mt-3 h-4 w-1/3" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
