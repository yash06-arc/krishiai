import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import { CROPS } from '../lib/constants.js'
import { VideoGuideModal } from '../components/VideoGuideModal.jsx'
import { useT } from '../lib/i18n.js'

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
  const { t, tCrop } = useT()
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
        title={t('guide.title')}
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
              <Pill>{t('nav.livePrices')}</Pill>
              <Pill>{t('nav.aiPrediction')}</Pill>
              <Pill>{t('nav.weather')}</Pill>
              <Pill>{t('nav.marketFinder')}</Pill>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              <span className="krishi-gradient-text">{t('home.title')}</span> {t('home.titleGradient')}
            </motion.h1>
            <p className="max-w-xl text-pretty text-white/70">
              {t('home.subtitle')}
            </p>

            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 ring-1 ring-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="text-base">✓</span>
              {t('home.verified')}
            </div>

            <div className="neon-glass p-5">
              <div className="relative">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t('nav.quickCrop')}
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
                          {tCrop(c)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => navigate(`/ai-prediction?crop=${encodeURIComponent(crop)}`)}
                    className="rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:opacity-95"
                  >
                    {t('nav.predict')}
                  </button>
                  <button
                    onClick={() => navigate('/demand-map')}
                    className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                  >
                    {t('nav.demandMap')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 self-center">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="neon-glass p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t('nav.livePrices')}
                </div>
                <div className="mt-3 text-2xl font-semibold">{t('home.card1Title')}</div>
                <p className="mt-2 text-sm text-white/65">
                  {t('home.card1Desc')}
                </p>
              </div>
              <div className="neon-glass p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t('nav.aiPrediction')}
                </div>
                <div className="mt-3 text-2xl font-semibold">{t('home.card2Title')}</div>
                <p className="mt-2 text-sm text-white/65">
                  {t('home.card2Desc')}
                </p>
              </div>
            </div>
            <div className="neon-glass p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
                {t('home.badge')}
              </div>
              <div className="mt-3 text-2xl font-semibold">
                {t('home.card3Title')}
              </div>
              <p className="mt-2 text-sm text-white/65">
                {t('home.card3Desc')}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { k: t('home.stat1Label'), v: t('home.stat1Value') },
                  { k: t('home.stat2Label'), v: t('home.stat2Value') },
                  { k: t('home.stat3Label'), v: t('home.stat3Value') },
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
          eyebrow={t('nav.weather')}
          title={t('guide.title')}
          desc={t('home.subtitle')}
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
                        {t('guide.clickToPlay')}
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {t('guide.howToUse')}
                      </div>
                    </div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">
                      {t('guide.duration')}
                    </div>
                  </div>
                </div>
              </button>

              <div className="space-y-4">
                <div className="text-lg font-semibold">{t('guide.coversTitle')}</div>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>{t('guide.item1')}</li>
                  <li>{t('guide.item2')}</li>
                  <li>{t('guide.item3')}</li>
                  <li>{t('guide.item4')}</li>
                  <li>{t('guide.item5')}</li>
                </ul>
                <div className="rounded-2xl bg-white/5 p-4 text-xs text-white/60 ring-1 ring-white/10">
                  {t('guide.tip')}:{' '}
                  <span className="font-mono text-white/80">frontend/.env</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setVideoOpen(true)}
                    className="rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:opacity-95"
                  >
                    {t('guide.watch')}
                  </button>
                  <button
                    onClick={() => navigate('/live-prices')}
                    className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/15"
                  >
                    {t('guide.start')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="space-y-8">
        <SectionTitle
          eyebrow={t('problem.eyebrow')}
          title={t('problem.title')}
          desc={t('problem.desc')}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              t: t('problem.item1Title'),
              d: t('problem.item1Desc'),
            },
            {
              t: t('problem.item2Title'),
              d: t('problem.item2Desc'),
            },
            {
              t: t('problem.item3Title'),
              d: t('problem.item3Desc'),
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
          eyebrow={t('solution.eyebrow')}
          title={t('solution.title')}
          desc={t('solution.desc')}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            {
              t: t('solution.item1Title'),
              d: t('solution.item1Desc'),
              a: () => navigate('/live-prices'),
              cta: t('solution.item1Cta'),
            },
            {
              t: t('solution.item2Title'),
              d: t('solution.item2Desc'),
              a: () => navigate('/ai-prediction'),
              cta: t('solution.item2Cta'),
            },
            {
              t: t('solution.item3Title'),
              d: t('solution.item3Desc'),
              a: () => navigate('/market-finder'),
              cta: t('solution.item3Cta'),
            },
            {
              t: t('solution.item4Title'),
              d: t('solution.item4Desc'),
              a: () => navigate('/demand-map'),
              cta: t('solution.item4Cta'),
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

      <section id="investor" className="space-y-8">
        <SectionTitle
          eyebrow={t('investorInfo.founder')}
          title={t('investorInfo.title')}
          desc={t('investorInfo.subtitle')}
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <div className="text-lg font-semibold">{t('investorInfo.startupPotential')}</div>
            <p className="mt-2 text-sm text-white/65">
              {t('investorInfo.startupDesc')}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { k: 'TAM', v: t('investorInfo.national') },
                { k: t('investorInfo.moat'), v: t('investorInfo.moatValue') },
                { k: t('investorInfo.revenue'), v: t('investorInfo.revenueValue') },
              ].map((s) => (
                <div key={s.k} className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="text-xs text-white/60">{s.k}</div>
                  <div className="mt-1 text-sm font-semibold">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="text-lg font-semibold">{t('investorInfo.founder')}</div>
            <div className="mt-2 text-sm text-white/70">
              <div className="font-semibold text-white">{t('investorInfo.yashwanth')}</div>
              <div>{t('investorInfo.student')}</div>
              <div>{t('investorInfo.innovator')}</div>
            </div>
            <button
              onClick={() => navigate('/investor-info')}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-2.5 text-sm font-semibold text-ink-950"
            >
              {t('nav.investorInfo')}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

