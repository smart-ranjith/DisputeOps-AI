import sqlite3
import json
from datetime import datetime
from app.config import settings

def get_db_connection():
    conn = sqlite3.connect(settings.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Disputes table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS disputes (
        dispute_id TEXT PRIMARY KEY,
        reason TEXT NOT NULL,
        status TEXT NOT NULL,
        lifecycle_stage TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        buyer_name TEXT,
        buyer_email TEXT,
        seller_transaction_id TEXT,
        create_time TEXT,
        response_due_date TEXT,
        response_options TEXT,
        investigation_status TEXT DEFAULT 'PENDING'
    )
    """)
    
    # 2. Orders & Merchant Records table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        transaction_id TEXT UNIQUE,
        customer_name TEXT,
        customer_email TEXT,
        item_title TEXT,
        item_category TEXT,
        amount REAL,
        currency TEXT,
        order_date TEXT,
        carrier TEXT,
        tracking_number TEXT,
        delivery_status TEXT,
        delivered_date TEXT,
        delivery_address TEXT,
        proof_of_delivery_url TEXT,
        signature_available INTEGER DEFAULT 0,
        invoice_number TEXT,
        refund_records TEXT
    )
    """)
    
    # 3. Evidence items table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evidence_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dispute_id TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        document_url TEXT,
        verified INTEGER DEFAULT 0,
        audit_notes TEXT,
        source_system TEXT,
        FOREIGN KEY (dispute_id) REFERENCES disputes (dispute_id)
    )
    """)
    
    # 4. Investigation Cases
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS investigation_cases (
        dispute_id TEXT PRIMARY KEY,
        analyst_output TEXT,
        collector_output TEXT,
        auditor_output TEXT,
        resolution_draft TEXT,
        human_review_status TEXT DEFAULT 'PENDING_REVIEW',
        reviewer_notes TEXT,
        submitted_at TEXT,
        submission_receipt TEXT,
        updated_at TEXT,
        FOREIGN KEY (dispute_id) REFERENCES disputes (dispute_id)
    )
    """)
    
    # 5. Audit Trail Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dispute_id TEXT NOT NULL,
        action TEXT NOT NULL,
        actor TEXT NOT NULL,
        details TEXT,
        timestamp TEXT NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

def log_audit(dispute_id: str, action: str, actor: str, details: dict | str):
    conn = get_db_connection()
    cursor = conn.cursor()
    details_str = json.dumps(details) if isinstance(details, (dict, list)) else str(details)
    cursor.execute("""
        INSERT INTO audit_logs (dispute_id, action, actor, details, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (dispute_id, action, actor, details_str, datetime.utcnow().isoformat() + "Z"))
    conn.commit()
    conn.close()
