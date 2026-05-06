import os
import requests
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Data.gov.in API Key
API_KEY = os.environ.get("DATAGOV_API_KEY")

# The resource ID for "Daily Wholesale Prices of Agricultural Commodities"
# Note: This ID can change; if you get an error, search data.gov.in for the latest Resource ID.
RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"

CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "prices_karnataka.csv")

def fetch_live_data():
    if not API_KEY:
        print("ERROR: DATAGOV_API_KEY is not set in the .env file.")
        print("Please register at https://data.gov.in to get your free API key.")
        return {"status": "error", "message": "DATAGOV_API_KEY is not set."}

    url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"
    params = {
        "api-key": API_KEY,
        "format": "json",
        "limit": 1000,
        "filters[state.keyword]": "Karnataka"
    }

    print("Fetching live data from Agmarknet (Data.gov.in)...")
    response = requests.get(url, params=params)
    
    if response.status_code != 200:
        print(f"Failed to fetch data: {response.status_code}")
        print(response.text)
        return {"status": "error", "message": f"Failed to fetch data: {response.status_code}"}
        
    data = response.json()
    records = data.get("records", [])
    
    if not records:
        print("No records found for Karnataka today.")
        return {"status": "success", "message": "No records found for Karnataka today.", "records": 0}

    print(f"Fetched {len(records)} records. Parsing data...")
    
    CROP_MAP = {
        "green chilli": "Chilli",
        "chilly capsicum": "Chilli",
        "paddy(common)": "Rice",
        "ragi(finger millet)": "Ragi",
        "ground nut seed": "Groundnut",
        "ginger(green)": "Ginger",
        "ginger(dry)": "Ginger",
        "bajra(pearl millet/cumbu)": "Maize",
        "bengal gram(gram)(whole)": "Groundnut",
    }

    DISTRICT_MAP = {
        "bangalore": "Bangalore Urban",
        "mysore": "Mysuru",
        "tumkur": "Tumakuru",
        "belgaum": "Belagavi",
        "shimoga": "Shivamogga",
        "madikeri(kodagu)": "Kodagu",
        "karwar(uttar kannad)": "Uttara Kannada",
        "chamrajnagar": "Chamarajanagar",
        "bellary": "Ballari",
        "gulbarga": "Kalaburagi",
        "bijapur": "Vijayapura",
        "hubli": "Dharwad",
        "mangalore": "Dakshina Kannada",
        "chikmagalur": "Chikkamagaluru"
    }

    # Format the data to match our platform's expected schema
    # Expected: Crop, District, Date, Price
    new_rows = []
    for row in records:
        # data.gov.in keys are usually lowercase
        crop = row.get("commodity", "")
        district = row.get("district", "")
        arrival_date = row.get("arrival_date", "")
        
        # Agmarknet provides min_price, max_price, modal_price. We'll use modal_price (average).
        try:
            # Prices in Agmarknet are usually per Quintal (100 kg). 
            # If your app uses per Kg, divide by 100.
            modal_price_per_quintal = float(row.get("modal_price", 0))
            price_per_kg = round(modal_price_per_quintal / 100.0, 2)
            
            # Formatting Date to ISO format if it's not already
            if arrival_date:
                dt = datetime.strptime(arrival_date, "%d/%m/%Y")
                arrival_date = dt.date().isoformat()
                
        except ValueError:
            continue
            
        if crop and district and price_per_kg > 0:
            # Map the names
            mapped_crop = CROP_MAP.get(crop.lower(), crop.title())
            mapped_district = DISTRICT_MAP.get(district.lower(), district.title())
            
            new_rows.append({
                "Crop": mapped_crop,
                "District": mapped_district,
                "Date": arrival_date,
                "Price": price_per_kg
            })

    if not new_rows:
        print("No valid data could be parsed.")
        return {"status": "success", "message": "No valid data could be parsed.", "records": 0}
        
    new_df = pd.DataFrame(new_rows)
    
    # Append to existing CSV or overwrite based on your preference
    if os.path.exists(CSV_PATH):
        existing_df = pd.read_csv(CSV_PATH)
        # Combine and drop duplicates to avoid storing the same day twice
        combined_df = pd.concat([existing_df, new_df]).drop_duplicates(subset=['Crop', 'District', 'Date'], keep='last')
        combined_df.to_csv(CSV_PATH, index=False)
        print(f"Appended live data and saved to {CSV_PATH}")
    else:
        new_df.to_csv(CSV_PATH, index=False)
        print(f"Created new dataset at {CSV_PATH}")

    return {"status": "success", "message": "Data synchronized successfully.", "records": len(new_rows)}

if __name__ == "__main__":
    fetch_live_data()
