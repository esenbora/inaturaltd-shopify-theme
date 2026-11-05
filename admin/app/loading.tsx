/**
 * The loading state every page shares.
 *
 * Each page here renders per request and most of them wait on Shopify or
 * Google, so a navigation can sit for a second or two with nothing happening.
 * Without this the browser stays on the old screen for that whole time and the
 * click reads as ignored.
 *
 * The dashboard does better than this: its cards stream in one at a time
 * behind their own Suspense boundaries, so this only ever shows for the pages
 * that await a single call.
 */
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10" aria-busy="true">
      <div className="h-4 w-32 rounded bg-sand" />
      <div className="mt-3 h-8 w-64 rounded bg-sand" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="h-4 w-24 rounded bg-sand" />
            <div className="mt-4 h-7 w-20 rounded bg-sand" />
            <div className="mt-3 h-3 w-full rounded bg-sand/70" />
            <div className="mt-2 h-3 w-2/3 rounded bg-sand/70" />
          </div>
        ))}
      </div>
      <p className="sr-only">Loading…</p>
    </main>
  );
}
