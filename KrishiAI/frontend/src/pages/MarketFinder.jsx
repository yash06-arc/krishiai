import { useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'

import { GlassCard } from '../components/GlassCard.jsx'
import { Field } from '../components/Field.jsx'
import { StateBanner } from '../components/StateBanner.jsx'
import { fetchBestMarket } from '../lib/api.js'
import { chartTheme } from '../lib/charts.js'
import { CROPS, DISTRICTS } from '../lib/constants.js'
import { useT } from '../lib/i18n.js'

function money(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—'
  return `₹${Number(v).toFixed(0)}`
}

export function MarketFinder() {
  const { t, tCrop, tDistrict } = useT()
  const crops = useMemo(() => CROPS, [])
  const districts = useMemo(() => DISTRICTS, [])

  const [crop, setCrop] = useState('Tomato')
  const [district, setDistrict] = useState('Mysuru')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function run() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchBestMarket({ crop, district })
      setResult(data)
    } catch (e) {
      setError(e.message || t('common.error'))
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const series = Array.isArray(result?.district_prices) ? result.district_prices : []
  const top = series.slice(0, 10)
  const theme = chartTheme()
  const barData = {
    labels: top.map((x) => tDistrict(x.district)),
    datasets: [
      {
        label: t('prediction.pricePerKg') || 'Price (₹/kg)',
        data: top.map((x) => x.price),
        backgroundColor: 'rgba(34, 197, 94, 0.30)',
        borderColor: 'rgba(34, 197, 94, 0.65)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="space-y-8">
      <StateBanner
        title={t('marketFinder.title')}
        subtitle={t('marketFinder.description')}
        right={
          <div className="hidden rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 md:block">
            <div className="text-xs text-white/60">{t('common.api')}</div>
            <div className="mt-1 font-mono text-xs text-white/70">GET /best-market</div>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
          <div className="text-sm font-semibold">{t('marketFinder.inputs')}</div>
          <div className="mt-4 grid gap-4">
            <Field label={t('prediction.cropName')}>
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

            <Field label={t('marketFinder.yourDistrict')} hint={t('marketFinder.baselineHint')}>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
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
              {loading ? t('marketFinder.finding') : t('marketFinder.findBestMarket')}
            </button>

            {error ? (
              <div className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-200 ring-1 ring-red-500/20">
                {error}
              </div>
            ) : null}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold">{t('marketFinder.recommendation')}</div>
              <div className="mt-1 text-xs text-white/60">
                {result ? t('marketFinder.bestMarketIdentified') : t('marketFinder.runToSee')}
              </div>
            </div>
            {result ? (
              <div className="flex flex-wrap gap-2">
                <div className="rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-white/10">
                  <div className="text-[11px] text-white/60">{t('marketFinder.bestDistrict')}</div>
                  <div className="text-sm font-semibold">{tDistrict(result.best_district)}</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-emerald-400/15 to-sky-400/15 px-4 py-2 ring-1 ring-white/10">
                  <div className="text-[11px] text-white/60">{t('marketFinder.bestPrice')}</div>
                  <div className="text-sm font-semibold">{money(result.best_price)}</div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5 rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                {t('marketFinder.chartTitle')}
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
                      ticks: { ...theme.scales.x.ticks, maxRotation: 35, minRotation: 35 },
                    },
                  },
                }}
              />
            </div>
            {!series.length ? (
              <div className="mt-3 text-xs text-white/50">
                {t('marketFinder.chartPlaceholder')}
              </div>
            ) : null}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

