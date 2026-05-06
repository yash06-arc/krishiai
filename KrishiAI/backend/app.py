from __future__ import annotations
from datetime import datetime


import math
import os
from functools import lru_cache
from typing import Dict, Tuple

import pandas as pd  # type: ignore
from flask import Flask, jsonify, request  # type: ignore
from flask_cors import CORS  # type: ignore

from data_gen import CROPS, DISTRICTS  # type: ignore
from ml import build_history, demand_levels, predict_next, train_for_crop  # type: ignore
from sync_live_data import fetch_live_data
from db_models import init_db, get_db
import threading
import time
import requests


ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_CSV = os.path.abspath(os.path.join(ROOT, "..", "data", "prices_karnataka.csv"))


KARNATAKA_COORDS: Dict[str, Tuple[float, float]] = {
    "Bangalore Urban": (12.9716, 77.5946),
    "Bangalore Rural": (13.2846, 77.6070),
    "Mysuru": (12.2958, 76.6394),
    "Mandya": (12.5242, 76.8958),
    "Tumakuru": (13.3392, 77.1010),
    "Kolar": (13.1357, 78.1326),
    "Chikkaballapur": (13.4351, 77.7315),
    "Ramanagara": (12.7225, 77.2806),
    "Hassan": (13.0072, 76.0962),
    "Chikkamagaluru": (13.3161, 75.7720),
    "Kodagu": (12.4244, 75.7382),
    "Dakshina Kannada": (12.9141, 74.8560),
    "Udupi": (13.3409, 74.7421),
    "Uttara Kannada": (14.7950, 74.6869),
    "Shivamogga": (13.9299, 75.5681),
    "Davangere": (14.4644, 75.9218),
    "Chitradurga": (14.2266, 76.4000),
    "Ballari": (15.1394, 76.9214),
    "Koppal": (15.3456, 76.1548),
    "Raichur": (16.2076, 77.3463),
    "Kalaburagi": (17.3297, 76.8343),
    "Yadgir": (16.7730, 77.1376),
    "Bidar": (17.9149, 77.5046),
    "Vijayapura": (16.8302, 75.7100),
    "Bagalkot": (16.1850, 75.6961),
    "Belagavi": (15.8497, 74.4977),
    "Dharwad": (15.4589, 75.0078),
    "Gadag": (15.4310, 75.6350),
    "Haveri": (14.7959, 75.4045),
}


def load_df() -> pd.DataFrame:
    if not os.path.exists(DATA_CSV) or os.path.getsize(DATA_CSV) == 0:
        fetch_live_data()
        
    if os.path.exists(DATA_CSV) and os.path.getsize(DATA_CSV) > 0:
        df = pd.read_csv(DATA_CSV)
    else:
        df = pd.DataFrame(columns=["Crop", "District", "Date", "Price"])
        
    # normalize schema just in case
    df["Crop"] = df["Crop"].astype(str)
    df["District"] = df["District"].astype(str)
    df["Date"] = df["Date"].astype(str)
    if not df.empty:
        df["Price"] = pd.to_numeric(df["Price"], errors="coerce").fillna(0.0)
    else:
        df["Price"] = pd.Series(dtype=float)
    return df


@lru_cache(maxsize=1)
def _df_cached() -> pd.DataFrame:
    return load_df()


@lru_cache(maxsize=64)
def _model_for_crop(crop: str):
    return train_for_crop(_df_cached(), crop=crop)


app = Flask(__name__)
CORS(app)

# Initialize database
init_db()

def run_background_sync():
    """Background thread to fetch live data at 6 AM IST daily."""
    # Perform an initial sync on startup to ensure data is fresh
    print("Background sync: Initial startup sync...")
    try:
        result = fetch_live_data()
        if result and result.get("status") == "success":
            _df_cached.cache_clear()
            _model_for_crop.cache_clear()
            print(f"Background sync: Initial sync success. {result.get('records', 0)} records added.")
    except Exception as e:
        print(f"Background sync initial error: {e}")

    while True:
        try:
            now = datetime.now()
            # Calculate seconds until next 6:00 AM
            target_time = now.replace(hour=6, minute=0, second=0, microsecond=0)
            if now >= target_time:
                # If it's already past 6 AM today, target 6 AM tomorrow
                from datetime import timedelta
                target_time += timedelta(days=1)
            
            sleep_seconds = (target_time - now).total_seconds()
            print(f"Background sync: Sleeping for {sleep_seconds/3600:.2f} hours until 06:00 AM.")
            time.sleep(sleep_seconds)
            
            print("Background sync: Fetching live data...")
            result = fetch_live_data()
            if result and result.get("status") == "success":
                # Clear caches so new requests get the fresh data
                _df_cached.cache_clear()
                _model_for_crop.cache_clear()
                print(f"Background sync: Success. {result.get('records', 0)} records added.")
            else:
                print(f"Background sync: Issue fetching data. {result}")
        except Exception as e:
            print(f"Background sync error: {e}")
            # If error, wait 1 hour before retrying
            time.sleep(3600)

