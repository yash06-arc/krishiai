import sqlite3
import os
import random
from typing import List, Dict, Any

from data_gen import CROPS, DISTRICTS

DB_PATH = os.path.join(os.path.dirname(__file__), "krishiai.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # MandiDemand table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS MandiDemand (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mandi_id TEXT NOT NULL,
            item TEXT NOT NULL,
            base_demand REAL NOT NULL,
            unmet_demand REAL NOT NULL,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(mandi_id, item)
        )
    ''')

    # FarmerAgreement table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS FarmerAgreement (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id TEXT NOT NULL,
            mandi_id TEXT NOT NULL,
            item TEXT NOT NULL,
            quantity REAL NOT NULL,
            accepted BOOLEAN NOT NULL CHECK (accepted IN (0, 1)),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            agreement_text TEXT NOT NULL,
            penalty_terms TEXT NOT NULL
        )
    ''')

    # FarmerCommitment table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS FarmerCommitment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id TEXT NOT NULL,
            mandi_id TEXT NOT NULL,
            item TEXT NOT NULL,
            quantity REAL NOT NULL,
            delivered_quantity REAL DEFAULT 0,
            status TEXT NOT NULL CHECK (status IN ('promised', 'confirmed', 'cancelled', 'delivered', 'partial', 'failed')),
            phone_number TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # PenaltyLedger table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS PenaltyLedger (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id TEXT NOT NULL,
            amount REAL NOT NULL,
            reason TEXT NOT NULL,
            commitment_id INTEGER NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(commitment_id) REFERENCES FarmerCommitment(id)
        )
    ''')

    # WeatherData table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS WeatherData (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT NOT NULL,
            temp REAL,
            humidity REAL,
            rain_prob REAL,
            wind_speed REAL,
            cloud_cover REAL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # WeatherAlerts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS WeatherAlerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id TEXT,
            location TEXT NOT NULL,
            alert_type TEXT NOT NULL,
            message TEXT NOT NULL,
            severity TEXT NOT NULL CHECK (severity IN ('Green', 'Yellow', 'Red')),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Seed MandiDemand if empty
    cursor.execute("SELECT COUNT(*) FROM MandiDemand")
    if cursor.fetchone()[0] == 0:
        print("Seeding initial MandiDemand data...")
        random.seed(42) # For reproducible demo data
        for district in DISTRICTS:
            for crop in CROPS:
                # Random base demand between 100 and 2000 quintals
                base = float(random.randint(100, 2000))
                cursor.execute('''
                    INSERT INTO MandiDemand (mandi_id, item, base_demand, unmet_demand)
                    VALUES (?, ?, ?, ?)
                ''', (district, crop, base, base))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
