import { useT } from '../lib/i18n.js'

export function Footer() {
  const { t } = useT()

  return (
    <footer className="border-t border-white/10 bg-black/10">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="space-y-2">
          <div className="text-sm font-semibold tracking-tight">{t('footer.title')}</div>
          <p className="text-sm text-white/60">
            {t('footer.tagline')}
          </p>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
            {t('footer.demoTitle')}
          </div>
          <ul className="space-y-1 text-sm text-white/60">
            <li>{t('footer.demoNote1')}</li>
            <li>{t('footer.demoNote2')}</li>
          </ul>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
            {t('investorInfo.founder')}
          </div>
          <div className="text-sm">
            <div className="font-semibold">{t('investorInfo.yashwanth')}</div>
            <div className="text-white/60">{t('investorInfo.student')}</div>
            <div className="text-white/60">{t('investorInfo.innovator')}</div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        {t('footer.copyright')} • {t('footer.demoTitle')}
      </div>
    </footer>
  )
}