# Start background sync thread (only runs once per process)
sync_thread = threading.Thread(target=run_background_sync, daemon=True)
sync_thread.start()


@app.get("/")
def index():
    return jsonify({"message": "KrishiAI API is running!", "status": "ok"})


@app.get("/health")
def health():
    return jsonify({"ok": True})

@app.get("/api/sync")
def sync_data():
    try:
        result = fetch_live_data()
        if result and result.get("status") == "success":
            _df_cached.cache_clear()
            _model_for_crop.cache_clear()
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.get("/meta")
def meta():
    df = _df_cached()
    unique_districts = sorted([str(d) for d in df["District"].dropna().unique() if d])
    unique_crops = sorted([str(c) for c in df["Crop"].dropna().unique() if c])
    return jsonify({"districts": unique_districts, "crops": unique_crops})


@app.get("/prices")
def prices():
    crop = (request.args.get("crop") or "").strip()
    district = (request.args.get("district") or "").strip()

    df = _df_cached()
    f = df.copy()
    if crop:
        f = f[f["Crop"].str.lower() == crop.lower()]
    if district:
        f = f[f["District"].str.lower() == district.lower()]

    if f.empty:
        return jsonify({"items": []})

    f["Date"] = pd.to_datetime(f["Date"])
    latest_date = f["Date"].max()
    latest = f[f["Date"] == latest_date].copy()

    # Ensure one row per Crop+District at latest date
    latest = (
        latest.sort_values(["Crop", "District", "Date"])
        .groupby(["Crop", "District"], as_index=False)
        .tail(1)
    )

    out = demand_levels(latest)
    out = out.sort_values(["Crop", "District"])

    items = [
        {
            "crop": r["Crop"],
            "district": r["District"],
            "date": r["Date"].date().isoformat(),
            "price": float(round(float(r["Price"]), 2)),  # type: ignore
            "demand_level": r["demand_level"],
        }
        for _, r in out.iterrows()
    ]
    import os
    last_sync = datetime.fromtimestamp(os.path.getmtime(DATA_CSV)).isoformat()
    return jsonify({
        "items": items, 
        "latest_date": latest_date.date().isoformat(),
        "last_sync": last_sync,
        "source": "Agmarknet (Data.gov.in)"
    })


@app.get("/predict")
def predict():
    crop = (request.args.get("crop") or "").strip()
    district = (request.args.get("district") or "").strip()
    if not crop or not district:
        return jsonify({"error": "Missing crop or district"}), 400

    df = _df_cached()
    bundle = _model_for_crop(crop)

    forecast = predict_next(bundle, district=district, horizon_days=7)
    predicted_price = forecast[0]["predicted_price"] if forecast else None
    history = build_history(df, crop=crop, district=district, days=30)

    return jsonify(
        {
            "crop": crop,
            "district": district,
            "predicted_price": predicted_price,
            "history": history,
            "forecast": forecast,
        }
    )


@app.get("/best-market")
def best_market():
    crop = (request.args.get("crop") or "").strip()
    if not crop:
        return jsonify({"error": "Missing crop"}), 400

    df = _df_cached()
    f = df[df["Crop"].str.lower() == crop.lower()].copy()
    if f.empty:
        return jsonify({"error": "Unknown crop"}), 400

    f["Date"] = pd.to_datetime(f["Date"])
    latest_date = f["Date"].max()
    latest = f[f["Date"] == latest_date].copy()
    latest = (
        latest.sort_values(["District", "Date"])
        .groupby(["District"], as_index=False)
        .tail(1)
        .sort_values("Price", ascending=False)
    )

    district_prices = [
        {"district": r["District"], "price": float(round(float(r["Price"]), 2))}  # type: ignore
        for _, r in latest.iterrows()
    ]

    best = district_prices[0] if district_prices else {"district": None, "price": None}
    return jsonify(
        {
            "crop": crop,
            "best_district": best["district"],
            "best_price": best["price"],
            "district_prices": district_prices,
            "latest_date": latest_date.date().isoformat(),
        }
    )


