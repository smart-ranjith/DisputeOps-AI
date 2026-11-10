import unittest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.rule_engine import rule_engine

class TestRuleEngine(unittest.TestCase):
    def test_item_not_received_with_pod_passes(self):
        dispute = {
            "dispute_id": "PP-D-TEST-1",
            "reason": "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
            "amount": 5000.0,
            "currency": "INR",
            "buyer_email": "test@example.com",
            "response_due_date": "2026-11-20T23:59:59Z"
        }
        order = {
            "order_id": "ORD-1",
            "transaction_id": "TXN-1",
            "amount": 5000.0,
            "currency": "INR",
            "customer_email": "test@example.com",
            "carrier": "BlueDart Express",
            "tracking_number": "BLD-123456",
            "delivery_status": "DELIVERED",
            "proof_of_delivery_url": "https://cdn.example.com/pod.pdf"
        }
        evidence_records = [
            {"category": "TRACKING_INFO", "title": "Tracking"},
            {"category": "PROOF_OF_DELIVERY", "title": "POD"}
        ]
        res = rule_engine.validate_case(dispute, order, evidence_records)
        self.assertEqual(res["verdict"], "HIGH_CONFIDENCE_CHALLENGE")
        self.assertEqual(len(res["gaps"]), 0)
        self.assertGreaterEqual(res["rule_score"], 80)

    def test_item_not_received_missing_pod_flags_gap(self):
        dispute = {
            "dispute_id": "PP-D-TEST-2",
            "reason": "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
            "amount": 3450.0,
            "currency": "INR",
            "buyer_email": "test@example.com",
            "response_due_date": "2026-11-20T23:59:59Z"
        }
        order = {
            "order_id": "ORD-2",
            "transaction_id": "TXN-2",
            "amount": 3450.0,
            "currency": "INR",
            "customer_email": "test@example.com",
            "carrier": "Delhivery",
            "tracking_number": "DLV-999",
            "delivery_status": "IN_TRANSIT",
            "proof_of_delivery_url": None
        }
        evidence_records = [
            {"category": "TRACKING_INFO", "title": "Tracking"}
        ]
        res = rule_engine.validate_case(dispute, order, evidence_records)
        self.assertIn("EVIDENCE_GAPS_DETECTED", [res["verdict"], "INSUFFICIENT_EVIDENCE_HIGH_RISK"])
        self.assertGreater(len(res["gaps"]), 0)

if __name__ == "__main__":
    unittest.main()
