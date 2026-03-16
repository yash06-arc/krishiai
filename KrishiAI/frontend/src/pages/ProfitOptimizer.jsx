import { useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'

import { GlassCard } from '../components/GlassCard.jsx'
import { Field } from '../components/Field.jsx'
import { StateBanner } from '../components/StateBanner.jsx'
import { fetchProfitOptimizer } from '../lib/api.js'
import { chartTheme } from '../lib/charts.js'
import { CROPS, DISTRICTS } from '../lib/constants.js'

function money(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—'
  return `₹${Number(v).toFixed(0)}`
}

export function ProfitOptimizer() {
  const crops = useMemo(() => CROPS, [])
  const districts = useMemo(() => DISTRICTS, [])

  const [crop, setCrop] = useState('Tomato')
  const [currentDistrict, setCurrentDistrict] = useState('Mysuru')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  async function run() {
    setLoading(true)
    setError('')
    try {
      const res = await fetchProfitOptimizer({ crop, currentDistrict })
      setData(res)
    } catch (e) {
      setError(e.message || 'Failed to optimize profit')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const markets = Array.isArray(data?.markets) ? data.markets : []
  const theme = chartTheme()
  const barData = {
    labels: markets.map((m) => m.district),
    datasets: [
      {
        label: 'Net profit (₹/kg after transport)',
        data: markets.map((m) => m.net_profit),
        backgroundColor: 'rgba(34, 197, 94, 0.30)',
        borderColor: 'rgba(34, 197, 94, 0.70)',
        borderWidth: 1,
      },
    ],
  }

  const recommended = data?.recommended

  return (
    <div className="space-y-8">
      <StateBanner
        title="Profit Optimizer"
        subtitle="Find the most profitable district to sell your crop after accounting for transport cost."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
          <div className="text-sm font-semibold">Inputs</div>
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
            <Field label="Your current district">
              <select
                value={currentDistrict}
                onChange={(e) => setCurrentDistrict(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-sky-400/50"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <button
              onClick={run}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:opacity-95 disabled:opacity-50"
            >
              {loading ? 'Optimizing…' : 'Optimize Profit'}
            </button>
            {error ? (
              <div className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-200 ring-1 ring-red-500/20">
                {error}
              </div>
            ) : null}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold">Recommended market</div>
              <div className="mt-1 text-xs text-white/60">
                {recommended
                  ? `Based on latest prices and transport cost from ${currentDistrict}.`
                  : 'Run the optimizer to see results.'}
              </div>
            </div>
            {recommended ? (
              <div className="flex flex-wrap gap-2">
                <div className="rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-white/10">
                  <div className="text-[11px] text-white/60">Best district</div>
                  <div className="text-sm font-semibold">{recommended.district}</div>
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-white/10">
                  <div className="text-[11px] text-white/60">Expected price</div>
                  <div className="text-sm font-semibold">{money(recommended.price)}</div>
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-white/10">
                  <div className="text-[11px] text-white/60">Transport cost</div>
                  <div className="text-sm font-semibold">
                    {money(recommended.transport_cost)}
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-emerald-400/15 to-sky-400/15 px-4 py-2 ring-1 ring-white/10">
                  <div className="text-[11px] text-white/60">Net profit</div>
                  <div className="text-sm font-semibold">{money(recommended.net_profit)}</div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5 rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Top profitable markets after transport
              </div>
              <div className="text-xs text-white/50">Chart.js</div>
            </div>
            <div className="mt-3 h-[340px]">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  ...theme,
                  scales: {
                    ...theme.scales,
                    x: {
                      ...theme.scales.x,
                      ticks: { ...theme.scales.x.ticks, maxRotation: 45, minRotation: 45 },
                    },
                  },
                }}
              />
            </div>
            {!markets.length ? (
              <div className="mt-3 text-xs text-white/50">
                No data yet. Run the optimizer to see net profit per district.
              </div>
            ) : null}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

