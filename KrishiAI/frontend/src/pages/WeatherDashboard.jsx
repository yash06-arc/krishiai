import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { fetchWeatherCurrent, fetchWeatherForecast, fetchWeatherInsights } from '../lib/api'
import { GlassCard } from '../components/GlassCard'
import { StateBanner } from '../components/StateBanner'
import { Field } from '../components/Field'
import { WhatsAppQR } from '../components/WhatsAppQR'
import { useT } from '../lib/i18n.js'

import { DISTRICTS, CROPS } from '../lib/constants.js'

function StatCell({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</div>
      <div className="mt-1 text-lg font-bold text-white">{value ?? '—'}</div>
    </div>
  )
}

export function WeatherDashboard() {
  const { t, tCrop, tDistrict } = useT()
  const [district, setDistrict] = useState('Mysuru')
  const [crop, setCrop] = useState('Tomato')
  const [current, setCurrent] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch current weather + forecast when district changes
  useEffect(() => {
    const go = async () => {
      setLoading(true)
      setError(null)
      try {
        const [cur, fore] = await Promise.all([
          fetchWeatherCurrent(district),
          fetchWeatherForecast(district),
        ])
        setCurrent(cur)
        setForecast(fore)
      } catch (e) {
        console.error(e)
        setError(t('common.error'))
      } finally {
        setLoading(false)
      }
    }
    go()
  }, [district, t])

  // Fetch AI insights when crop or district changes
  const loadInsights = useCallback(async () => {
    setAiLoading(true)
    setInsights(null)
    try {
      const res = await fetchWeatherInsights(district, crop)
      setInsights(res.insights)
    } catch (e) {
      console.error(e)
      setInsights(t('common.error'))
    } finally {
      setAiLoading(false)
    }
  }, [district, crop, t])

  useEffect(() => { loadInsights() }, [loadInsights])

  // Parse daily forecast rows from Open-Meteo
  const dailyDays = forecast?.daily?.time ?? []
  const dailyMaxTemp = forecast?.daily?.temperature_2m_max ?? []
  const dailyMinTemp = forecast?.daily?.temperature_2m_min ?? []
  const dailyRainProb = forecast?.daily?.precipitation_probability_max ?? []

  return (
    <div className="space-y-8">
      <StateBanner
        title={t('weather.title')}
        subtitle={t('weather.description')}
        right={
          <div className="hidden rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 md:block">
            <div className="text-xs text-white/60">{t('common.live')}</div>
            <div className="mt-1 font-mono text-xs text-white/70">{tDistrict(district)}, Karnataka</div>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Filters */}
        <GlassCard className="p-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
          <div className="text-sm font-semibold">{t('weather.filters')}</div>
          <div className="mt-4 grid gap-4">
            <Field label={t('weather.selectDistrict')}>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-emerald-400/50 appearance-none"
              >
                {DISTRICTS.map(d => (
                  <option key={d} value={d} className="bg-ink-950">{tDistrict(d)}</option>
                ))}
              </select>
            </Field>
            <Field label={t('weather.selectCrop')}>
              <select
                value={crop}
                onChange={e => setCrop(e.target.value)}
                className="w-full rounded-xl bg-ink-900/60 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-sky-400/50 appearance-none"
              >
                {CROPS.map(c => (
                  <option key={c} value={c} className="bg-ink-950">{tCrop(c)}</option>
                ))}
              </select>
            </Field>
            <button
              onClick={loadInsights}
              className="rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-2.5 text-sm font-bold text-ink-950 transition active:scale-95"
            >
              {t('weather.refreshAi')}
            </button>
          </div>
          <div className="mt-6 hidden lg:block">
            <WhatsAppQR />
          </div>
        </GlassCard>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {error && (
            <GlassCard className="p-6 text-center text-red-400 font-semibold">{error}</GlassCard>
          )}

          {loading ? (
            <GlassCard className="p-20 text-center text-white/30 italic">
              {t('weather.fetching')}
            </GlassCard>
          ) : !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Weather */}
              <GlassCard className="p-8">
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">{t('weather.currentConditions')}</div>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-7xl font-bold text-white">{Math.round(current?.temp ?? 0)}°</span>
                  <span className="text-2xl text-white/40 font-medium">C</span>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-6">
                  <StatCell label={t('weather.humidity')} value={current?.humidity != null ? `${current.humidity}%` : null} />
                  <StatCell label={t('weather.wind')} value={current?.wind_speed != null ? `${current.wind_speed} km/h` : null} />
                  <StatCell label={t('weather.rain')} value={current?.rain_prob != null ? `${current.rain_prob} mm` : null} />
                  <StatCell label={t('weather.cloudCover')} value={current?.cloud_cover != null ? `${current.cloud_cover}%` : null} />
                </div>

                {(current?.wind_speed ?? 0) > 20 && (
                  <div className="mt-6 rounded-2xl bg-red-500/10 p-4 ring-1 ring-red-500/20 flex items-center gap-3">
                    <div className="text-xl">⚠️</div>
                    <div>
                      <h4 className="text-sm font-bold text-red-400">{t('weather.alert.highWind')}</h4>
                      <p className="text-xs text-white/60">{t('weather.alert.highWindMsg').replace('{{speed}}', current.wind_speed)}</p>
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* AI Decision Support */}
              <GlassCard className="p-8 flex flex-col border-l-4 border-emerald-500/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{t('weather.aiSupport').replace('{{crop}}', tCrop(crop))}</h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold ring-1 ring-emerald-500/20">AI</div>
                </div>
                <div className="text-xs text-white/40 mt-1">{tCrop(crop)} · {tDistrict(district)}</div>

                <div className="mt-6 flex-1">
                  {aiLoading ? (
                    <div className="flex items-center gap-3 text-white/40 italic">
                      <div className="h-4 w-4 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin" />
                      {t('weather.analyzing')}
                    </div>
                  ) : (
                    <p className="text-white/80 leading-relaxed whitespace-pre-line text-sm">
                      {insights ?? t('weather.analyzing')}
                    </p>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* 7-Day Forecast */}
          {!loading && !error && dailyDays.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white px-2">{t('weather.forecast7Day')}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {dailyDays.slice(0, 7).map((date, i) => (
                  <GlassCard key={i} className="p-4 text-center flex flex-col items-center group hover:bg-white/5 transition">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">
                      {new Date(date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </div>
                    <div className="text-2xl">
                      {(dailyRainProb[i] ?? 0) > 50 ? '🌧️' : (dailyMaxTemp[i] ?? 0) > 32 ? '☀️' : '⛅'}
                    </div>
                    <div className="mt-2 text-lg font-bold text-white">{Math.round(dailyMaxTemp[i] ?? 0)}°</div>
                    <div className="text-[10px] text-white/40">{Math.round(dailyMinTemp[i] ?? 0)}°</div>
                    <div className="mt-2 text-[10px] font-medium text-sky-400">
                      🌧 {dailyRainProb[i] ?? 0}%
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
