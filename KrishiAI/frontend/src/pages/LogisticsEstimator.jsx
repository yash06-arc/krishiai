import { useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'

import { GlassCard } from '../components/GlassCard.jsx'
import { Field } from '../components/Field.jsx'
import { StateBanner } from '../components/StateBanner.jsx'
import { fetchLogisticsEstimate } from '../lib/api.js'
import { chartTheme } from '../lib/charts.js'
import { CROPS, DISTRICTS } from '../lib/constants.js'
import { useT } from '../lib/i18n.js'

function money(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—'
  return `₹${Number(v).toFixed(0)}`
}

export function LogisticsEstimator() {
  const { t, tCrop, tDistrict } = useT()
  const crops = useMemo(() => CROPS, [])
  const districts = useMemo(() => DISTRICTS, [])

  const [crop, setCrop] = useState('Tomato')
  const [baseDistrict, setBaseDistrict] = useState('Mysuru')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  async function run() {
    setLoading(true)
    setError('')
    try {
      const res = await fetchLogisticsEstimate({ crop, district: baseDistrict })
      setData(res)
    } catch (e) {
      setError(e.message || 'Failed to estimate logistics')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const estimates = Array.isArray(data?.estimates) ? data.estimates : []
  const theme = chartTheme()
  const barData = {
    labels: estimates.map((e) => e.district),
    datasets: [
      {
        label: 'Net profit (₹/kg after transport)',
        data: estimates.map((e) => e.net_profit),
        backgroundColor: 'rgba(59, 130, 246, 0.30)',
        borderColor: 'rgba(59, 130, 246, 0.75)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="space-y-8">
      <StateBanner
        title={t('logistics.title')}
        subtitle={t('logistics.subtitle')}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
          <div className="text-sm font-semibold">{t('profitOptimizer.inputs')}</div>
          <div className="mt-4 grid gap-4">
            <Field label={t('marketFinder.inputs')}>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/50"
              >
                {crops.map((c) => (
                  <option key={c} value={c}>
                    {tCrop(c)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('logistics.baseDistrict')}>
              <select
                value={baseDistrict}
                onChange={(e) => setBaseDistrict(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-sky-400/50"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {tDistrict(d)}
                  </option>
                ))}
              </select>
            </Field>
            <button
              onClick={run}
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:opacity-95 disabled:opacity-50"
            >
              {loading ? t('logistics.running') : t('logistics.run')}
            </button>
            {error ? (
              <div className="rounded-2xl bg-red-500/10 px-3 py-2 text-xs text-red-200 ring-1 ring-red-500/20">
                {error}
              </div>
            ) : null}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <div className="text-sm font-semibold">{t('logistics.table')}</div>
          <div className="mt-2 text-xs text-white/60">
            Distances are estimated using district coordinates; cost = distance × 0.05.
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-white/10">
            <div className="max-h-[360px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-ink-900/80 backdrop-blur">
                  <tr className="text-xs uppercase tracking-wider text-white/60">
                    <th className="px-4 py-3">{t('logistics.district')}</th>
                    <th className="px-4 py-3">{t('logistics.price')}</th>
                    <th className="px-4 py-3">{t('logistics.distance')}</th>
                    <th className="px-4 py-3">{t('logistics.transportCost')}</th>
                    <th className="px-4 py-3">{t('logistics.netProfit')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {estimates.map((e) => (
                    <tr key={e.district} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-semibold">{tDistrict(e.district)}</td>
                      <td className="px-4 py-3">{money(e.price)}</td>
                      <td className="px-4 py-3 text-white/80">{e.distance_km}</td>
                      <td className="px-4 py-3">{money(e.transport_cost)}</td>
                      <td className="px-4 py-3">{money(e.net_profit)}</td>
                    </tr>
                  ))}
                  {!estimates.length ? (
                    <tr>
                      <td className="px-4 py-4 text-sm text-white/60" colSpan={5}>
                        Run the estimator to see results.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                {t('logistics.netProfit')}
              </div>
              <div className="text-xs text-white/50">{t('common.chartjs')}</div>
            </div>
            <div className="mt-3 h-[320px]">
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
                      ticks: { ...theme.scales.x.ticks, maxRotation: 60, minRotation: 60 },
                    },
                  },
                }}
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

