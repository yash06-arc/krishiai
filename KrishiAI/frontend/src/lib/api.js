const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/+$/, '') || 'http://127.0.0.1:5000'

async function httpGet(path, params) {
  const url = new URL(`${API_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      url.searchParams.set(k, String(v))
    })
  }
  const res = await fetch(url.toString())
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`)
  }
  return res.json()
}

async function httpPost(path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`)
  }
  return res.json()
}

// ── Core price/market endpoints ──────────────────────────────────────────────
export async function fetchPrices({ crop, district } = {}) {
  return httpGet('/prices', { crop, district })
}

export async function fetchPredict({ crop, district } = {}) {
  return httpGet('/predict', { crop, district })
}

export async function fetchBestMarket({ crop, district } = {}) {
  return httpGet('/best-market', { crop, district })
}

export async function fetchDemand({ crop } = {}) {
  return httpGet('/demand', { crop })
}

export async function fetchProfitOptimizer({ crop, currentDistrict } = {}) {
  return httpGet('/profit-optimizer', { crop, current_district: currentDistrict })
}

export async function fetchPriceAlerts({ crop } = {}) {
  return httpGet('/price-alerts', { crop })
}

export async function fetchLogisticsEstimate({ crop, district } = {}) {
  return httpGet('/logistics-estimate', { crop, district })
}

export async function fetchDemandForecast({ crop } = {}) {
  return httpGet('/demand-forecast', { crop })
}

// ── Weather endpoints  (/api/weather/...) ────────────────────────────────────
export async function fetchWeatherCurrent(location = 'Bangalore') {
  return httpGet('/api/weather/current', { location })
}

export async function fetchWeatherForecast(location = 'Bangalore') {
  return httpGet('/api/weather/forecast', { location })
}

export async function fetchWeatherInsights(location = 'Bangalore', crop = 'Tomato') {
  return httpGet('/api/weather/insights', { location, crop })
}

// ── Mandi Leaderboard endpoints  (/api/leaderboard/...) ──────────────────────
export async function fetchLeaderboardOverall() {
  return httpGet('/api/leaderboard/overall')
}

export async function fetchLeaderboard({ item } = {}) {
  return httpGet('/api/leaderboard', { item })
}

export async function fetchFarmerCommitments(farmerId) {
  return httpGet(`/api/commitments/${encodeURIComponent(farmerId)}`)
}

export async function registerSupply(data) {
  return httpPost('/api/register-supply', data)
}

export async function confirmDelivery(data) {
  return httpPost('/api/confirm-delivery', data)
}

// ── Chatbot ──────────────────────────────────────────────────────────────────
export async function chatWithFarmerBot({ message, lang = 'en' } = {}) {
  return httpPost('/chat', { message, lang })
}
