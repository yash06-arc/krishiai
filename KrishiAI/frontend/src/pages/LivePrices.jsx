import { useEffect, useMemo, useState } from 'react'

import { GlassCard } from '../components/GlassCard.jsx'
import { Field } from '../components/Field.jsx'
import { StateBanner } from '../components/StateBanner.jsx'
import { fetchPrices } from '../lib/api.js'
import { CROPS, DISTRICTS } from '../lib/constants.js'

function toMoney(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—'
  return `₹${Number(v).toFixed(0)}`
}

function DemandPill({ level }) {
  const base =
    level === 'High'
      ? 'bg-red-500/15 text-red-200 ring-red-500/30'
      : level === 'Medium'
        ? 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
        : 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ring-1 ${base}`}>
      {level || 'Low'}
    </span>
  )
}

export function LivePrices() {
  const [crop, setCrop] = useState('')
  const [district, setDistrict] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cropOptions = useMemo(() => CROPS, [])
  const districtOptions = useMemo(() => DISTRICTS, [])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetchPrices({ crop, district })
      .then((d) => {
        if (!alive) return
        setRows(d?.items || [])
      })
      .catch((e) => alive && setError(e.message || 'Failed to load prices'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [crop, district])

  return (
    <div className="space-y-8">
      <StateBanner
        title="Live Market Prices"
        subtitle="Filter by crop and district to view market price signals and demand level across Karnataka."
        right={
          <div className="hidden rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 md:block">
            <div className="text-xs text-white/60">API</div>
            <div className="mt-1 font-mono text-xs text-white/70">GET /prices</div>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
          <div className="text-sm font-semibold">Filters</div>
          <div className="mt-4 grid gap-4">
            <Field label="Search crop" hint="Optional">
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="">All crops</option>
                {cropOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Select district" hint="Optional">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-sky-400/50"
              >
                <option value="">All districts</option>
                {districtOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
            <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70 ring-1 ring-white/10">
              <div className="font-semibold text-white">Tip</div>
              <div className="mt-1 text-white/65">
                Use <span className="font-semibold">District Comparison</span> to compare
                one crop across Karnataka.
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Market price table</div>
              <div className="mt-1 text-xs text-white/60">
                {loading ? 'Loading…' : `${rows.length} rows`}
              </div>
            </div>
            {error ? (
              <div className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-200 ring-1 ring-red-500/20">
                {error}
              </div>
            ) : null}
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-white/10">
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-ink-900/80 backdrop-blur">
                  <tr className="text-xs uppercase tracking-wider text-white/60">
                    <th className="px-4 py-3">Crop</th>
                    <th className="px-4 py-3">District</th>
                    <th className="px-4 py-3">Market price</th>
                    <th className="px-4 py-3">Demand</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3">
                          <div className="h-3 w-24 rounded bg-white/10" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-3 w-40 rounded bg-white/10" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-3 w-16 rounded bg-white/10" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-6 w-20 rounded-full bg-white/10" />
                        </td>
                      </tr>
                    ))
                  ) : rows.length ? (
                    rows.map((r, idx) => (
                      <tr key={`${r.crop}-${r.district}-${idx}`} className="hover:bg-white/5">
                        <td className="px-4 py-3 font-semibold">{r.crop}</td>
                        <td className="px-4 py-3 text-white/80">{r.district}</td>
                        <td className="px-4 py-3">{toMoney(r.price)}</td>
                        <td className="px-4 py-3">
                          <DemandPill level={r.demand_level} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-white/60" colSpan={4}>
                        No results. Try removing filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

