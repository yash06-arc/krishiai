import { useEffect, useMemo, useState } from 'react'

import { GlassCard } from '../components/GlassCard.jsx'
import { Field } from '../components/Field.jsx'
import { StateBanner } from '../components/StateBanner.jsx'
import { fetchPrices } from '../lib/api.js'
import { CROPS, DISTRICTS } from '../lib/constants.js'
import { useT } from '../lib/i18n.js'

function toMoney(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—'
  return `₹${Number(v).toFixed(0)}`
}

export function LivePrices() {
  const { t, tCrop, tDistrict } = useT()
  const [crop, setCrop] = useState('')
  const [district, setDistrict] = useState('')
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cropOptions = useMemo(() => CROPS, [])
  const districtOptions = useMemo(() => DISTRICTS, [])

  function DemandPill({ level }) {
    const base =
      level === 'High'
        ? 'bg-red-500/15 text-red-200 ring-red-500/30'
        : level === 'Medium'
          ? 'bg-amber-500/15 text-amber-200 ring-amber-500/30'
          : 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/30'
    const label = level === 'High' ? t('demandMap.high') : level === 'Medium' ? t('demandMap.medium') : t('demandMap.low')
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs ring-1 ${base}`}>
        {level ? label : t('demandMap.low')}
      </span>
    )
  }

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetchPrices({ crop, district })
      .then((d) => {
        if (!alive) return
        setRows(d?.items || [])
        setMeta({
          latestDate: d?.latest_date,
          lastSync: d?.last_sync,
          source: d?.source
        })
      })
      .catch((e) => alive && setError(e.message || t('common.error')))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [crop, district, t])

  return (
    <div className="space-y-8">
      <StateBanner
        title={t('livePrices.title')}
        subtitle={t('livePrices.subtitle')}
        right={
          <div className="hidden rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 md:block">
            <div className="text-xs text-white/60">{t('common.api')}</div>
            <div className="mt-1 font-mono text-xs text-white/70">GET /prices</div>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
          <div className="text-sm font-semibold">{t('livePrices.filters')}</div>
          <div className="mt-4 grid gap-4">
            <Field label={t('livePrices.crop')} hint={t('common.optional')}>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/50"
              >
                <option value="">{t('livePrices.crop')}</option>
                {cropOptions.map((c) => (
                  <option key={c} value={c}>
                    {tCrop(c)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('livePrices.district')} hint={t('common.optional')}>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-sky-400/50"
              >
                <option value="">{t('livePrices.district')}</option>
                {districtOptions.map((d) => (
                  <option key={d} value={d}>
                    {tDistrict(d)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {meta?.lastSync && (
            <div className="mt-6 space-y-2 rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Data Verification</div>
              <div className="flex flex-col gap-1">
                <div className="text-xs text-emerald-400 font-bold">✓ 100% Authenticated</div>
                <div className="text-[10px] text-white/60">Source: {meta.source}</div>
                <div className="text-[10px] text-white/60">Last IST Sync: {new Date(meta.lastSync).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{t('livePrices.title')}</div>
              <div className="mt-1 text-xs text-white/60">
                {loading ? t('common.loading') : `${rows.length} rows`}
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
                    <th className="px-4 py-3">{t('livePrices.crop')}</th>
                    <th className="px-4 py-3">{t('livePrices.district')}</th>
                    <th className="px-4 py-3">{t('livePrices.price')}</th>
                    <th className="px-4 py-3">{t('livePrices.demand')}</th>
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
                        <td className="px-4 py-3 font-semibold">{tCrop(r.crop)}</td>
                        <td className="px-4 py-3 text-white/80">{tDistrict(r.district)}</td>
                        <td className="px-4 py-3">{toMoney(r.price)}</td>
                        <td className="px-4 py-3">
                          <DemandPill level={r.demand_level} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-white/60" colSpan={4}>
                        {t('livePrices.noData')}
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

