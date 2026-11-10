import unittest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.seed_data import seed_database
from app.agents.analyst import analyst_agent
from app.agents.collector import collector_agent
from app.agents.auditor import auditor_agent
from app.agents.resolution import resolution_agent
from app.agents.orchestrator import orchestrator

class TestAgents(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database()

    def test_analyst_agent_classification(self):
        dispute = {
            "dispute_id": "PP-TEST-ANALYST",
            "reason": "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
            "lifecycle_stage": "CHARGEBACK",
            "amount": 5000.0,
            "currency": "INR"
        }
        res = analyst_agent.run(dispute)
        self.assertEqual(res["classification"], "ITEM_NOT_RECEIVED")
        self.assertIn("Carrier Tracking Number", res["required_evidence"])

    def test_orchestrator_full_pipeline(self):
        res = orchestrator.run_investigation("PP-D-839210-INR")
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(len(res["trace"]), 4)
        self.assertEqual(res["auditor"]["confidence_score"], 100)
        self.assertEqual(res["resolution"]["recommended_action"], "CONTEST_DISPUTE")

    def test_tone_customization(self):
        res_standard = orchestrator.run_investigation("PP-D-839210-INR", tone="PAYPAL_STANDARD")
        self.assertIn("PayPal Dispute Resolution Team", res_standard["resolution"]["formal_statement"])

        res_legal = orchestrator.run_investigation("PP-D-839210-INR", tone="FIRM_LEGAL")
        self.assertIn("NOTICE OF CONTESTATION", res_legal["resolution"]["formal_statement"])

        res_customer = orchestrator.run_investigation("PP-D-839210-INR", tone="CUSTOMER_CENTRIC")
        self.assertIn("valued customer", res_customer["resolution"]["formal_statement"])

if __name__ == "__main__":
    unittest.main()
