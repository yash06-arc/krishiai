export function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
          {label}
        </label>
        {hint ? <div className="text-xs text-white/50">{hint}</div> : null}
      </div>
      {children}
    </div>
  )
}

