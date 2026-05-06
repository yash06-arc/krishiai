import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CROPS } from '../lib/constants.js'
import { Logo } from './Logo.jsx'
import { useT } from '../lib/i18n.js'

// ── Language context (no i18next — simple state) ──────────────────────────────
export const LangContext = createContext({ lang: 'en', setLang: () => {} })

export function useLang() { return useContext(LangContext) }

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('kn_lang') || 'en')
  const update = (l) => { localStorage.setItem('kn_lang', l); setLang(l) }
  return <LangContext.Provider value={{ lang, setLang: update }}>{children}</LangContext.Provider>
}

// ── Nav labels (en/kn) ────────────────────────────────────────────────────────
const NAV_LABELS = {
  en: {
    home: 'Home', livePrices: 'Live Prices', aiPrediction: 'AI Prediction',
    marketFinder: 'Market Finder', demandMap: 'Demand Map',
    mandiLeaderboard: 'Mandi Leaderboard', weather: 'Weather Intelligence',
    districtComparison: 'District Comparison', profitOptimizer: 'Profit Optimizer',
    priceAlerts: 'Price Alerts', logisticsEstimator: 'Logistics Estimator',
    demandForecast: 'Demand Forecast', investorInfo: 'Investor Info',
    quickCrop: 'Quick Crop', predict: 'Predict',
  },
  kn: {
    home: 'ಮುಖಪುಟ', livePrices: 'ನೇರ ಬೆಲೆಗಳು', aiPrediction: 'AI ಮುನ್ಸೂಚನೆ',
    marketFinder: 'ಮಾರುಕಟ್ಟೆ ಹುಡುಕಿ', demandMap: 'ಬೇಡಿಕೆ ನಕ್ಷೆ',
    mandiLeaderboard: 'ಮಂಡಿ ಲೀಡರ್‌ಬೋರ್ಡ್', weather: 'ಹವಾಮಾನ ಬುದ್ಧಿಮತ್ತೆ',
    districtComparison: 'ಜಿಲ್ಲಾ ಹೋಲಿಕೆ', profitOptimizer: 'ಲಾಭ ಆಪ್ಟಿಮೈಜರ್',
    priceAlerts: 'ಬೆಲೆ ಎಚ್ಚರಿಕೆಗಳು', logisticsEstimator: 'ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಅಂದಾಜು',
    demandForecast: 'ಬೇಡಿಕೆ ಮುನ್ಸೂಚನೆ', investorInfo: 'ಹೂಡಿಕೆದಾರ ಮಾಹಿತಿ',
    quickCrop: 'ತ್ವರಿತ ಬೆಳೆ', predict: 'ಮುನ್ಸೂಚಿಸಿ',
  },
}

const nav = [
  { to: '/', key: 'home' },
  { to: '/live-prices', key: 'livePrices' },
  { to: '/ai-prediction', key: 'aiPrediction' },
  { to: '/market-finder', key: 'marketFinder' },
  { to: '/demand-map', key: 'demandMap' },
  { to: '/mandi-leaderboard', key: 'mandiLeaderboard' },
  { to: '/weather-intelligence', key: 'weather' },
  { to: '/district-comparison', key: 'districtComparison' },
  { to: '/profit-optimizer', key: 'profitOptimizer' },
  { to: '/price-alerts', key: 'priceAlerts' },
  { to: '/logistics-estimator', key: 'logisticsEstimator' },
  { to: '/demand-forecast', key: 'demandForecast' },
  { to: '/investor-info', key: 'investorInfo' },
]

function useHideOnScrollDown({ thresholdPx = 8, topRevealPx = 6 } = {}) {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastY.current = window.scrollY || 0
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      window.requestAnimationFrame(() => {
        const y = window.scrollY || 0
        const dy = y - lastY.current
        if (y <= topRevealPx) setHidden(false)
        else if (dy > thresholdPx) setHidden(true)
        else if (dy < -thresholdPx) setHidden(false)
        lastY.current = y
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [thresholdPx, topRevealPx])

  return hidden
}

export function Navbar() {
  const { lang, setLang } = useLang()
  const { tCrop } = useT()
  const L = NAV_LABELS[lang]
  const location = useLocation()
  const navigate = useNavigate()
  const [crop, setCrop] = useState('Tomato')
  const [open, setOpen] = useState(false)
  const hidden = useHideOnScrollDown()

  useEffect(() => setOpen(false), [location.pathname])
  const cropOptions = useMemo(() => CROPS, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        className="mx-auto max-w-7xl px-4 py-3 sm:px-6"
        initial={false}
        animate={hidden ? { y: -96, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Main pill */}
          <div className="panel-pill flex min-h-[64px] flex-1 items-center gap-2 px-4 py-3 overflow-hidden">
            <Link to="/" className="shrink-0">
              <Logo />
            </Link>

            {/* Scrollable nav */}
            <nav
              className="hidden lg:flex items-center gap-1 overflow-x-auto flex-1 px-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'relative shrink-0 rounded-2xl px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white',
                      isActive ? 'text-white' : '',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10 whitespace-nowrap">{L[item.key]}</span>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-2xl bg-white/10 ring-1 ring-white/10"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
              className="shrink-0 panel-pill h-9 px-3 text-[11px] font-bold tracking-wider text-white hover:bg-white/10 transition"
              title="Switch language"
            >
              {lang === 'en' ? 'ಕನ್ನಡ' : 'ENG'}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
            >
              <span className="text-lg">{open ? '×' : '☰'}</span>
            </button>
          </div>

          {/* Quick-crop pill */}
          <div className="panel-pill hidden min-h-[64px] items-center gap-3 px-5 py-3 lg:flex shrink-0">
            <div className="min-w-[180px]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                {L.quickCrop}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                >
                  {cropOptions.map((c) => (
                    <option key={c} value={c} className="bg-ink-900">{tCrop(c)}</option>
                  ))}
                </select>
                <span className="text-white/40">▾</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/ai-prediction?crop=${encodeURIComponent(crop)}`)}
              className="rounded-2xl bg-gradient-to-r from-emerald-300/25 to-sky-300/25 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 backdrop-blur transition hover:from-emerald-300/35 hover:to-sky-300/35 shrink-0"
            >
              {L.predict}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="mt-3 grid gap-2 lg:hidden">
            <div className="panel-pill p-3">
              <div className="grid gap-1">
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-2xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    {L[item.key]}
                  </Link>
                ))}
              </div>
              <div className="mt-3 border-t border-white/10 pt-3 flex gap-2">
                <button
                  onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
                  className="flex-1 rounded-2xl bg-white/5 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/10"
                >
                  {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
                </button>
              </div>
            </div>
            <div className="panel-pill p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                {L.quickCrop}
              </div>
              <div className="mt-2 flex gap-2">
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full rounded-2xl bg-ink-900/60 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10"
                >
                  {cropOptions.map((c) => (
                    <option key={c} value={c}>{tCrop(c)}</option>
                  ))}
                </select>
                <button
                  onClick={() => navigate(`/ai-prediction?crop=${encodeURIComponent(crop)}`)}
                  className="shrink-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-2 text-sm font-semibold text-ink-950"
                >
                  {L.predict}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </header>
  )
}