@app.get("/demand")
def demand():
    crop = (request.args.get("crop") or "").strip()
    if not crop:
        return jsonify({"error": "Missing crop"}), 400

    df = _df_cached()
    f = df[df["Crop"].str.lower() == crop.lower()].copy()
    if f.empty:
        return jsonify({"items": []})

    f["Date"] = pd.to_datetime(f["Date"])
    latest_date = f["Date"].max()
    latest = f[f["Date"] == latest_date].copy()
    latest = (
        latest.sort_values(["District", "Date"])
        .groupby(["District"], as_index=False)
        .tail(1)
    )
    out = demand_levels(latest)
    items = [
        {
            "district": r["District"],
            "demand_level": r["demand_level"],
            "price": float(round(float(r["Price"]), 2)),  # type: ignore
        }
        for _, r in out.iterrows()
    ]
    return jsonify({"crop": crop, "items": items, "latest_date": latest_date.date().isoformat()})


def _haversine_km(a: Tuple[float, float], b: Tuple[float, float]) -> float:
    (lat1, lon1), (lat2, lon2) = a, b
    r = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    h = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return 2 * r * math.asin(math.sqrt(h))


def _latest_for_crop(df: pd.DataFrame, crop: str) -> pd.DataFrame:
    f = df[df["Crop"].str.lower() == crop.lower()].copy()
    if f.empty:
        return f
    f["Date"] = pd.to_datetime(f["Date"])
    latest_date = f["Date"].max()
    latest = f[f["Date"] == latest_date].copy()
    latest = (
        latest.sort_values(["District", "Date"])
        .groupby(["District"], as_index=False)
        .tail(1)
    )
    return latest


def _detect_crop_and_district(message: str) -> Tuple[str, str]:
    m = (message or "").lower()
    crop = ""
    district = ""

    # crops
    for c in CROPS:
        if c.lower() in m:
            crop = c
            break
    # districts (prefer longer names first)
    for d in sorted(DISTRICTS, key=lambda x: -len(x)):
        if d.lower() in m:
            district = d
            break

    return crop, district


from dotenv import load_dotenv

load_dotenv()

def _get_market_context_str(df: pd.DataFrame) -> str:
    f = df.copy()
    f["Date"] = pd.to_datetime(f["Date"])
    latest_date = f["Date"].max()
    if pd.isna(latest_date):
        return "No live data available currently."
        
    latest = f[f["Date"] == latest_date].copy()
        
    latest = (
        latest.sort_values(["Crop", "District", "Date"])
        .groupby(["Crop", "District"], as_index=False)
        .tail(1)
    )
    
    # Sort by price descending to help LLM easily see the best price
    latest = latest.sort_values("Price", ascending=False)
    
    lines = [f"Latest KrishiAI Market Data (Date: {latest_date.date().isoformat()}):"]
    for _, r in latest.iterrows():
        lines.append(f"- Crop: {r['Crop']}, District: {r['District']}, Price: Rs {float(r['Price']):.0f}/kg")
        
    if len(lines) == 1:
        lines.append("No live data available currently.")
        
    return "\n".join(lines)

@app.post("/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    message = (payload.get("message") or "").strip()
    lang = payload.get("lang", "en")
    if not message:
        return jsonify({"reply": "Please type a question or ask about market prices."})

    df = _df_cached()
    market_context = _get_market_context_str(df)

    lang_instruction = "If a user asks a question in Kannada, Hindi, or any other language, reply in that SAME language."
    if lang == "kn":
        lang_instruction = "The user's interface language is Kannada. You MUST reply entirely in Kannada language (Kannada script)."
    elif lang == "en":
        lang_instruction = "The user's interface language is English. You MUST reply entirely in English language."

    system_instruction = f"""You are the KrishiAI Farmer Assistant. 
You answer questions accurately based ONLY on the data provided below. 
{lang_instruction}
Keep your answers brief, friendly, and highly relevant. 
If they ask where to sell to get the most profit, look at the provided data and tell them the District with the HIGHEST Price for their crop.
Transport cost is generally Rs 0.05 per km if they ask about logistics (use your best estimate of distance between districts if needed, or just give general advice based on the highest price).
You are capable of handling typos in crop names (e.g., 'toamto' means 'Tomato').
DO NOT invent price data. If the data for a crop/district is not in the context, say you don't have that data.

{market_context}
"""

    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        return jsonify({"reply": "I'm currently unable to connect to my brain. Please add the GEMINI_API_KEY to the backend .env file."})

    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=gemini_key)
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=message,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3,
            )
        )
        return jsonify({"reply": response.text})
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            fallback_msg = "Google Gemini API Quota Exceeded. Please check your billing plan."
        else:
            if lang == 'kn':
                fallback_msg = "ಕ್ಷಮಿಸಿ, ಸದ್ಯಕ್ಕೆ ನಮ್ಮ AI ಸರ್ವರ್‌ನಲ್ಲಿ ಹೆಚ್ಚಿನ ಒತ್ತಡವಿದೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
            else:
                fallback_msg = "I'm sorry, our AI assistant is currently experiencing high demand. Please try again in a few moments."
        print(f"Gemini API Error: {repr(e)}")
        return jsonify({"reply": fallback_msg})


