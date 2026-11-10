import unittest
import sys
import os
from starlette.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app
from app.seed_data import seed_database

class TestAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_database()
        cls.client = TestClient(app)

    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["app"], "DisputeOps AI")

    def test_list_disputes(self):
        response = self.client.get("/api/disputes")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(len(data), 4)

    def test_get_dispute_details(self):
        response = self.client.get("/api/disputes/PP-D-839210-INR")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("dispute", data)
        self.assertIn("order", data)

    def test_investigate_endpoint(self):
        response = self.client.post("/api/disputes/PP-D-839210-INR/investigate")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "SUCCESS")

    def test_analytics_endpoint(self):
        response = self.client.get("/api/analytics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("total_disputes", data)
        self.assertIn("carrier_performance", data)

if __name__ == "__main__":
    unittest.main()
