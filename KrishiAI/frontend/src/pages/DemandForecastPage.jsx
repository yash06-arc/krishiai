import { useMemo, useState } from 'react'

import { GlassCard } from '../components/GlassCard.jsx'
import { Field } from '../components/Field.jsx'
import { StateBanner } from '../components/StateBanner.jsx'
import { fetchDemandForecast } from '../lib/api.js'
import { CROPS } from '../lib/constants.js'

export function DemandForecastPage() {
  const crops = useMemo(() => CROPS, [])
  const [crop, setCrop] = useState('Tomato')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  async function run() {
    setLoading(true)
    setError('')
    try {
      const res = await fetchDemandForecast({ crop })
      setData(res)
    } catch (e) {
      setError(e.message || 'Failed to load forecast')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const trend = data?.trend

  const trendColor =
    trend === 'increasing'
      ? 'from-emerald-400/20 to-green-500/25'
      : trend === 'decreasing'
        ? 'from-red-500/25 to-orange-500/25'
        : 'from-sky-400/20 to-indigo-500/25'

  const trendLabel =
    trend === 'increasing' ? 'Demand increasing' : trend === 'decreasing' ? 'Demand decreasing' : 'Demand stable'

  return (
    <div className="space-y-8">
      <StateBanner
        title="Crop Demand Forecast"
        subtitle="Short-term demand signal based on recent price trends across districts."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
          <div className="text-sm font-semibold">Select crop</div>
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
            <button
              onClick={run}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Forecasting…' : 'Get demand forecast'}
            </button>
            {error ? (
              <div className="rounded-2xl bg-red-500/10 px-3 py-2 text-xs text-red-200 ring-1 ring-red-500/20">
                {error}
              </div>
            ) : null}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <div
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${trendColor} p-6 ring-1 ring-white/10`}
          >
            <div className="absolute inset-0 opacity-40">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -right-10 -bottom-10 h-52 w-52 rounded-full bg-black/30 blur-3xl" />
            </div>
            <div className="relative space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Demand signal • {crop}
              </div>
              <div className="text-2xl font-semibold">{trend ? trendLabel : 'Run forecast'}</div>
              <p className="text-sm text-white/80">
                {data?.message ||
                  'KrishiAI analyses the recent 30-day price trend across districts to infer whether demand is rising, falling, or stable.'}
              </p>
              {data ? (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/75">
                  <span className="rounded-full bg-black/30 px-3 py-1 ring-1 ring-white/15">
                    Window: last {data.recent_window_days} days
                  </span>
                  <span className="rounded-full bg-black/30 px-3 py-1 ring-1 ring-white/15">
                    Price change: {data.change_percent}%
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

