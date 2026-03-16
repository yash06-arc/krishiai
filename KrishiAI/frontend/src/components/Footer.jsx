export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/10">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="space-y-2">
          <div className="text-sm font-semibold tracking-tight">KrishiAI</div>
          <p className="text-sm text-white/60">
            AI powered crop market intelligence for smarter selling decisions.
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Demo notes
          </div>
          <ul className="space-y-1 text-sm text-white/60">
            <li>Data shown is a Karnataka-wide sample dataset for pitching.</li>
            <li>Predictions are generated from an sklearn regression model.</li>
          </ul>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Founder
          </div>
          <div className="text-sm">
            <div className="font-semibold">Yashwanth</div>
            <div className="text-white/60">Information Science Engineering Student</div>
            <div className="text-white/60">Agritech Innovator</div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} KrishiAI • Investor demo build
      </div>
    </footer>
  )
}

