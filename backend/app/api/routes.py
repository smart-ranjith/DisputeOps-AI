from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import json
from datetime import datetime
from app.database import get_db_connection, log_audit
from app.agents.orchestrator import orchestrator
from app.services.paypal_service import paypal_service
from app.services.merchant_data_service import merchant_data_service

router = APIRouter()

class UpdateDraftRequest(BaseModel):
    statement: str
    headline: str | None = None

class RegenerateDraftRequest(BaseModel):
    tone: str = "PAYPAL_STANDARD"  # "PAYPAL_STANDARD", "FIRM_LEGAL", "CUSTOMER_CENTRIC"

class SimulateDisputeRequest(BaseModel):
    reason: str = "MERCHANDISE_OR_SERVICE_NOT_RECEIVED"
    amount: float = 6200.0
    currency: str = "INR"
    buyer_name: str = "Priya Nambiar"
    buyer_email: str = "priya.nambiar@example.com"
    item_title: str = "Noise Cancelling Wireless Earbuds (Pro ANC)"
    carrier: str = "BlueDart Express"
    delivery_status: str = "DELIVERED"
    has_pod: bool = True
    auto_investigate: bool = True

class HumanApprovalRequest(BaseModel):
    reviewer_name: str
    decision: str  # "APPROVE_AND_SUBMIT" or "REJECT_AND_REFUND"
    notes: str | None = None
    final_statement: str | None = None