@app.get("/profit-optimizer")
def profit_optimizer():
    crop = (request.args.get("crop") or "").strip()
    current_district = (request.args.get("current_district") or "").strip()
    if not crop or not current_district:
        return jsonify({"error": "Missing crop or current_district"}), 400

    df = _df_cached()
    latest = _latest_for_crop(df, crop)
    if latest.empty:
        return jsonify({"error": "Unknown crop"}), 400

    if current_district not in KARNATAKA_COORDS:
        return jsonify({"error": "Unknown current_district"}), 400

    origin = KARNATAKA_COORDS[current_district]
    rows = []
    for _, r in latest.iterrows():
        district = r["District"]
        price = float(round(float(r["Price"]), 2))  # type: ignore
        coord = KARNATAKA_COORDS.get(district)
        if not coord:
            distance_km = 0.0
        else:
            distance_km = _haversine_km(origin, coord)
        transport_cost = distance_km * 0.05
        net_profit = price - transport_cost
        rows.append(
            {
                "district": district,
                "price": price,
                "distance_km": round(distance_km, 1),  # type: ignore
                "transport_cost": round(transport_cost, 2),  # type: ignore
                "net_profit": round(net_profit, 2),  # type: ignore
            }
        )

    rows.sort(key=lambda x: x["net_profit"], reverse=True)
    top = rows[:10]  # type: ignore
    best = top[0] if top else None
    return jsonify(
        {
            "crop": crop,
            "current_district": current_district,
            "recommended": best,
            "markets": top,
        }
    )


@app.get("/price-alerts")
def price_alerts():
    crop = (request.args.get("crop") or "").strip()
    if not crop:
        return jsonify({"error": "Missing crop"}), 400

    df = _df_cached()
    f = df[df["Crop"].str.lower() == crop.lower()].copy()
    if f.empty:
        return jsonify({"alerts": []})

    f["Date"] = pd.to_datetime(f["Date"])
    f = f.sort_values(["District", "Date"])
    # last two entries per district
    last_two = f.groupby("District").tail(2)

    alerts = []
    for district, grp in last_two.groupby("District"):
        if len(grp) < 2:
            continue
        prev, curr = grp.iloc[-2], grp.iloc[-1]  # type: ignore
        prev_price = float(prev["Price"])
        curr_price = float(curr["Price"])
        if prev_price <= 0:
            continue
        pct = (curr_price - prev_price) / prev_price * 100.0
        if pct > 10.0:
            alerts.append(
                {
                    "district": district,
                    "crop": crop,
                    "current_price": round(curr_price, 2),  # type: ignore
                    "percentage_increase": round(pct, 2),  # type: ignore
                    "alert_message": f"Price for {crop} in {district} increased by {pct:.1f}% compared to yesterday.",
                }
            )

    alerts.sort(key=lambda x: x["percentage_increase"], reverse=True)
    return jsonify({"crop": crop, "alerts": alerts})


@app.get("/logistics-estimate")
def logistics_estimate():
    crop = (request.args.get("crop") or "").strip()
    base_district = (request.args.get("district") or "").strip()
    if not crop or not base_district:
        return jsonify({"error": "Missing crop or district"}), 400
    if base_district not in KARNATAKA_COORDS:
        return jsonify({"error": "Unknown district"}), 400

    df = _df_cached()
    latest = _latest_for_crop(df, crop)
    if latest.empty:
        return jsonify({"error": "Unknown crop"}), 400

    origin = KARNATAKA_COORDS[base_district]
    rows = []
    for _, r in latest.iterrows():
        district = r["District"]
        price = float(round(float(r["Price"]), 2))  # type: ignore
        coord = KARNATAKA_COORDS.get(district)
        if not coord:
            distance_km = 0.0
        else:
            distance_km = _haversine_km(origin, coord)
        transport_cost = distance_km * 0.05
        net_profit = price - transport_cost
        rows.append(
            {
                "district": district,
                "price": price,
                "distance_km": round(distance_km, 1),  # type: ignore
                "transport_cost": round(transport_cost, 2),  # type: ignore
                "net_profit": round(net_profit, 2),  # type: ignore
            }
        )

    rows.sort(key=lambda x: x["net_profit"], reverse=True)
    return jsonify(
        {
            "crop": crop,
            "base_district": base_district,
            "estimates": rows,
        }
    )


