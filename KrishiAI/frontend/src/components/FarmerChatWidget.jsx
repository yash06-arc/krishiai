import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useT } from '../lib/i18n.js'
import { chatWithFarmerBot } from '../lib/api.js'

function Bubble({ role, children }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ring-1',
          isUser
            ? 'bg-white/10 text-white ring-white/10'
            : 'bg-black/30 text-white/85 ring-white/10',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}

export function FarmerChatWidget() {
  const { t, lang } = useT()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: t('chatbot.welcome')
    },
  ])
  const scrollerRef = useRef(null)

  // Update welcome message when language changes
  useEffect(() => {
    setMessages([{ role: 'assistant', text: t('chatbot.welcome') }])
  }, [lang])

  useEffect(() => {
    if (!open) return
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [open, messages.length])

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    // Map internal language state to speech recognition locales
    const langCode = lang === 'kn' ? 'kn-IN' : 'en-IN'
    recognition.lang = langCode
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput((prev) => prev + (prev ? ' ' : '') + transcript)
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text }])
    setLoading(true)
    try {
      const res = await chatWithFarmerBot({ message: text })
      setMessages((m) => [...m, { role: 'assistant', text: res?.reply || 'Okay.' }])
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: t('chatbot.error'),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mb-3 w-[360px] overflow-hidden rounded-3xl bg-ink-900/85 shadow-glow ring-1 ring-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-semibold">{t('chatbot.title')}</div>
                <div className="mt-0.5 text-[11px] text-white/60">
                  {t('chatbot.subtitle')}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-2xl bg-white/5 text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            <div ref={scrollerRef} className="max-h-[360px] space-y-2 overflow-auto p-4">
              {messages.map((m, idx) => (
                <Bubble key={idx} role={m.role}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </Bubble>
              ))}
              {loading ? (
                <div className="text-xs text-white/50">{t('common.loading')}</div>
              ) : null}
            </div>

            <div className="border-t border-white/10 p-3">
              <div className="flex gap-2 relative items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') send()
                  }}
                  placeholder={t('chatbot.placeholder')}
                  className="w-full rounded-2xl bg-black/30 pl-3 pr-10 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-emerald-400/40"
                />
                <button
                  onClick={startListening}
                  className={`absolute right-16 grid h-7 w-7 place-items-center rounded-xl transition ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                  title="Speak"
                >
                  🎙
                </button>
                <button
                  onClick={send}
                  disabled={loading}
                  className="rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-2 text-sm font-semibold text-ink-950 disabled:opacity-50"
                >
                  ►
                </button>
              </div>
              <div className="mt-2 text-[11px] text-white/50">
                {t('chatbot.tip')}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-400 text-ink-950 shadow-glow ring-1 ring-white/20"
        aria-label="Open farmer chatbot"
      >
        Chat
      </button>
    </div>
  )
}
