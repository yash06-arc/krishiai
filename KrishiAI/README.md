## KrishiAI — AI Powered Crop Market Intelligence

Full-stack agritech platform demo to help farmers:

- Check live mandi-like prices (demo dataset)
- Predict future crop prices using AI (scikit-learn regression)
- Find the best market (district) to sell
- Visualize demand across districts on a map
- Compare prices between districts with charts

### Tech stack

- **Frontend**: React + Vite, TailwindCSS, Framer Motion, Chart.js, Leaflet (React-Leaflet)
- **Backend**: Python Flask API + Flask-CORS
- **AI/Data**: Pandas, scikit-learn
- **Data**: CSV (auto-generated Karnataka-wide sample dataset)

---

## Project structure

```
KrishiAI/
  frontend/
  backend/
  data/
```

---

## Run locally

### 1) Backend (Flask)

```bash
cd KrishiAI/backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

If virtualenv creation fails on your machine, you can also install deps directly:

```bash
cd KrishiAI/backend
python -m pip install -r requirements.txt
python app.py
```

Backend runs on `http://127.0.0.1:5000` and auto-generates `data/prices_karnataka.csv` if missing.

### 2) Frontend (Vite)

```bash
cd KrishiAI/frontend
npm install
copy .env.example .env
npm run dev
```

Frontend runs on `http://127.0.0.1:5173`.

---

## AI farmer guide video (add your own)

KrishiAI includes a “**AI Video Guide**” section on the Home page. Set a video URL to enable it:

- In `KrishiAI/frontend/.env` set:
  - `VITE_GUIDE_VIDEO_URL=<your mp4 url>`

You can generate the guide video with any AI video tool. Use this script:

**Narration script (2–3 min)**

1. “Welcome to KrishiAI, your AI-powered crop market intelligence.”
2. “Start with Live Prices. Choose your crop and your district to see the latest market price and demand level.”
3. “Next, open AI Prediction. Select your crop and district, then click Run prediction. KrishiAI shows a predicted price and a trend chart.”
4. “Now open Market Finder. Pick a crop and click Find best market to see the best district to sell and a price comparison chart.”
5. “Open Demand Map to view district demand. Red means high demand, orange medium, and green low demand.”
6. “Finally, use District Comparison to compare a crop’s price across all districts.”
7. “KrishiAI helps you decide where and when to sell for better profit. Thank you.”

---

## API endpoints

- `GET /prices?crop=Tomato&district=Mysuru`
- `GET /predict?crop=Tomato&district=Mysuru`
- `GET /best-market?crop=Tomato`
- `GET /demand?crop=Tomato`

Example `GET /predict` response:

```json
{
  "crop": "Tomato",
  "district": "Mysuru",
  "predicted_price": 38.0
}
```

---

## Deployment

### Frontend → Vercel

- Import `KrishiAI/frontend` as the Vercel project
- Build command: `npm run build`
- Output directory: `dist`
- Set env var: `VITE_API_BASE` to your Render backend URL

### Backend → Render

- Create a new Web Service from `KrishiAI/backend`
- Build command: `pip install -r requirements.txt`
- Start command: `python app.py`
- Set env var: `PORT` (Render sets it automatically)

---

## Notes (pitching)

This build uses a Karnataka-wide sample dataset to keep the demo self-contained. Replace the CSV generator with real mandi feeds for production.

