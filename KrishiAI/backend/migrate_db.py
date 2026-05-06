import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "krishiai.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Starting migration...")
    
    # 1. Create new table with updated CHECK constraint
    cursor.execute('''
        CREATE TABLE FarmerCommitment_new (
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
    
    # 2. Copy data
    cursor.execute('INSERT INTO FarmerCommitment_new SELECT * FROM FarmerCommitment')
    
    # 3. Swap tables
    cursor.execute('DROP TABLE FarmerCommitment')
    cursor.execute('ALTER TABLE FarmerCommitment_new RENAME TO FarmerCommitment')
    
    conn.commit()
    conn.close()
    print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
