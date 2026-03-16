import { AnimatePresence, motion } from 'framer-motion'

export function VideoGuideModal({ open, onClose, videoUrl, title = 'KrishiAI Video Guide' }) {
  const isDirectVideo =
    typeof videoUrl === 'string' &&
    (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.endsWith('.ogg'))

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-ink-900/90 ring-1 ring-white/10 shadow-glow"
            initial={{ y: 14, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 14, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <div className="text-sm font-semibold">{title}</div>
                <div className="mt-0.5 text-xs text-white/60">
                  Voice-guided walkthrough for farmers
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-4">
              {videoUrl ? (
                <div className="aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
                  {isDirectVideo ? (
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      className="h-full w-full"
                      playsInline
                    />
                  ) : (
                    <iframe
                      src={videoUrl}
                      title="KrishiAI guide video"
                      className="h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-white/5 p-6 text-sm text-white/70 ring-1 ring-white/10">
                  No guide video URL configured yet.
                  <div className="mt-2 text-xs text-white/55">
                    Set <span className="font-mono text-white/80">VITE_GUIDE_VIDEO_URL</span>{' '}
                    in your frontend <span className="font-mono text-white/80">.env</span>.
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