@app.get("/demand-forecast")
def demand_forecast():
    crop = (request.args.get("crop") or "").strip()
    if not crop:
        return jsonify({"error": "Missing crop"}), 400

    df = _df_cached()
    f = df[df["Crop"].str.lower() == crop.lower()].copy()
    if f.empty:
        return jsonify({"crop": crop, "trend": "unknown", "message": "No data available."})

    f["Date"] = pd.to_datetime(f["Date"])
    f = f.sort_values("Date")
    # Aggregate by date: mean price across districts
    daily = f.groupby("Date", as_index=False)["Price"].mean()
    # focus on recent 30 days
    recent = daily.tail(30)
    if len(recent) < 3:
        return jsonify({"crop": crop, "trend": "unknown", "message": "Not enough history."})

    recent = recent.reset_index(drop=True)
    recent["t"] = range(len(recent))
    x = recent["t"].to_numpy()
    y = recent["Price"].to_numpy()
    # simple linear trend
    slope, intercept = float(((x - x.mean()) * (y - y.mean())).sum() / ((x - x.mean()) ** 2).sum()), float(
        y.mean()
    )

    # Compare last 5 vs previous 5 days as a sanity check
    tail5 = recent.tail(5)["Price"].mean()
    prev5 = recent.tail(10).head(5)["Price"].mean()
    delta_pct = (tail5 - prev5) / prev5 * 100.0 if prev5 > 0 else 0.0

    if slope > 0 and delta_pct > 3:
        trend = "increasing"
        message = f"Demand for {crop} is trending up: average prices rose by {delta_pct:.1f}% over the last week."
    elif slope < 0 and delta_pct < -3:
        trend = "decreasing"
        message = f"Demand for {crop} seems to be softening: average prices fell by {abs(delta_pct):.1f}% recently."
    else:
        trend = "stable"
        message = f"Demand for {crop} looks relatively stable with minor price movements."

    return jsonify(
        {
            "crop": crop,
            "trend": trend,
            "message": message,
            "recent_window_days": len(recent),
            "change_percent": round(delta_pct, 2),  # type: ignore
        }
    )


# --- DYNAMIC MANDI LEADERBOARD SYSTEM ---

@app.get("/api/leaderboard")
def leaderboard():
    item = request.args.get("item", "").strip()
    conn = get_db()
    cursor = conn.cursor()
    
    if item:
        cursor.execute('''
            SELECT mandi_id, item, base_demand, unmet_demand
            FROM MandiDemand
            WHERE LOWER(item) = LOWER(?)
            ORDER BY unmet_demand DESC
        ''', (item,))
    else:
        cursor.execute('''
            SELECT mandi_id, item, base_demand, unmet_demand
            FROM MandiDemand
            ORDER BY unmet_demand DESC
            LIMIT 100
        ''')
        
    rows = cursor.fetchall()
    conn.close()
    
    results = [dict(r) for r in rows]
    return jsonify({"leaderboard": results})