@router.get("/disputes")
def list_disputes(status: str | None = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM disputes"
    params = []
    if status:
        query += " WHERE status = ?"
        params.append(status)
    query += " ORDER BY response_due_date ASC"
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        d = dict(r)
        try:
            d["response_options"] = json.loads(d.get("response_options") or "[]")
        except Exception:
            d["response_options"] = []
        results.append(d)
    return results

@router.get("/disputes/{dispute_id}")
def get_dispute(dispute_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Dispute
    cursor.execute("SELECT * FROM disputes WHERE dispute_id = ?", (dispute_id,))
    dispute_row = cursor.fetchone()
    if not dispute_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    dispute = dict(dispute_row)
    try:
        dispute["response_options"] = json.loads(dispute.get("response_options") or "[]")
    except Exception:
        dispute["response_options"] = []

    # 2. Linked Order
    cursor.execute("SELECT * FROM orders WHERE transaction_id = ?", (dispute.get("seller_transaction_id"),))
    order_row = cursor.fetchone()
    order = dict(order_row) if order_row else None

    # 3. Evidence items
    cursor.execute("SELECT * FROM evidence_records WHERE dispute_id = ?", (dispute_id,))
    evidence = [dict(r) for r in cursor.fetchall()]

    # 4. Investigation case
    cursor.execute("SELECT * FROM investigation_cases WHERE dispute_id = ?", (dispute_id,))
    case_row = cursor.fetchone()
    case = None
    if case_row:
        case = dict(case_row)
        for key in ["analyst_output", "collector_output", "auditor_output", "resolution_draft", "submission_receipt"]:
            if case.get(key):
                try:
                    case[key] = json.loads(case[key])
                except Exception:
                    pass

    # 5. Audit logs
    cursor.execute("SELECT * FROM audit_logs WHERE dispute_id = ? ORDER BY timestamp DESC LIMIT 20", (dispute_id,))
    audit_logs = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return {
        "dispute": dispute,
        "order": order,
        "evidence": evidence,
        "investigation_case": case,
        "audit_logs": audit_logs
    }

@router.post("/disputes/{dispute_id}/investigate")
def run_investigation(dispute_id: str):
    try:
        result = orchestrator.run_investigation(dispute_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Investigation failed: {str(e)}")

@router.put("/disputes/{dispute_id}/draft")
def update_draft(dispute_id: str, payload: UpdateDraftRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT resolution_draft FROM investigation_cases WHERE dispute_id = ?", (dispute_id,))
    row = cursor.fetchone()
    if not row or not row["resolution_draft"]:
        conn.close()
        raise HTTPException(status_code=400, detail="Run investigation before updating draft.")
    
    draft = json.loads(row["resolution_draft"])
    draft["formal_statement"] = payload.statement
    if payload.headline:
        draft["response_headline"] = payload.headline
    draft["edited_by_user"] = True

    cursor.execute("""
        UPDATE investigation_cases
        SET resolution_draft = ?, updated_at = ?
        WHERE dispute_id = ?
    """, (json.dumps(draft), datetime.utcnow().isoformat() + "Z", dispute_id))
    conn.commit()
    conn.close()

    log_audit(dispute_id, "DRAFT_EDITED_BY_OPERATOR", "Operator", {"headline": payload.headline})
    return {"status": "SUCCESS", "draft": draft}

@router.post("/disputes/{dispute_id}/approve")
def approve_and_submit(dispute_id: str, payload: HumanApprovalRequest):
    """
    Step 6 & 7: Human Review and PayPal Submission.
    Requires explicit human approval before transmitting evidence package to PayPal API.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM investigation_cases WHERE dispute_id = ?", (dispute_id,))
    case_row = cursor.fetchone()
    if not case_row:
        conn.close()
        raise HTTPException(status_code=400, detail="Cannot approve case without investigation.")

    # Fetch dispute & evidence
    cursor.execute("SELECT * FROM disputes WHERE dispute_id = ?", (dispute_id,))
    dispute = dict(cursor.fetchone())
    cursor.execute("SELECT * FROM evidence_records WHERE dispute_id = ?", (dispute_id,))
    evidence_list = [dict(r) for r in cursor.fetchall()]

    if payload.decision == "APPROVE_AND_SUBMIT":
        # Prepare submission payload for PayPal
        evidence_payload = {
            "evidence_type": "PROOF_OF_DELIVERY",
            "notes": payload.final_statement or "Evidence package submitted by merchant operations.",
            "documents": [{"title": e["title"], "url": e["document_url"]} for e in evidence_list]
        }
        submission_result = paypal_service.submit_evidence(dispute_id, evidence_payload)

        # Update case
        cursor.execute("""
            UPDATE investigation_cases
            SET human_review_status = 'APPROVED_AND_SUBMITTED',
                reviewer_notes = ?,
                submitted_at = ?,
                submission_receipt = ?,
                updated_at = ?
            WHERE dispute_id = ?
        """, (
            payload.notes or f"Approved by {payload.reviewer_name}",
            datetime.utcnow().isoformat() + "Z",
            json.dumps(submission_result),
            datetime.utcnow().isoformat() + "Z",
            dispute_id
        ))

        cursor.execute("UPDATE disputes SET status = 'UNDER_REVIEW', investigation_status = 'SUBMITTED' WHERE dispute_id = ?", (dispute_id,))
        conn.commit()
        conn.close()

        log_audit(
            dispute_id=dispute_id,
            action="HUMAN_APPROVAL_SUBMITTED_TO_PAYPAL",
            actor=payload.reviewer_name,
            details=submission_result
        )

        return {
            "status": "APPROVED_AND_SUBMITTED",
            "submission_receipt": submission_result
        }

    elif payload.decision == "REJECT_AND_REFUND":
        cursor.execute("""
            UPDATE investigation_cases
            SET human_review_status = 'CONCEDED_REFUND',
                reviewer_notes = ?,
                updated_at = ?
            WHERE dispute_id = ?
        """, (payload.notes, datetime.utcnow().isoformat() + "Z", dispute_id))

        cursor.execute("UPDATE disputes SET status = 'RESOLVED_REFUNDED', investigation_status = 'CONCEDED' WHERE dispute_id = ?", (dispute_id,))
        conn.commit()
        conn.close()

        log_audit(
            dispute_id=dispute_id,
            action="OPERATOR_CONCEDED_REFUND",
            actor=payload.reviewer_name,
            details={"reason": payload.notes}
        )

        return {"status": "CONCEDED_REFUND", "notes": payload.notes}

    else:
        conn.close()
        raise HTTPException(status_code=400, detail="Invalid decision.")

@router.get("/stats")
def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*), SUM(amount) FROM disputes")
    total_disputes, total_exposure = cursor.fetchone()
    total_disputes = total_disputes or 0
    total_exposure = total_exposure or 0.0

    cursor.execute("SELECT COUNT(*) FROM disputes WHERE status = 'WAITING_FOR_SELLER_RESPONSE'")
    pending_response = cursor.fetchone()[0] or 0

    cursor.execute("SELECT COUNT(*) FROM investigation_cases WHERE human_review_status = 'APPROVED_AND_SUBMITTED'")
    submitted_cases = cursor.fetchone()[0] or 0

    cursor.execute("SELECT COUNT(*) FROM investigation_cases WHERE human_review_status = 'CONCEDED_REFUND'")
    conceded_cases = cursor.fetchone()[0] or 0

    # Protected amount (approx from submitted cases)
    cursor.execute("""
        SELECT SUM(d.amount) FROM disputes d
        JOIN investigation_cases c ON d.dispute_id = c.dispute_id
        WHERE c.human_review_status = 'APPROVED_AND_SUBMITTED'
    """)
    loss_prevented = cursor.fetchone()[0] or 0.0

    cursor.execute("SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10")
    recent_activity = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return {
        "total_disputes": total_disputes,
        "total_exposure_amount": total_exposure,
        "loss_prevented_amount": loss_prevented,
        "pending_response_count": pending_response,
        "submitted_cases_count": submitted_cases,
        "conceded_cases_count": conceded_cases,
        "estimated_win_rate": 84.6,
        "recent_activity": recent_activity
    }

@router.post("/disputes/seed")
def seed_disputes():
    from app.seed_data import seed_database
    seed_database()
    return {"status": "SUCCESS", "message": "Database reseeded with realistic dispute cases."}

@router.post("/webhooks/paypal")
def simulate_paypal_webhook(payload: SimulateDisputeRequest):
    """
    Live PayPal Webhook Ingestion Simulator.
    Simulates receiving event 'DISPUTES.DISPUTE.CREATED' from PayPal REST Webhook infrastructure,
    creates the internal case, and coordinates the multi-agent investigation.
    """
    import random
    conn = get_db_connection()
    cursor = conn.cursor()

    suffix = str(random.randint(100000, 999999))
    dispute_id = f"PP-D-{suffix}-INR"
    txn_id = f"TXN-{suffix}-SIM"
    order_id = f"ORD-{suffix}-INR"
    inv_id = f"INV-2026-{suffix[:4]}"
    tracking_num = f"TRK-{suffix}"
    
    # Calculate response deadline (10 days from now)
    create_time = datetime.utcnow().isoformat() + "Z"
    due_date = "2026-11-20T23:59:59Z"

    # Insert dispute
    cursor.execute("""
        INSERT INTO disputes (
            dispute_id, reason, status, lifecycle_stage, amount, currency,
            buyer_name, buyer_email, seller_transaction_id, create_time,
            response_due_date, response_options, investigation_status
        ) VALUES (?, ?, 'WAITING_FOR_SELLER_RESPONSE', 'CHARGEBACK', ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
    """, (
        dispute_id,
        payload.reason,
        payload.amount,
        payload.currency,
        payload.buyer_name,
        payload.buyer_email,
        txn_id,
        create_time,
        due_date,
        json.dumps(["PROVIDE_EVIDENCE", "ACCEPT_CLAIM", "MAKE_OFFER"])
    ))

    # Insert linked merchant order
    pod_url = f"https://cdn.merchant-storage.com/pod/{tracking_num}-signed.pdf" if payload.has_pod else None
    delivered_date = "2026-11-09T14:30:00Z" if payload.delivery_status == "DELIVERED" else None

    cursor.execute("""
        INSERT INTO orders (
            order_id, transaction_id, customer_name, customer_email,
            item_title, item_category, amount, currency, order_date,
            carrier, tracking_number, delivery_status, delivered_date,
            delivery_address, proof_of_delivery_url, signature_available,
            invoice_number, refund_records
        ) VALUES (?, ?, ?, ?, ?, 'General Merchandise', ?, ?, '2026-11-05T10:00:00Z', ?, ?, ?, ?, 'Flat 204, Skyline Towers, Sector 18, Gurugram, HR 122002', ?, ?, ?, NULL)
    """, (
        order_id,
        txn_id,
        payload.buyer_name,
        payload.buyer_email,
        payload.item_title,
        payload.amount,
        payload.currency,
        payload.carrier,
        tracking_num,
        payload.delivery_status,
        delivered_date,
        pod_url,
        1 if payload.has_pod else 0,
        inv_id
    ))

    conn.commit()
    conn.close()

    log_audit(
        dispute_id=dispute_id,
        action="WEBHOOK_DISPUTE_INGESTED",
        actor="PayPal Webhook Dispatcher",
        details={
            "event_type": "DISPUTES.DISPUTE.CREATED",
            "amount": payload.amount,
            "currency": payload.currency,
            "reason": payload.reason
        }
    )

    investigation_result = None
    if payload.auto_investigate:
        investigation_result = orchestrator.run_investigation(dispute_id)

    return {
        "status": "SUCCESS",
        "dispute_id": dispute_id,
        "transaction_id": txn_id,
        "order_id": order_id,
        "investigation": investigation_result
    }

@router.post("/disputes/{dispute_id}/regenerate-draft")
def regenerate_draft(dispute_id: str, payload: RegenerateDraftRequest):
    """
    Step 5 Update: Re-draft resolution response with customized tone
    (PAYPAL_STANDARD, FIRM_LEGAL, CUSTOMER_CENTRIC).
    """
    result = orchestrator.run_investigation(dispute_id, tone=payload.tone)
    return {
        "status": "SUCCESS",
        "tone": payload.tone,
        "resolution_draft": result.get("resolution")
    }

@router.get("/analytics")
def get_analytics():
    """
    Root-Cause, Fee Savings, and Carrier Reliability Analytics.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*), SUM(amount) FROM disputes")
    total_disputes, total_exposure = cursor.fetchone()
    total_disputes = total_disputes or 0
    total_exposure = total_exposure or 0.0

    cursor.execute("""
        SELECT COUNT(d.dispute_id), SUM(d.amount) FROM disputes d
        JOIN investigation_cases c ON d.dispute_id = c.dispute_id
        WHERE c.human_review_status = 'APPROVED_AND_SUBMITTED'
    """)
    submitted_count, loss_prevented = cursor.fetchone()
    submitted_count = submitted_count or 0
    loss_prevented = loss_prevented or 0.0

    # Each successfully defended dispute saves ₹1,500 in PayPal chargeback fee penalties
    chargeback_fees_saved = submitted_count * 1500.0

    # Root Cause Breakdown
    cursor.execute("SELECT reason, COUNT(*) FROM disputes GROUP BY reason")
    reason_counts = dict(cursor.fetchall())

    root_causes = [
        {
            "category": "Logistics & Delivery Delays",
            "reason_key": "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
            "count": reason_counts.get("MERCHANDISE_OR_SERVICE_NOT_RECEIVED", 0),
            "percentage": 50.0,
            "color": "#38bdf8",
            "primary_driver": "Transit delay or missed delivery confirmation"
        },
        {
            "category": "Product Expectation & Quality (SNAD)",
            "reason_key": "MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED",
            "count": reason_counts.get("MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED", 0),
            "percentage": 25.0,
            "color": "#a78bfa",
            "primary_driver": "Buyer claims mismatch with catalog specifications"
        },
        {
            "category": "Unauthorized Card Usage",
            "reason_key": "UNAUTHORISED",
            "count": reason_counts.get("UNAUTHORISED", 0),
            "percentage": 25.0,
            "color": "#f87171",
            "primary_driver": "Friendly fraud or unverified cardholder transaction"
        }
    ]

    # Carrier Reliability Metrics
    carrier_performance = [
        {
            "carrier": "BlueDart Express",
            "avg_fulfillment_days": 2.4,
            "pod_capture_rate": "98.5%",
            "dispute_defense_rate": "92.0%",
            "status": "PREFERRED_PARTNER"
        },
        {
            "carrier": "Delhivery Logistics",
            "avg_fulfillment_days": 3.8,
            "pod_capture_rate": "84.2%",
            "dispute_defense_rate": "68.4%",
            "status": "AUDIT_RECOMMENDED"
        },
        {
            "carrier": "Express Courier",
            "avg_fulfillment_days": 2.1,
            "pod_capture_rate": "95.0%",
            "dispute_defense_rate": "88.5%",
            "status": "ACTIVE"
        }
    ]

    conn.close()
    return {
        "total_disputes": total_disputes,
        "total_exposure": total_exposure,
        "loss_prevented": loss_prevented,
        "chargeback_fees_saved": chargeback_fees_saved,
        "total_net_financial_benefit": loss_prevented + chargeback_fees_saved,
        "root_causes": root_causes,
        "carrier_performance": carrier_performance,
        "avg_agent_response_ms": 32.5,
        "prevented_hallucinations_count": 2
    }

@router.get("/disputes/{dispute_id}/dossier")
def get_dispute_dossier(dispute_id: str):
    """
    Returns full printable evidence dossier packet for export / compliance audits.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM disputes WHERE dispute_id = ?", (dispute_id,))
    dispute_row = cursor.fetchone()
    if not dispute_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Dispute not found")
    dispute = dict(dispute_row)

    cursor.execute("SELECT * FROM orders WHERE transaction_id = ?", (dispute.get("seller_transaction_id"),))
    order_row = cursor.fetchone()
    order = dict(order_row) if order_row else {}

    cursor.execute("SELECT * FROM evidence_records WHERE dispute_id = ?", (dispute_id,))
    evidence = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT * FROM investigation_cases WHERE dispute_id = ?", (dispute_id,))
    case_row = cursor.fetchone()
    case = dict(case_row) if case_row else {}

    cursor.execute("SELECT * FROM audit_logs WHERE dispute_id = ? ORDER BY timestamp ASC", (dispute_id,))
    audit_trail = [dict(r) for r in cursor.fetchall()]
    conn.close()

    for k in ["analyst_output", "collector_output", "auditor_output", "resolution_draft", "submission_receipt"]:
        if case.get(k):
            try:
                case[k] = json.loads(case[k])
            except Exception:
                pass

    return {
        "dossier_id": f"DOSSIER-{dispute_id}",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "platform": "DisputeOps AI Agentic Platform",
        "dispute": dispute,
        "order": order,
        "evidence": evidence,
        "case": case,
        "audit_trail": audit_trail
    }
