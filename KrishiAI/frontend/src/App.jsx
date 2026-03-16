import { Navigate, Route, Routes } from 'react-router-dom'
import { motion } from 'framer-motion'

import { Navbar } from './components/Navbar.jsx'
import { Footer } from './components/Footer.jsx'
import { Home } from './pages/Home.jsx'
import { LivePrices } from './pages/LivePrices.jsx'
import { Prediction } from './pages/Prediction.jsx'
import { MarketFinder } from './pages/MarketFinder.jsx'
import { DemandMap } from './pages/DemandMap.jsx'
import { DistrictComparison } from './pages/DistrictComparison.jsx'
import { InvestorInfo } from './pages/InvestorInfo.jsx'
import { ProfitOptimizer } from './pages/ProfitOptimizer.jsx'
import { PriceAlerts } from './pages/PriceAlerts.jsx'
import { LogisticsEstimator } from './pages/LogisticsEstimator.jsx'
import { DemandForecastPage } from './pages/DemandForecastPage.jsx'
import { FarmerChatWidget } from './components/FarmerChatWidget.jsx'

const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(6px)' },
}

export default function App() {
  return (
    <div className="min-h-dvh krishiai-bg">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6">
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/live-prices" element={<LivePrices />} />
            <Route path="/ai-prediction" element={<Prediction />} />
            <Route path="/market-finder" element={<MarketFinder />} />
            <Route path="/demand-map" element={<DemandMap />} />
            <Route path="/district-comparison" element={<DistrictComparison />} />
            <Route path="/profit-optimizer" element={<ProfitOptimizer />} />
            <Route path="/price-alerts" element={<PriceAlerts />} />
            <Route path="/logistics-estimator" element={<LogisticsEstimator />} />
            <Route path="/demand-forecast" element={<DemandForecastPage />} />
            <Route path="/investor-info" element={<InvestorInfo />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </main>
      <FarmerChatWidget />
      <Footer />
    </div>
  )
}