@app.get("/api/leaderboard/overall")
def leaderboard_overall():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT mandi_id, SUM(base_demand) as total_base, SUM(unmet_demand) as total_unmet
        FROM MandiDemand
        GROUP BY mandi_id
        ORDER BY total_unmet DESC
    ''')
    
    rows = cursor.fetchall()
    conn.close()
    
    results = [{"mandi_id": r["mandi_id"], "total_base": r["total_base"], "total_unmet": r["total_unmet"]} for r in rows]
    return jsonify({"overall_leaderboard": results})

@app.post("/api/register-supply")
def register_supply():
    payload = request.get_json() or {}
    farmer_id = payload.get("farmer_id", "").strip()
    mandi_id = payload.get("mandi_id", "").strip()
    item = payload.get("item", "").strip()
    
    try:
        quantity = float(payload.get("quantity", 0))
    except ValueError:
        return jsonify({"error": "Invalid quantity"}), 400
        
    agreement_accepted = payload.get("agreement_accepted", False)
    phone_number = payload.get("phone", "").strip()
    
    if not all([farmer_id, mandi_id, item]) or quantity <= 0:
        return jsonify({"error": "Missing required fields or invalid quantity"}), 400
        
    if not agreement_accepted:
        return jsonify({"error": "Agreement must be accepted to register supply"}), 400
        
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        # 1. Insert Agreement
        agreement_text = f"I commit to delivering {quantity} quintals of {item} to {mandi_id} before the deadline."
        penalty_terms = "Failure to deliver will result in a penalty of Rs 100 per quintal short."
        
        cursor.execute('''
            INSERT INTO FarmerAgreement (farmer_id, mandi_id, item, quantity, accepted, agreement_text, penalty_terms)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (farmer_id, mandi_id, item, quantity, 1, agreement_text, penalty_terms))
        
        # 2. Insert Commitment
        cursor.execute('''
            INSERT INTO FarmerCommitment (farmer_id, mandi_id, item, quantity, status, phone_number)
            VALUES (?, ?, ?, ?, 'promised', ?)
        ''', (farmer_id, mandi_id, item, quantity, phone_number))
        
        commitment_id = cursor.lastrowid
        
        # 3. Update Demand (Don't let it go below 0)
        cursor.execute('''
            SELECT unmet_demand FROM MandiDemand WHERE LOWER(mandi_id) = LOWER(?) AND LOWER(item) = LOWER(?)
        ''', (mandi_id, item))
        row = cursor.fetchone()
        
        if row:
            current_unmet = row["unmet_demand"]
            new_unmet = max(0, current_unmet - quantity)
            cursor.execute('''
                UPDATE MandiDemand SET unmet_demand = ? WHERE LOWER(mandi_id) = LOWER(?) AND LOWER(item) = LOWER(?)
            ''', (new_unmet, mandi_id, item))
        else:
            # If demand record doesn't exist, create it dynamically
            cursor.execute('''
                INSERT INTO MandiDemand (mandi_id, item, base_demand, unmet_demand)
                VALUES (?, ?, ?, ?)
            ''', (mandi_id, item, quantity, 0))
            
        conn.commit()

        # 4. Twilio Voice Call Trigger
        if phone_number:
            twilio_sid = os.environ.get("TWILIO_ACCOUNT_SID")
            twilio_token = os.environ.get("TWILIO_AUTH_TOKEN")
            twilio_phone = os.environ.get("TWILIO_PHONE_NUMBER")
            base_url = os.environ.get("BASE_URL")
            
            log_file = "twilio_log.txt"
            with open(log_file, "a") as f:
                f.write(f"\n--- New Call Attempt: {datetime.now()} ---\n")
                f.write(f"To: {phone_number}\n")
                f.write(f"Base URL: {base_url}\n")
                
                if twilio_sid and twilio_token and twilio_phone and base_url:
                    try:
                        from twilio.rest import Client
                        client = Client(twilio_sid, twilio_token)
                        
                        call_url = f"{base_url}/api/voice/welcome?commitment_id={commitment_id}&item={item}&quantity={quantity}"
                        f.write(f"Triggering Call URL: {call_url}\n")
                        
                        call = client.calls.create(
                            to=phone_number,
                            from_=twilio_phone,
                            url=call_url
                        )
                        f.write(f"Call SID Created: {call.sid}\n")
                        print(f"Twilio Voice Call initiated: {call.sid}")
                    except Exception as e:
                        f.write(f"ERROR: {str(e)}\n")
                        print(f"Twilio Call failed: {e}")
                else:
                    f.write("ERROR: Missing Credentials or Base URL\n")
                    print("Twilio Call failed: Missing Credentials or Base URL")
            
            import sys
            sys.stdout.flush()

        return jsonify({"success": True, "commitment_id": commitment_id, "message": "Supply registered successfully. Verification call initiated."})
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.post("/api/confirm-delivery")
def confirm_delivery():
    payload = request.get_json() or {}
    commitment_id = payload.get("commitment_id")
    
    try:
        delivered_qty = float(payload.get("delivered_quantity", 0))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid delivered quantity"}), 400
        
    if not commitment_id or delivered_qty < 0:
        return jsonify({"error": "Missing commitment_id or invalid quantity"}), 400
        
    conn = get_db()
    try:
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM FarmerCommitment WHERE id = ?", (commitment_id,))
        commitment = cursor.fetchone()
        
        if not commitment:
            return jsonify({"error": "Commitment not found"}), 404
            
        if commitment["status"] != "promised":
            return jsonify({"error": f"Commitment already processed. Current status: {commitment['status']}"}), 400
            
        promised_qty = commitment["quantity"]
        farmer_id = commitment["farmer_id"]
        mandi_id = commitment["mandi_id"]
        item = commitment["item"]
        
        shortfall = promised_qty - delivered_qty
        
        if shortfall <= 0:
            status = "delivered"
            penalty = 0
            # Delivered full or more, no penalty. 
        elif delivered_qty > 0:
            status = "partial"
            penalty = shortfall * 100  # Rs 100 per quintal penalty
        else:
            status = "failed"
            penalty = promised_qty * 100
            
        # Update commitment
        cursor.execute('''
            UPDATE FarmerCommitment 
            SET delivered_quantity = ?, status = ? 
            WHERE id = ?
        ''', (delivered_qty, status, commitment_id))
        
        # Apply penalty if any
        if penalty > 0:
            cursor.execute('''
                INSERT INTO PenaltyLedger (farmer_id, amount, reason, commitment_id)
                VALUES (?, ?, ?, ?)
            ''', (farmer_id, penalty, f"Shortfall of {shortfall} quintals", commitment_id))
            
            # Restore unmet demand
            cursor.execute('''
                UPDATE MandiDemand 
                SET unmet_demand = unmet_demand + ? 
                WHERE mandi_id = ? AND item = ?
            ''', (shortfall, mandi_id, item))
            
        conn.commit()
        return jsonify({
            "success": True, 
            "status": status, 
            "penalty_applied": penalty,
            "message": f"Delivery confirmed. Status: {status}. Penalty: Rs {penalty}."
        })
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

