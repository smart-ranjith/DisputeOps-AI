import sqlite3
import json
from app.database import get_db_connection

class MerchantDataService:
    def get_order_by_transaction_id(self, transaction_id: str) -> dict | None:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE transaction_id = ?", (transaction_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return dict(row)

    def get_order_by_id(self, order_id: str) -> dict | None:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        return dict(row)

    def search_orders_by_customer(self, email: str) -> list[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE customer_email = ?", (email,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def get_evidence_by_dispute(self, dispute_id: str) -> list[dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM evidence_records WHERE dispute_id = ?", (dispute_id,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def add_evidence_record(self, record: dict) -> int:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO evidence_records (dispute_id, category, title, description, document_url, verified, audit_notes, source_system)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            record["dispute_id"],
            record["category"],
            record["title"],
            record.get("description", ""),
            record.get("document_url", ""),
            1 if record.get("verified", False) else 0,
            record.get("audit_notes", ""),
            record.get("source_system", "MERCHANT_ERP")
        ))
        conn.commit()
        last_id = cursor.lastrowid
        conn.close()
        return last_id

merchant_data_service = MerchantDataService()
