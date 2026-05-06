import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'

import { GlassCard } from '../components/GlassCard.jsx'
import { Field } from '../components/Field.jsx'
import { StateBanner } from '../components/StateBanner.jsx'
import { fetchPrices } from '../lib/api.js'
import { chartTheme } from '../lib/charts.js'
import { CROPS } from '../lib/constants.js'
import { useT } from '../lib/i18n.js'

export function DistrictComparison() {
  const { t, tCrop, tDistrict } = useT()
  const crops = useMemo(() => CROPS, [])
  const [crop, setCrop] = useState('Tomato')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetchPrices({ crop })
      .then((d) => alive && setRows(d?.items || []))
      .catch((e) => alive && setError(e.message || t('common.error')))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [crop, t])

  const sorted = useMemo(() => {
    const arr = [...rows]
    arr.sort((a, b) => Number(b.price) - Number(a.price))
    return arr
  }, [rows])

  const theme = chartTheme()
  const barData = {
    labels: sorted.map((r) => tDistrict(r.district)),
    datasets: [
      {
        label: t('prediction.pricePerKg') || 'Price (₹/kg)',
        data: sorted.map((r) => r.price),
        backgroundColor: 'rgba(96, 165, 250, 0.28)',
        borderColor: 'rgba(96, 165, 250, 0.65)',
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="space-y-8">
      <StateBanner
        title={t('districtComparison.title')}
        subtitle={t('districtComparison.description')}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
          <div className="text-sm font-semibold">{t('livePrices.crop')}</div>
          <div className="mt-4 grid gap-4">
            <Field label={t('prediction.cropName')}>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-sky-400/50"
              >
                {crops.map((c) => (
                  <option key={c} value={c}>
                    {tCrop(c)}
                  </option>
                ))}
              </select>
            </Field>

            <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70 ring-1 ring-white/10">
              <div className="font-semibold text-white">{t('districtComparison.insight')}</div>
              <div className="mt-1 text-white/65">
                {t('districtComparison.insightDesc')} <span className="font-semibold">{tCrop(crop)}</span>.
              </div>
            </div>

            {error ? (
              <div className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-200 ring-1 ring-red-500/20">
                {error}
              </div>
            ) : null}
          </div>
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{t('districtComparison.pricesAcross')}</div>
              <div className="mt-1 text-xs text-white/60">
                {loading ? t('common.loading') : `${sorted.length} districts`}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
            <div className="h-[380px]">
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
            {!sorted.length ? (
              <div className="mt-3 text-xs text-white/50">
                {t('common.noData')}
              </div>
            ) : null}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

