import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import { CROPS } from '../lib/constants.js'
import { VideoGuideModal } from '../components/VideoGuideModal.jsx'

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">
      {children}
    </span>
  )
}

function SectionTitle({ eyebrow, title, desc }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="text-xs font-semibold uppercase tracking-widest text-white/60">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {desc ? <p className="mt-3 text-pretty text-white/65">{desc}</p> : null}
    </div>
  )
}

export function Home() {
  const navigate = useNavigate()
  const [crop, setCrop] = useState('Tomato')
  const crops = useMemo(() => CROPS, [])
  const [videoOpen, setVideoOpen] = useState(false)
  const HERO_BG =
    'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=2400&q=80'
  const GUIDE_VIDEO_URL = import.meta.env.VITE_GUIDE_VIDEO_URL || ''

  return (
    <div className="space-y-16">
      <VideoGuideModal
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        videoUrl={GUIDE_VIDEO_URL}
        title="KrishiAI Farmer Walkthrough"
      />
      <section className="relative overflow-hidden rounded-3xl border border-white/10 shadow-glow">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />
        <div className="absolute inset-0 opacity-90">
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-fuchsia-400/15 blur-3xl" />
        </div>

        <div className="relative grid min-h-[calc(100svh-140px)] gap-10 px-6 py-14 lg:grid-cols-2 lg:gap-12 lg:px-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Pill>Live mandi prices</Pill>
              <Pill>AI prediction</Pill>
              <Pill>Demand intelligence</Pill>
              <Pill>Market finder</Pill>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              <span className="krishi-gradient-text">AI Powered</span> Crop Market Intelligence
            </motion.h1>
            <p className="max-w-xl text-pretty text-white/70">
              Helping farmers predict prices, analyze demand, and find the best markets to
              sell—built for Karnataka today, scalable for India tomorrow.
            </p>

            <div className="neon-glass p-5">
              <div className="relative">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Crop Search
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                  <div className="flex items-center gap-3 rounded-2xl bg-black/30 px-4 py-3 ring-1 ring-white/10 backdrop-blur">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
                      <span className="text-sm">⌕</span>
                    </div>
                    <select
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      className="w-full bg-transparent text-sm text-white outline-none"
                    >
                      {crops.map((c) => (
                        <option key={c} value={c} className="bg-ink-900">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => navigate(`/ai-prediction?crop=${encodeURIComponent(crop)}`)}
                    className="rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:opacity-95"
                  >
                    Try AI Prediction
                  </button>
                  <button
                    onClick={() => navigate('/demand-map')}
                    className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                  >
                    Explore Market Map
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 self-center">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="neon-glass p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Signal
                </div>
                <div className="mt-3 text-2xl font-semibold">District-wise insights</div>
                <p className="mt-2 text-sm text-white/65">
                  Compare prices across Karnataka and find better selling opportunities.
                </p>
              </div>
              <div className="neon-glass p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Model
                </div>
                <div className="mt-3 text-2xl font-semibold">Regression forecasting</div>
                <p className="mt-2 text-sm text-white/65">
                  Predict future prices using historical price signals and seasonality.
                </p>
              </div>
            </div>
            <div className="neon-glass p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Pitch-ready dashboard
              </div>
              <div className="mt-3 text-2xl font-semibold">
                Glassmorphism • Motion • Charts • Maps
              </div>
              <p className="mt-2 text-sm text-white/65">
                A modern agritech UI designed to impress investors while staying farmer-first.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { k: 'States', v: '1 (Karnataka)' },
                  { k: 'Districts', v: '29 covered' },
                  { k: 'Crops', v: '20 supported' },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                    <div className="text-xs text-white/60">{s.k}</div>
                    <div className="mt-1 text-sm font-semibold">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="video-guide" className="space-y-8">
        <SectionTitle
          eyebrow="AI Video Guide"
          title="One-tap walkthrough for farmers"
          desc="A simple voice-guided video that explains how to use every feature of KrishiAI."
        />

        <div className="mx-auto max-w-5xl">
          <div className="neon-glass p-6">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <button
                onClick={() => setVideoOpen(true)}
                className="group relative overflow-hidden rounded-3xl bg-black/40 ring-1 ring-white/10 transition hover:bg-black/35"
                aria-label="Watch KrishiAI guide video"
              >
                <div className="aspect-video">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/15 via-sky-400/10 to-fuchsia-400/10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_55%)]" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="grid place-items-center rounded-full bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur transition group-hover:bg-white/15">
                      <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 text-ink-950">
                        ▶
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                    <div className="text-left">
                      <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                        Click to play
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        How to use KrishiAI (full website)
                      </div>
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">
                      2–3 min
                    </div>
                  </div>
                </div>
              </button>

              <div className="space-y-4">
                <div className="text-lg font-semibold">What the guide covers</div>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>1) Live Prices: filter crop & district</li>
                  <li>2) AI Prediction: get future price + chart</li>
                  <li>3) Market Finder: best district to sell</li>
                  <li>4) Demand Map: district demand colors</li>
                  <li>5) District Comparison: price bar chart</li>
                </ul>
                <div className="rounded-2xl bg-white/5 p-4 text-xs text-white/60 ring-1 ring-white/10">
                  Tip: Put your AI guide video URL in{' '}
                  <span className="font-mono text-white/80">frontend/.env</span> as{' '}
                  <span className="font-mono text-white/80">VITE_GUIDE_VIDEO_URL</span>.
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setVideoOpen(true)}
                    className="rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:opacity-95"
                  >
                    Watch guide
                  </button>
                  <button
                    onClick={() => navigate('/live-prices')}
                    className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                  >
                    Start with Live Prices
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="space-y-8">
        <SectionTitle
          eyebrow="Problem"
          title="Farmers sell at low prices due to lack of market intelligence"
          desc="Most small and mid-size farmers lack timely, district-level visibility into price trends and demand signals."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: 'No price prediction',
              d: 'Without forecasts, farmers can’t time the market or plan harvest decisions.',
            },
            {
              t: 'No demand visibility',
              d: 'Demand varies by district and season—yet tools rarely visualize it clearly.',
            },
            {
              t: 'Limited market awareness',
              d: 'Farmers miss higher-paying mandis because comparisons are time-consuming.',
            },
          ].map((c) => (
            <div key={c.t} className="glass rounded-2xl p-6">
              <div className="text-lg font-semibold">{c.t}</div>
              <p className="mt-2 text-sm text-white/65">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="solution" className="space-y-8">
        <SectionTitle
          eyebrow="Solution"
          title="KrishiAI turns raw market data into clear selling decisions"
          desc="A single platform for live prices, AI forecasts, market discovery, and district-level demand intelligence."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            {
              t: 'Live mandi price dashboard',
              d: 'Filter by crop and district to get actionable signals instantly.',
              a: () => navigate('/live-prices'),
              cta: 'View live prices',
            },
            {
              t: 'AI price prediction',
              d: 'Regression model predicts near-future price using trend + seasonality features.',
              a: () => navigate('/ai-prediction'),
              cta: 'Try prediction',
            },
            {
              t: 'Market comparison',
              d: 'Find the best district to sell and compare price distribution with charts.',
              a: () => navigate('/market-finder'),
              cta: 'Find best market',
            },
            {
              t: 'District demand heatmap',
              d: 'Interactive map overlay showing district demand levels for quick opportunity spotting.',
              a: () => navigate('/demand-map'),
              cta: 'Explore demand map',
            },
          ].map((f) => (
            <div key={f.t} className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{f.t}</div>
                  <p className="mt-2 text-sm text-white/65">{f.d}</p>
                </div>
                <button
                  onClick={f.a}
                  className="shrink-0 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/10 transition hover:bg-white/15"
                >
                  {f.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="technology" className="space-y-8">
        <SectionTitle
          eyebrow="Technology"
          title="Built like a real startup product"
          desc="Fast UI, credible ML pipeline, and clean API boundaries for deployment on Vercel + Render."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: 'Machine learning models',
              d: 'Scikit-learn regression trained on crop + district + date features.',
            },
            { t: 'Market data analytics', d: 'Pandas transforms price trends & demand signals.' },
            {
              t: 'Location based insights',
              d: 'Leaflet overlays demand per district for quick scanning.',
            },
          ].map((c) => (
            <div key={c.t} className="glass rounded-2xl p-6">
              <div className="text-lg font-semibold">{c.t}</div>
              <p className="mt-2 text-sm text-white/65">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="investor" className="space-y-8">
        <SectionTitle
          eyebrow="Investor"
          title="A scalable agritech intelligence platform"
          desc="KrishiAI can evolve into a national crop market intelligence layer for farmers, traders, and agri-fintech."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <div className="text-lg font-semibold">Why now</div>
            <p className="mt-2 text-sm text-white/65">
              India has over <span className="font-semibold text-white">140 million</span>{' '}
              farmers, and agritech adoption is accelerating with digital payments, logistics,
              and advisory. A trusted “market intelligence” layer unlocks better pricing and
              reduces middleman advantage.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { k: 'TAM', v: 'National scale' },
                { k: 'Moat', v: 'Data + distribution' },
                { k: 'Revenue', v: 'SaaS + lead gen' },
              ].map((s) => (
                <div key={s.k} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-xs text-white/60">{s.k}</div>
                  <div className="mt-1 text-sm font-semibold">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="text-lg font-semibold">Founder</div>
            <div className="mt-2 text-sm text-white/70">
              <div className="font-semibold text-white">Yashwanth</div>
              <div>Information Science Engineering Student</div>
              <div>Agritech Innovator</div>
            </div>
            <button
              onClick={() => navigate('/investor-info')}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-2.5 text-sm font-semibold text-ink-950"
            >
              View investor info
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

