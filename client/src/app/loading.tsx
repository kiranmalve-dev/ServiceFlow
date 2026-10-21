export default function Loading() {
  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header skeleton */}
      <div className="h-16 bg-white border-b border-zinc-200 animate-pulse" />

      {/* Hero loader */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-20">
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="h-10 w-2/3 max-w-xl rounded-lg bg-white/20 animate-pulse" />
          <div className="h-5 w-1/2 max-w-md rounded bg-white/20 animate-pulse" />
          <div className="h-11 w-36 rounded-xl bg-white/30 animate-pulse" />
        </div>
      </section>

      {/* Services skeleton */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-8 w-56 rounded bg-zinc-200 animate-pulse mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="h-36 rounded-lg bg-zinc-100 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-zinc-200 animate-pulse mt-4" />
              <div className="h-4 w-1/2 rounded bg-zinc-100 animate-pulse mt-3" />
            </div>
          ))}
        </div>
      </section>

      {/* Center loading indicator */}
      <div className="flex items-center justify-center gap-3 pb-10 text-sm text-zinc-500">
        <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        Loading services...
      </div>
    </main>
  );
}
