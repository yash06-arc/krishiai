import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Line } from 'react-chartjs-2'

import { GlassCard } from '../components/GlassCard.jsx'
import { Field } from '../components/Field.jsx'
import { StateBanner } from '../components/StateBanner.jsx'
import { fetchPredict } from '../lib/api.js'
import { chartTheme } from '../lib/charts.js'
import { CROPS, DISTRICTS } from '../lib/constants.js'
import { useT } from '../lib/i18n.js'

function money(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—'
  return `₹${Number(v).toFixed(0)}`
}

export function Prediction() {
  const { t, tCrop, tDistrict } = useT()
  const [params] = useSearchParams()
  const cropFromQuery = params.get('crop') || ''

  const cropOptions = useMemo(() => CROPS, [])
  const districtOptions = useMemo(() => DISTRICTS, [])

  const [crop, setCrop] = useState(cropFromQuery || 'Tomato')
  const [district, setDistrict] = useState('Mysuru')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (cropFromQuery) setCrop(cropFromQuery)
  }, [cropFromQuery])

  async function run() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchPredict({ crop, district })
      setResult(data)
    } catch (e) {
      setError(e.message || t('common.error'))
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const history = Array.isArray(result?.history) ? result.history : []
  const forecast = Array.isArray(result?.forecast) ? result.forecast : []
  const combinedLabels = [
    ...history.map((h) => h.date),
    ...forecast.map((f) => f.date),
  ]
  const combinedPrices = [
    ...history.map((h) => h.price),
    ...forecast.map((f) => f.predicted_price),
  ]

  const theme = chartTheme()
  const lineData = {
    labels: combinedLabels,
    datasets: [
      {
        label: t('prediction.pricePerKg') || 'Price (₹/kg)',
        data: combinedPrices,
        borderColor: 'rgba(96, 165, 250, 0.9)',
        backgroundColor: 'rgba(96, 165, 250, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 0,
      },
    ],
  }

  return (
    <div className="space-y-8">
      <StateBanner
        title={t('prediction.title')}
        subtitle={t('prediction.description')}
        right={
          <div className="hidden rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 md:block">
            <div className="text-xs text-white/60">{t('common.api')}</div>
            <div className="mt-1 font-mono text-xs text-white/70">GET /predict</div>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
          <div className="text-sm font-semibold">{t('prediction.inputs')}</div>
          <div className="mt-4 grid gap-4">
            <Field label={t('prediction.cropName')}>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/50"
              >
                {cropOptions.map((c) => (
                  <option key={c} value={c}>
                    {tCrop(c)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('prediction.district')}>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-sky-400/50"
              >
                {districtOptions.map((d) => (
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
              {loading ? t('prediction.predicting') : t('prediction.runPrediction')}
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
              <div className="text-sm font-semibold">{t('prediction.result')}</div>
              <div className="mt-1 text-xs text-white/60">
                {result ? t('prediction.predictionReady') : t('prediction.runModelToSee')}
              </div>
            </div>
            {result ? (
              <div className="flex flex-wrap gap-2">
                <div className="rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-white/10">
                  <div className="text-[11px] text-white/60">{t('prediction.cropName')}</div>
                  <div className="text-sm font-semibold">{tCrop(result.crop)}</div>
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-white/10">
                  <div className="text-[11px] text-white/60">{t('prediction.district')}</div>
                  <div className="text-sm font-semibold">{tDistrict(result.district)}</div>
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-emerald-400/15 to-sky-400/15 px-4 py-2 ring-1 ring-white/10">
                  <div className="text-[11px] text-white/60">{t('prediction.predictedPrice')}</div>
                  <div className="text-sm font-semibold">{money(result.predicted_price)}</div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5 rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                {t('prediction.chartTitle')}
              </div>
              <div className="text-xs text-white/50">Chart.js</div>
            </div>
            <div className="mt-3 h-[320px]">
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  ...theme,
                }}
              />
            </div>
            {!history.length && !forecast.length ? (
              <div className="mt-3 text-xs text-white/50">
                {t('prediction.chartPlaceholder')}
              </div>
            ) : null}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

