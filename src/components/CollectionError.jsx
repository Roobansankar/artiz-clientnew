'use client'

export default function CollectionError({ reset }) {
  return <section className="container-x py-16 text-center"><h1 className="text-3xl">We couldn’t load this collection.</h1><p className="mt-4 text-muted">Please try again in a moment.</p><button onClick={reset} className="btn-dark mt-7">Try again</button></section>
}