@app.get("/api/commitments/<farmer_id>")
def get_farmer_commitments(farmer_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, mandi_id, item, quantity, delivered_quantity, status, timestamp
        FROM FarmerCommitment
        WHERE farmer_id = ?
        ORDER BY timestamp DESC
    ''', (farmer_id,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify({"commitments": [dict(r) for r in rows]})

@app.get("/api/mandi-demand-status")
def mandi_demand_status():
    mandi_id = request.args.get("mandi_id", "").strip()
    item = request.args.get("item", "").strip()
    
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT mandi_id, item, base_demand, unmet_demand FROM MandiDemand WHERE 1=1"
    params = []
    
    if mandi_id:
        query += " AND mandi_id = ?"
        params.append(mandi_id)
    if item:
        query += " AND item = ?"
        params.append(item)
        
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return jsonify({"status": [dict(r) for r in rows]})


# --- WEATHER INTELLIGENCE & FORECASTING SYSTEM ---

DISTRICT_COORDS = {
    "Bangalore": {"lat": 12.9716, "lon": 77.5946},
    "Mysuru": {"lat": 12.2958, "lon": 76.6394},
    "Mandya": {"lat": 12.5239, "lon": 76.8977},
    "Hubli": {"lat": 15.3647, "lon": 75.1240},
    "Belagavi": {"lat": 15.8497, "lon": 74.4977},
    "Kalaburagi": {"lat": 17.3297, "lon": 76.8343},
    "Mangaluru": {"lat": 12.9141, "lon": 74.8560}
}

@app.get("/api/weather/current")
def get_current_weather():
    location = request.args.get("location", "Bangalore").title()
    coords = DISTRICT_COORDS.get(location, DISTRICT_COORDS["Bangalore"])
    
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,cloud_cover&timezone=Asia%2FKolkata"
        resp = requests.get(url, timeout=5)
        data = resp.json()
        current = data.get("current", {})
        
        return jsonify({
            "location": location,
            "temp": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "rain_prob": current.get("precipitation"), # actual precipitation in mm
            "wind_speed": current.get("wind_speed_10m"),
            "cloud_cover": current.get("cloud_cover")
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.get("/api/weather/forecast")
def get_weather_forecast():
    location = request.args.get("location", "Bangalore").title()
    coords = DISTRICT_COORDS.get(location, DISTRICT_COORDS["Bangalore"])
    
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&hourly=temperature_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FKolkata"
        resp = requests.get(url, timeout=5)
        data = resp.json()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.get("/api/weather/insights")
def get_weather_insights():
    location = request.args.get("location", "Bangalore").title()
    crop = request.args.get("crop", "Tomato")
    
    # Get forecast data
    coords = DISTRICT_COORDS.get(location, DISTRICT_COORDS["Bangalore"])
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={coords['lat']}&longitude={coords['lon']}&daily=temperature_2m_max,precipitation_probability_max&timezone=Asia%2FKolkata"
        resp = requests.get(url, timeout=5).json()
        daily = resp.get("daily", {})
        
        # Format context for LLM
        forecast_str = ""
        if daily and "time" in daily:
            for i in range(min(7, len(daily["time"]))):
                forecast_str += f"Date: {daily['time'][i]}, Max Temp: {daily['temperature_2m_max'][i]}°C, Rain Prob: {daily['precipitation_probability_max'][i]}%\n"
                
    except Exception:
        forecast_str = "Forecast data unavailable."
        
    system_instruction = f"""You are the KrishiAI Weather Decision Support AI.
Analyze the following 7-day weather forecast for {location} and provide EXACTLY THREE short, actionable recommendations for a farmer growing {crop}:
1. Seeding Recommendation
2. Harvesting Recommendation
3. Irrigation Advice

Keep it very brief, simple, and direct.

Forecast Data:
{forecast_str}
"""

    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        return jsonify({"insights": "LLM API Key missing."})

    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=gemini_key)
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents="Provide weather recommendations based on the system instructions.",
            config=types.GenerateContentConfig(
                system_instruction=system_instruction, 
                temperature=0.2
            )
        )
        return jsonify({"insights": response.text})
    except Exception as e:
        print("Gemini Error:", e)
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return jsonify({"insights": "Google Gemini API Quota Exceeded. Please try again later or check your billing plan."})
        return jsonify({"insights": "AI Insights currently unavailable: " + error_msg})

@app.post("/api/whatsapp/webhook")
def whatsapp_webhook():
    # This endpoint mimics a Twilio WhatsApp Webhook.
    # Twilio sends data as form-urlencoded, but we support JSON for testing.
    data = request.json if request.is_json else request.form
    sender = data.get("From", "Unknown")
    message = data.get("Body", "").strip()
    
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        return jsonify({"reply": "API key missing for AI bot."})

    df = _df_cached()
    market_context = _get_market_context_str(df)

    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=gemini_key)
        
        system_prompt = f"""You are the official KrishiAI WhatsApp Assistant. 
You are speaking to a farmer on WhatsApp. 
If the user says 'hi', 'hello', or initiates the chat, ALWAYS introduce yourself as '🌱 *KrishiAI*' and immediately ask them to choose their preferred language (e.g., Kannada, English, Hindi) before proceeding.
Reply in the user's chosen language. 
Keep your answers short, concise, and helpful, using emojis appropriately for WhatsApp.
You answer questions accurately based ONLY on the data provided below.
DO NOT invent price data. If the data for a crop/district is not in the context, say you don't have that data.

Market Data Context:
{market_context}
"""
        
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt, 
                temperature=0.3
            )
        )
        reply_text = response.text
        
        print(f"========== WHATSAPP BOT RESPONSE ==========")
        print(f"To: {sender}")
        print(f"Reply: {reply_text}")
        print(f"==========================================")
        
        from twilio.twiml.messaging_response import MessagingResponse
        twiml = MessagingResponse()
        twiml.message(reply_text)
        
        return str(twiml), 200, {'Content-Type': 'text/xml'}
    except Exception as e:
        print("Webhook Error:", e)
        # Fallback response so Twilio doesn't crash
        from twilio.twiml.messaging_response import MessagingResponse
        twiml = MessagingResponse()
        twiml.message("KrishiAI is currently undergoing maintenance. Please try again later.")
        return str(twiml), 200, {'Content-Type': 'text/xml'}


@app.post("/api/voice/welcome")
def voice_welcome():
    from twilio.twiml.voice_response import VoiceResponse, Gather
    
    commitment_id = request.args.get("commitment_id")
    item = request.args.get("item", "crop")
    quantity = request.args.get("quantity", "0")
    
    response = VoiceResponse()
    
    # Greet and ask for confirmation
    gather = Gather(num_digits=1, action=f"/api/voice/confirm?commitment_id={commitment_id}")
    gather.say(f"Hello, this is Krishi AI. You have registered to supply {quantity} quintals of {item}. Press 1 to confirm, or press 2 to cancel.")
    response.append(gather)
    
    # If no input, loop back or hang up
    response.say("We didn't receive any input. Thank you for using Krishi AI. Goodbye.")
    return str(response), 200, {'Content-Type': 'text/xml'}


@app.post("/api/voice/confirm")
def voice_confirm():
    from twilio.twiml.voice_response import VoiceResponse
    
    digits = request.form.get("Digits")
    commitment_id = request.args.get("commitment_id")
    
    response = VoiceResponse()
    
    if digits == "1":
        # Update database to confirmed
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE FarmerCommitment SET status = 'confirmed' WHERE id = ?", (commitment_id,))
        conn.commit()
        conn.close()
        response.say("Thank you. Your registration is now confirmed. Goodbye.")
    elif digits == "2":
        # Update database to cancelled
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("UPDATE FarmerCommitment SET status = 'cancelled' WHERE id = ?", (commitment_id,))
        conn.commit()
        conn.close()
        response.say("Your registration has been cancelled. Thank you for letting us know. Goodbye.")
    else:
        response.say("Invalid input. Goodbye.")
        
    return str(response), 200, {'Content-Type': 'text/xml'}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)

