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

export async function chatWithFarmerBot({ message } = {}) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`)
  }
  return res.json()
}

