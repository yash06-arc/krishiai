import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  fetchLeaderboard, 
  fetchLeaderboardOverall, 
  registerSupply, 
  confirmDelivery,
  fetchFarmerCommitments 
} from '../lib/api'
import { DISTRICTS, CROPS } from '../lib/constants'
import { GlassCard } from '../components/GlassCard'
import { StateBanner } from '../components/StateBanner'
import { useT } from '../lib/i18n.js'

export function MandiLeaderboard() {
  const { t, tCrop, tDistrict } = useT()
  const [leaderboard, setLeaderboard] = useState([])
  const [overall, setOverall] = useState([])
  const [view, setView] = useState('overall') // 'overall' or 'item'
  const [filterItem, setFilterItem] = useState('')
  const [loading, setLoading] = useState(true)

  // Modals state
  const [showSupplyModal, setShowSupplyModal] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)

  const loadData = async () => {
    try {
      if (view === 'overall') {
        const res = await fetchLeaderboardOverall()
        setOverall(res.overall_leaderboard || [])
      } else {
        const res = await fetchLeaderboard({ item: filterItem })
        setLeaderboard(res.leaderboard || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 10000) // 10s polling
    return () => clearInterval(interval)
  }, [view, filterItem])

  return (
    <div className="space-y-8">
      <StateBanner
        title={t('leaderboard.title')}
        subtitle={t('leaderboard.description')}
        right={
          <div className="flex gap-3">
            <button 
              onClick={() => setShowSupplyModal(true)}
              className="rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-6 py-3 text-sm font-bold text-ink-950 shadow-lg shadow-emerald-500/20 hover:scale-105 transition active:scale-95"
            >
              {t('leaderboard.registerSupplyBtn')}
            </button>
            <button 
              onClick={() => setShowDeliveryModal(true)}
              className="rounded-2xl bg-white/5 px-6 py-3 text-sm font-bold text-white ring-1 ring-white/10 hover:bg-white/10 transition"
            >
              {t('leaderboard.confirmDeliveryBtn')}
            </button>
          </div>
        }
      />

      <div className="grid gap-6">
        <GlassCard className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-1 p-1 bg-white/5 rounded-2xl ring-1 ring-white/10">
            <button 
              onClick={() => setView('overall')}
              className={`rounded-xl px-6 py-2 text-xs font-bold transition-all ${view === 'overall' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
            >
              {t('leaderboard.overallDemandTab')}
            </button>
            <button 
              onClick={() => setView('item')}
              className={`rounded-xl px-6 py-2 text-xs font-bold transition-all ${view === 'item' ? 'bg-white/10 text-white shadow-sm' : 'text-white/50 hover:text-white'}`}
            >
              {t('leaderboard.perCropDemandTab')}
            </button>
          </div>

          {view === 'item' && (
            <input 
              type="text"
              placeholder={t('leaderboard.searchPlaceholder')}
              value={filterItem}
              onChange={e => setFilterItem(e.target.value)}
              className="w-full sm:w-64 rounded-xl bg-ink-900/60 px-4 py-2 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-emerald-400/50"
            />
          )}
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                <tr>
                  <th className="px-6 py-4">{t('leaderboard.rank')}</th>
                  <th className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {t('leaderboard.mandiDistrict')}
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[8px] font-medium text-emerald-400/80 tracking-normal uppercase">Live</span>
                    </div>
                  </th>
                  {view === 'item' && <th className="px-6 py-4">{t('leaderboard.crop')}</th>}
                  <th className="px-6 py-4">{t('leaderboard.unmetDemand')}</th>
                  <th className="px-6 py-4">{t('leaderboard.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading && (
                  <tr><td colSpan={5} className="p-12 text-center text-white/30 italic">{t('common.loading')}</td></tr>
                )}
                
                {!loading && view === 'overall' && overall.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 font-mono font-bold text-emerald-400">#{i + 1}</td>
                    <td className="px-6 py-4 text-white font-medium">{tDistrict(row.mandi_id)}</td>
                    <td className="px-6 py-4 font-mono text-white/90">{Math.round(row.total_unmet)} Qtl</td>
                    <td className="px-6 py-4">
                      <StatusBadge unmet={row.total_unmet} base={row.total_base} t={t} />
                    </td>
                  </tr>
                ))}

                {!loading && view === 'item' && leaderboard.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 font-mono font-bold text-sky-400">#{i + 1}</td>
                    <td className="px-6 py-4 text-white font-medium">{tDistrict(row.mandi_id)}</td>
                    <td className="px-6 py-4 text-emerald-400 font-bold">{tCrop(row.item)}</td>
                    <td className="px-6 py-4 font-mono text-white/90">{Math.round(row.unmet_demand)} Qtl</td>
                    <td className="px-6 py-4">
                      <StatusBadge unmet={row.unmet_demand} base={row.base_demand} t={t} />
                    </td>
                  </tr>
                ))}
                
                {!loading && ((view === 'overall' && !overall.length) || (view === 'item' && !leaderboard.length)) && (
                  <tr><td colSpan={5} className="p-12 text-center text-white/30">{t('common.noData')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <AnimatePresence>
          {showSupplyModal && <SupplyModal t={t} tDistrict={tDistrict} tCrop={tCrop} onClose={() => { setShowSupplyModal(false); loadData(); }} />}
          {showDeliveryModal && <DeliveryModal t={t} tDistrict={tDistrict} tCrop={tCrop} onClose={() => { setShowDeliveryModal(false); loadData(); }} />}
        </AnimatePresence>
      </div>
    </div>
  )
}

function StatusBadge({ unmet, base, t }) {
  if (base === 0) return null;
  const ratio = unmet / base;
  if (ratio > 0.7) {
    return <span className="inline-flex items-center rounded-lg bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-400 ring-1 ring-inset ring-red-500/20 uppercase">{t('demandMap.high')}</span>
  } else if (ratio > 0.3) {
    return <span className="inline-flex items-center rounded-lg bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-400 ring-1 ring-inset ring-amber-500/20 uppercase">{t('demandMap.medium')}</span>
  } else {
    return <span className="inline-flex items-center rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 ring-1 ring-inset ring-emerald-500/20 uppercase">{t('demandMap.low')}</span>
  }
}

// --- MODALS ---

function SupplyModal({ t, tDistrict, tCrop, onClose }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ farmer_id: '', mandi_id: '', item: '', quantity: '', phone: '' })
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await registerSupply({ ...formData, agreement_accepted: accepted })
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md overflow-hidden shadow-2xl">
        <div className="border-b border-white/10 px-6 py-5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">{t('leaderboard.modal.registerTitle')}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="p-6 space-y-4">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">{t('leaderboard.modal.farmerId')}</label>
                <input 
                  type="text" value={formData.farmer_id} onChange={e => setFormData({...formData, farmer_id: e.target.value})}
                  className="w-full rounded-xl bg-ink-950/40 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-emerald-400/50 transition-all" 
                  placeholder="e.g. FARMER-101"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">{t('leaderboard.modal.mandiDistrict')}</label>
                <select 
                  value={formData.mandi_id} onChange={e => setFormData({...formData, mandi_id: e.target.value})}
                  className="w-full rounded-xl bg-ink-950/40 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-emerald-400/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- {t('leaderboard.modal.mandiDistrict')} --</option>
                  {DISTRICTS.map(d => (
                    <option key={d} value={d} className="bg-ink-950">{tDistrict(d)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">{t('leaderboard.modal.crop')}</label>
                <select 
                  value={formData.item} onChange={e => setFormData({...formData, item: e.target.value})}
                  className="w-full rounded-xl bg-ink-950/40 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-emerald-400/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="">-- {t('leaderboard.modal.crop')} --</option>
                  {CROPS.map(c => (
                    <option key={c} value={c} className="bg-ink-950">{tCrop(c)}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">{t('leaderboard.modal.quantity')}</label>
                  <input 
                    type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})}
                    className="w-full rounded-xl bg-ink-950/40 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-emerald-400/50 transition-all" 
                    placeholder="e.g. 50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">{t('leaderboard.modal.phone')}</label>
                  <input 
                    type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full rounded-xl bg-ink-950/40 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-emerald-400/50 transition-all" 
                    placeholder={t('leaderboard.modal.phonePlaceholder')}
                  />
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                disabled={!formData.farmer_id || !formData.mandi_id || !formData.item || !formData.quantity || !formData.phone}
                className="w-full mt-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-6 py-4 text-sm font-bold text-ink-950 shadow-lg shadow-emerald-500/20 disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
              >
                {t('leaderboard.modal.continue')}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-500/10 p-5 ring-1 ring-amber-500/20 border-l-4 border-amber-500">
                <h3 className="text-sm font-bold text-amber-400">{t('leaderboard.modal.importantTerms')}</h3>
                <p className="mt-2 text-xs text-white/60 leading-relaxed">
                  {t('leaderboard.modal.termsDesc')
                    .replace('{{quantity}}', formData.quantity)
                    .replace('{{crop}}', tCrop(formData.item))
                    .replace('{{mandi}}', tDistrict(formData.mandi_id))}
                </p>
                <p className="mt-2 text-xs font-bold text-red-400">
                  {t('leaderboard.modal.penaltyWarning')}
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center pt-0.5">
                  <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="peer sr-only" />
                  <div className="h-5 w-5 rounded border border-white/20 bg-white/5 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition"></div>
                  {accepted && <span className="absolute inset-0 flex items-center justify-center text-white text-[10px]">✓</span>}
                </div>
                <span className="text-xs text-white/70 group-hover:text-white transition-colors">{t('leaderboard.modal.agreeTerms')}</span>
              </label>

              {error && <div className="text-xs text-red-400 font-bold p-3 rounded-xl bg-red-500/5 ring-1 ring-red-500/10">✕ {error}</div>}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 rounded-2xl bg-white/5 px-4 py-4 text-sm font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all">{t('leaderboard.modal.back')}</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={!accepted || submitting}
                  className="flex-[2] rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-4 text-sm font-bold text-ink-950 disabled:opacity-30 transition-all active:scale-95"
                >
                  {submitting ? t('leaderboard.modal.processing') : t('leaderboard.modal.confirmReg')}
                </button>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}

function DeliveryModal({ t, tDistrict, tCrop, onClose }) {
  const [farmerId, setFarmerId] = useState('')
  const [commitments, setCommitments] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [deliveredQty, setDeliveredQty] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchComms = async () => {
    if (!farmerId) return
    try {
      const res = await fetchFarmerCommitments(farmerId)
      setCommitments(res.commitments.filter(c => c.status === 'promised'))
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await confirmDelivery({ commitment_id: selectedId, delivered_quantity: deliveredQty })
      setResult(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md overflow-hidden shadow-2xl">
        <div className="border-b border-white/10 px-6 py-5 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">{t('leaderboard.modal.confirmTitle')}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="p-6 space-y-4">
          {result ? (
            <div className="space-y-6 text-center py-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl font-bold ring-2 ring-emerald-500/30">
                ✓
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">{t('leaderboard.modal.recorded')}</h3>
                <p className="text-sm text-white/50">{t('leaderboard.status')}: <strong className="text-emerald-400 capitalize">{result.status}</strong></p>
              </div>
              {result.penalty_applied > 0 && (
                <div className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-400 ring-1 ring-red-500/20 border-l-4 border-red-500">
                  {t('leaderboard.modal.penalty')} {result.penalty_applied}
                </div>
              )}
              <button onClick={onClose} className="w-full rounded-2xl bg-white/5 px-4 py-4 text-sm font-bold text-white hover:bg-white/10 transition-all">{t('leaderboard.modal.close')}</button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input 
                  type="text" value={farmerId} onChange={e => setFarmerId(e.target.value)}
                  className="w-full rounded-xl bg-ink-950/40 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-emerald-400/50 transition-all" 
                  placeholder={t('leaderboard.modal.enterFarmerId')}
                />
                <button onClick={fetchComms} className="rounded-xl bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all">{t('leaderboard.modal.findComms')}</button>
              </div>

              {commitments.length > 0 && (
                <div className="space-y-5 pt-6 border-t border-white/10">
                  <div>
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">{t('leaderboard.modal.selectComm')}</label>
                    <select 
                      value={selectedId} onChange={e => setSelectedId(e.target.value)}
                      className="w-full rounded-xl bg-ink-950/40 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">-- {t('leaderboard.modal.selectComm')} --</option>
                      {commitments.map(c => (
                        <option key={c.id} value={c.id} className="bg-ink-950">{tCrop(c.item)} @ {tDistrict(c.mandi_id)} ({c.quantity} Qtl)</option>
                      ))}
                    </select>
                  </div>
                  {selectedId && (
                    <div>
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 block">{t('leaderboard.modal.actualQty')}</label>
                      <input 
                        type="number" value={deliveredQty} onChange={e => setDeliveredQty(e.target.value)}
                        className="w-full rounded-xl bg-ink-950/40 px-4 py-3 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-emerald-400/50 transition-all" 
                        placeholder="e.g. 45"
                      />
                    </div>
                  )}
                  {error && <div className="text-xs text-red-400 font-bold">✕ {error}</div>}
                  <button 
                    onClick={handleSubmit}
                    disabled={!selectedId || !deliveredQty || loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-4 text-sm font-bold text-ink-950 shadow-lg shadow-emerald-500/20 disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                  >
                    {loading ? t('leaderboard.modal.processing') : t('leaderboard.modal.submitDelivery')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
