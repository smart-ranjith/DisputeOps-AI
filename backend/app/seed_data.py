import json
from app.database import get_db_connection, init_db

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear existing tables
    cursor.execute("DELETE FROM disputes")
    cursor.execute("DELETE FROM orders")
    cursor.execute("DELETE FROM evidence_records")
    cursor.execute("DELETE FROM investigation_cases")
    cursor.execute("DELETE FROM audit_logs")

    # 1. Seed Disputes
    disputes = [
        (
            "PP-D-839210-INR",
            "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
            "WAITING_FOR_SELLER_RESPONSE",
            "CHARGEBACK",
            5000.0,
            "INR",
            "Aarav Sharma",
            "aarav.sharma@example.com",
            "TXN-998822-DEL",
            "2026-11-06T10:15:00Z",
            "2026-11-16T23:59:59Z",
            json.dumps(["PROVIDE_EVIDENCE", "ACCEPT_CLAIM", "MAKE_OFFER"]),
            "PENDING"
        ),
        (
            "PP-D-774129-INR",
            "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
            "WAITING_FOR_SELLER_RESPONSE",
            "INQUIRY",
            3450.0,
            "INR",
            "Pooja Patel",
            "pooja.patel@example.com",
            "TXN-441199-MIA",
            "2026-11-07T14:20:00Z",
            "2026-11-17T23:59:59Z",
            json.dumps(["PROVIDE_EVIDENCE", "ACCEPT_CLAIM"]),
            "PENDING"
        ),
        (
            "PP-D-610238-INR",
            "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED",
            "WAITING_FOR_SELLER_RESPONSE",
            "CHARGEBACK",
            8990.0,
            "INR",
            "Rohan Mehra",
            "rohan.mehra@example.com",
            "TXN-330011-SNAD",
            "2026-11-05T09:00:00Z",
            "2026-11-15T23:59:59Z",
            json.dumps(["PROVIDE_EVIDENCE", "ISSUE_REFUND"]),
            "PENDING"
        ),
        (
            "PP-D-512094-INR",
            "UNAUTHORISED",
            "WAITING_FOR_SELLER_RESPONSE",
            "CHARGEBACK",
            12500.0,
            "INR",
            "Vikram Sen",
            "vikram.sen@example.com",
            "TXN-882211-AUTH",
            "2026-11-08T16:45:00Z",
            "2026-11-18T23:59:59Z",
            json.dumps(["PROVIDE_EVIDENCE", "ACCEPT_CLAIM"]),
            "PENDING"
        )
    ]

    cursor.executemany("""
        INSERT INTO disputes (
            dispute_id, reason, status, lifecycle_stage, amount, currency,
            buyer_name, buyer_email, seller_transaction_id, create_time,
            response_due_date, response_options, investigation_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, disputes)

    # 2. Seed Orders & Merchant Records
    orders = [
        (
            "ORD-5000-INR",
            "TXN-998822-DEL",
            "Aarav Sharma",
            "aarav.sharma@example.com",
            "Sony Wireless Active Noise-Cancelling Headphones (WH-CH720N)",
            "Consumer Electronics",
            5000.0,
            "INR",
            "2026-11-01T08:30:00Z",
            "BlueDart Express",
            "BLD-998822119",
            "DELIVERED",
            "2026-11-04T14:12:00Z",
            "Flat 402, Lotus Residency, 12th Main, Indiranagar, Bengaluru, KA 560038",
            "https://cdn.merchant-storage.com/pod/BLD-998822119-pod.pdf",
            1,
            "INV-2026-8819",
            None
        ),
        (
            "ORD-3450-INR",
            "TXN-441199-MIA",
            "Pooja Patel",
            "pooja.patel@example.com",
            "Ergonomic Mechanical Keyboard (RGB Hot-Swappable)",
            "Computer Accessories",
            3450.0,
            "INR",
            "2026-11-02T11:15:00Z",
            "Delhivery Logistics",
            "DLV-441199332",
            "IN_TRANSIT",  # Note: NOT DELIVERED - flags the gap!
            None,
            "B-12, Green Park Apartments, SG Highway, Ahmedabad, GJ 380054",
            None,  # No Proof of Delivery
            0,
            "INV-2026-4402",
            None
        ),
        (
            "ORD-8990-INR",
            "TXN-330011-SNAD",
            "Rohan Mehra",
            "rohan.mehra@example.com",
            "Ultra HD 4K Action Camera Waterproof Bundle with Mounts",
            "Photography & Video",
            8990.0,
            "INR",
            "2026-10-28T16:00:00Z",
            "BlueDart Express",
            "BLD-330011884",
            "DELIVERED",
            "2026-10-31T17:40:00Z",
            "C-55, Sector 44, Noida, UP 201301",
            "https://cdn.merchant-storage.com/pod/BLD-330011884-pod.pdf",
            1,
            "INV-2026-3391",
            None
        ),
        (
            "ORD-12500-INR",
            "TXN-882211-AUTH",
            "Vikram Sen",
            "vikram.sen@example.com",
            "Titan Connected Touch Pro Smartwatch",
            "Wearables & Watches",
            12500.0,
            "INR",
            "2026-11-05T19:22:00Z",
            "Express Courier",
            "EXP-882211776",
            "DELIVERED",
            "2026-11-07T12:05:00Z",
            "44 Park Street, Kolkata, WB 700016",
            "https://cdn.merchant-storage.com/pod/EXP-882211776-pod.pdf",
            1,
            "INV-2026-1205",
            None
        )
    ]

    cursor.executemany("""
        INSERT INTO orders (
            order_id, transaction_id, customer_name, customer_email,
            item_title, item_category, amount, currency, order_date,
            carrier, tracking_number, delivery_status, delivered_date,
            delivery_address, proof_of_delivery_url, signature_available,
            invoice_number, refund_records
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, orders)

    # Initial audit log
    cursor.execute("""
        INSERT INTO audit_logs (dispute_id, action, actor, details, timestamp)
        VALUES ('PP-D-839210-INR', 'DISPUTE_INGESTED', 'PayPal Webhook Engine', '{"event": "DISPUTES.DISPUTE.CREATED"}', '2026-11-06T10:15:00Z')
    """)

    conn.commit()
    conn.close()
    print("DisputeOps AI SQLite database seeded successfully.")

if __name__ == "__main__":
    seed_database()
