export function StateBanner({ title, subtitle, right }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow">
      <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
            KrishiAI • Karnataka
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/65">{subtitle}</p>
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  )
}

