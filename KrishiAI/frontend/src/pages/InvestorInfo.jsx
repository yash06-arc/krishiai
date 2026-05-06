import { GlassCard } from '../components/GlassCard.jsx'
import { StateBanner } from '../components/StateBanner.jsx'
import { useT } from '../lib/i18n.js'

export function InvestorInfo() {
  const { t } = useT()

  return (
    <div className="space-y-8">
      <StateBanner
        title={t('investorInfo.title')}
        subtitle={t('investorInfo.description')}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="p-6 lg:col-span-2">
          <div className="text-sm font-semibold">{t('investorInfo.startupPotential')}</div>
          <p className="mt-3 text-sm text-white/65">
            {t('investorInfo.startupDesc1')} <span className="font-semibold text-white">140 million</span>{' '}
            {t('investorInfo.startupDesc2')} <span className="font-semibold text-white">{t('investorInfo.where')}</span> {t('investorInfo.and')}{' '}
            <span className="font-semibold text-white">{t('investorInfo.when')}</span> {t('investorInfo.toSell')}.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { k: t('investorInfo.northStar'), v: t('investorInfo.northStarDesc') },
              { k: t('investorInfo.productWedge'), v: t('investorInfo.productWedgeDesc') },
              { k: t('investorInfo.expansion'), v: t('investorInfo.expansionDesc') },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xs text-white/60">{s.k}</div>
                <div className="mt-1 text-sm font-semibold">{s.v}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-400/15 to-sky-400/15 p-5 ring-1 ring-white/10">
            <div className="text-sm font-semibold">{t('investorInfo.whyInvestorsCare')}</div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/70">
              <li>{t('investorInfo.point1')}</li>
              <li>{t('investorInfo.point2')}</li>
              <li>{t('investorInfo.point3')}</li>
            </ul>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="text-sm font-semibold">{t('investorInfo.founder')}</div>
          <div className="mt-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="text-lg font-semibold">{t('investorInfo.founderName')}</div>
            <div className="mt-1 text-sm text-white/65">
              {t('investorInfo.founderRole')}
            </div>
            <div className="text-sm text-white/65">{t('investorInfo.founderTag')}</div>
          </div>

          <div className="mt-4 space-y-3">
            {[
              {
                k: t('investorInfo.demoScope'),
                v: t('investorInfo.demoScopeDesc'),
              },
              {
                k: t('investorInfo.deployReady'),
                v: t('investorInfo.deployReadyDesc'),
              },
              {
                k: t('investorInfo.nextStep'),
                v: t('investorInfo.nextStepDesc'),
              },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="text-xs text-white/60">{s.k}</div>
                <div className="mt-1 text-sm font-semibold">{s.v}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

