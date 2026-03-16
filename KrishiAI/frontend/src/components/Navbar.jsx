import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import { CROPS } from '../lib/constants.js'
import { Logo } from './Logo.jsx'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/live-prices', label: 'Live Prices' },
  { to: '/ai-prediction', label: 'AI Prediction' },
  { to: '/market-finder', label: 'Market Finder' },
  { to: '/demand-map', label: 'Demand Map' },
  { to: '/district-comparison', label: 'District Comparison' },
  { to: '/profit-optimizer', label: 'Profit Optimizer' },
  { to: '/price-alerts', label: 'Price Alerts' },
  { to: '/logistics-estimator', label: 'Logistics Estimator' },
  { to: '/demand-forecast', label: 'Demand Forecast' },
  { to: '/investor-info', label: 'Investor Info' },
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

        // Always show near top
        if (y <= topRevealPx) {
          setHidden(false)
        } else if (dy > thresholdPx) {
          setHidden(true) // scrolling down
        } else if (dy < -thresholdPx) {
          setHidden(false) // scrolling up
        }

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
          {/* Left main pill (logo + nav) */}
          <div className="panel-pill flex min-h-[64px] flex-1 items-center justify-between px-4 py-3">
            <Link to="/" className="shrink-0">
              <Logo />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'relative rounded-2xl px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white',
                      isActive ? 'text-white' : '',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="relative z-10">{item.label}</span>
                      {isActive ? (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-2xl bg-white/10 ring-1 ring-white/10"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      ) : null}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10 lg:hidden"
              aria-label="Open menu"
            >
              <span className="text-lg">{open ? '×' : '☰'}</span>
            </button>
          </div>

          {/* Right quick-crop pill (separate, like screenshot) */}
          <div className="panel-pill hidden min-h-[64px] items-center gap-3 px-5 py-3 lg:flex">
            <div className="min-w-[220px]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                QUICK CROP
              </div>
              <div className="mt-1 flex items-center gap-2">
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none"
                >
                  {cropOptions.map((c) => (
                    <option key={c} value={c} className="bg-ink-900">
                      {c}
                    </option>
                  ))}
                </select>
                <span className="text-white/40">▾</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/ai-prediction?crop=${encodeURIComponent(crop)}`)}
              className="rounded-2xl bg-gradient-to-r from-emerald-300/25 to-sky-300/25 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 backdrop-blur transition hover:from-emerald-300/35 hover:to-sky-300/35"
            >
              Predict
            </button>
          </div>
        </div>

        {open ? (
          <div className="mt-3 grid gap-2 lg:hidden">
            <div className="panel-pill p-3">
              <div className="grid gap-1">
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-2xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="panel-pill p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                Quick crop
              </div>
              <div className="mt-2 flex gap-2">
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full rounded-2xl bg-ink-900/60 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10"
                >
                  {cropOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => navigate(`/ai-prediction?crop=${encodeURIComponent(crop)}`)}
                  className="shrink-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-2 text-sm font-semibold text-ink-950"
                >
                  Predict
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </motion.div>
    </header>
  )
}

