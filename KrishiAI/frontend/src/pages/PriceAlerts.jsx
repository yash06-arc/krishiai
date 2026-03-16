import { useEffect, useMemo, useState } from 'react'

import { GlassCard } from '../components/GlassCard.jsx'
import { Field } from '../components/Field.jsx'
import { StateBanner } from '../components/StateBanner.jsx'
import { fetchPriceAlerts } from '../lib/api.js'
import { CROPS } from '../lib/constants.js'

export function PriceAlerts() {
  const crops = useMemo(() => CROPS, [])
  const [crop, setCrop] = useState('Tomato')
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetchPriceAlerts({ crop })
      .then((res) => {
        if (!alive) return
        setAlerts(res?.alerts || [])
      })
      .catch((e) => alive && setError(e.message || 'Failed to load alerts'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [crop])

  return (
    <div className="space-y-8">
      <StateBanner
        title="Farmer Price Alerts"
        subtitle="See which districts experienced sudden price jumps for a crop."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
          <div className="text-sm font-semibold">Configure alerts</div>
          <div className="mt-4 grid gap-4">
            <Field label="Crop">
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/50"
              >
                {crops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <div className="rounded-2xl bg-white/5 p-4 text-xs text-white/70 ring-1 ring-white/10">
              Alerts are raised when the latest price is more than{' '}
              <span className="font-semibold text-white">10% higher</span> than yesterday in a
              district.
            </div>
            {error ? (
              <div className="rounded-2xl bg-red-500/10 px-3 py-2 text-xs text-red-200 ring-1 ring-red-500/20">
                {error}
              </div>
            ) : null}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Active alerts</div>
              <div className="mt-1 text-xs text-white/60">
                {loading ? 'Checking prices…' : `${alerts.length} alert(s)`}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/30 animate-pulse"
                  >
                    <div className="h-3 w-24 rounded bg-red-500/40" />
                    <div className="mt-2 h-3 w-40 rounded bg-red-500/20" />
                  </div>
                ))
              : alerts.length
                ? alerts.map((a) => (
                    <div
                      key={`${a.district}-${a.current_price}`}
                      className="rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/40"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-red-200">
                            Price Alert • {a.crop}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-white">
                            {a.district}
                          </div>
                          <div className="mt-1 text-xs text-red-100/80">
                            {a.alert_message}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <div className="rounded-xl bg-red-500/20 px-3 py-1 text-xs text-red-50 ring-1 ring-red-500/40">
                            +{a.percentage_increase}%
                          </div>
                          <div className="rounded-xl bg-black/30 px-3 py-1 text-xs text-white/80 ring-1 ring-white/10">
                            Current price: ₹{a.current_price}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : !loading && (
                    <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70 ring-1 ring-white/10">
                      No price alerts for <span className="font-semibold">{crop}</span> right
                      now. Prices are relatively stable across districts.
                    </div>
                  )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

