import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'

import { GlassCard } from '../components/GlassCard.jsx'
import { Field } from '../components/Field.jsx'
import { StateBanner } from '../components/StateBanner.jsx'
import { fetchDemand } from '../lib/api.js'
import { CROPS, DISTRICTS } from '../lib/constants.js'
import { KARNATAKA_CENTROIDS } from '../lib/karnatakaCentroids.js'

function colorFor(level) {
  if (level === 'High') return '#ef4444'
  if (level === 'Medium') return '#f59e0b'
  return '#22c55e'
}

export function DemandMap() {
  const crops = useMemo(() => CROPS, [])
  const districts = useMemo(() => DISTRICTS, [])

  const [crop, setCrop] = useState('Tomato')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    fetchDemand({ crop })
      .then((d) => alive && setItems(d?.items || []))
      .catch((e) => alive && setError(e.message || 'Failed to load demand'))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [crop])

  const byDistrict = useMemo(() => {
    const m = new Map()
    items.forEach((it) => m.set(it.district, it))
    return m
  }, [items])

  return (
    <div className="space-y-8">
      <StateBanner
        title="Demand Heatmap"
        subtitle="Interactive Karnataka map overlay showing demand levels (High → red, Medium → orange, Low → green)."
        right={
          <div className="hidden rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 md:block">
            <div className="text-xs text-white/60">API</div>
            <div className="mt-1 font-mono text-xs text-white/70">GET /demand</div>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-1 lg:sticky lg:top-28 lg:self-start">
          <div className="text-sm font-semibold">Filters</div>
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

            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Legend
              </div>
              <div className="mt-3 grid gap-2 text-sm text-white/75">
                {[
                  { l: 'High', c: '#ef4444' },
                  { l: 'Medium', c: '#f59e0b' },
                  { l: 'Low', c: '#22c55e' },
                ].map((x) => (
                  <div key={x.l} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: x.c }}
                    />
                    <span>{x.l} demand</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-white/50">
                Overlay uses district centroids (pitch-friendly visualization).
              </div>
            </div>

            {error ? (
              <div className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-200 ring-1 ring-red-500/20">
                {error}
              </div>
            ) : null}
          </div>
        </GlassCard>

        <GlassCard className="p-3 lg:col-span-2">
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
            <div className="absolute left-3 top-3 z-[500] rounded-xl bg-black/40 px-3 py-2 text-xs text-white/70 ring-1 ring-white/10 backdrop-blur">
              {loading ? 'Loading demand…' : `Showing ${crop} demand across Karnataka`}
            </div>
            <MapContainer
              center={[14.6, 76.4]}
              zoom={7}
              style={{ height: 520, width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {districts.map((d) => {
                const it = byDistrict.get(d)
                const level = it?.demand_level || 'Low'
                const pos = KARNATAKA_CENTROIDS[d]
                if (!pos) return null
                return (
                  <CircleMarker
                    key={d}
                    center={pos}
                    radius={10}
                    pathOptions={{
                      color: colorFor(level),
                      fillColor: colorFor(level),
                      fillOpacity: 0.25,
                      weight: 2,
                    }}
                  >
                    <Tooltip direction="top" opacity={1} sticky>
                      <div className="text-xs">
                        <div className="font-semibold">{d}</div>
                        <div>Demand: {level}</div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

