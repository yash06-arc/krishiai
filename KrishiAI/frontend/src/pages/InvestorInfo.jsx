import { GlassCard } from '../components/GlassCard.jsx'
import { StateBanner } from '../components/StateBanner.jsx'

export function InvestorInfo() {
  return (
    <div className="space-y-8">
      <StateBanner
        title="Investor Info"
        subtitle="KrishiAI is designed as a scalable market intelligence platform for India’s agricultural economy."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-2">
          <div className="text-sm font-semibold">Startup potential</div>
          <p className="mt-3 text-sm text-white/65">
            India has over <span className="font-semibold text-white">140 million</span>{' '}
            farmers. As digital rails mature (UPI, logistics, marketplaces), a trusted market
            intelligence layer becomes essential. KrishiAI helps farmers decide{' '}
            <span className="font-semibold text-white">where</span> and{' '}
            <span className="font-semibold text-white">when</span> to sell.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { k: 'North Star', v: 'Better farm-gate realization' },
              { k: 'Product wedge', v: 'Price + demand dashboards' },
              { k: 'Expansion', v: 'Multi-state, more commodities' },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xs text-white/60">{s.k}</div>
                <div className="mt-1 text-sm font-semibold">{s.v}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-400/15 to-sky-400/15 p-5 ring-1 ring-white/10">
            <div className="text-sm font-semibold">Why investors care</div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>Large user base + clear value (better selling decisions)</li>
              <li>Strong data flywheel (prices, demand, seasonality)</li>
              <li>Multiple monetization paths (SaaS, lead-gen, analytics)</li>
            </ul>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="text-sm font-semibold">Founder</div>
          <div className="mt-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="text-lg font-semibold">Yashwanth</div>
            <div className="mt-1 text-sm text-white/65">
              Information Science Engineering Student
            </div>
            <div className="text-sm text-white/65">Agritech Innovator</div>
          </div>

          <div className="mt-4 space-y-3">
            {[
              {
                k: 'Demo scope',
                v: 'Karnataka • 29 districts • 20 crops',
              },
              {
                k: 'Deploy-ready',
                v: 'Vercel (frontend) + Render (backend)',
              },
              {
                k: 'Next step',
                v: 'Plug in real mandi feeds + logistics costs',
              },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xs text-white/60">{s.k}</div>
                <div className="mt-1 text-sm font-semibold">{s.v}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

