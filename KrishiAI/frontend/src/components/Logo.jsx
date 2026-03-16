export function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-white/10 shadow-glass ring-1 ring-white/10">
        <div className="h-4 w-4 rounded-sm bg-gradient-to-br from-emerald-400 to-sky-400" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">KrishiAI</div>
        <div className="text-[11px] text-white/60">Market Intelligence</div>
      </div>
    </div>
  )
}

