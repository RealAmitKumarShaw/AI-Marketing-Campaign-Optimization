"""
Integration & API Test Suite
Member 4: Optimization, Recommendation & Web Dashboard
AI Marketing Campaign Optimization
"""

import unittest
import json
from app import app
from src.dataset_analytics import get_sample_campaign


class TestMarketingCampaignPlatform(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config["TESTING"] = True
        cls.client = app.test_client()

    def test_01_web_pages(self):
        """Verify all HTML template pages render successfully with status 200."""
        pages = ["/", "/optimizer", "/revenue", "/conversion", "/roi", "/comparison", "/what-if", "/reports"]
        for p in pages:
            res = self.client.get(p)
            self.assertEqual(res.status_code, 200, f"Page {p} returned status {res.status_code}")
            self.assertIn(b"AdVantage", res.data, f"Page {p} missing layout branding")

    def test_02_api_health(self):
        """Verify GET /api/health returns healthy and lists all 4 models."""
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("models", data)
        self.assertIn("roi_model", data["models"])
        self.assertIn("revenue_model", data["models"])
        self.assertIn("conversion_model", data["models"])
        self.assertIn("success_model", data["models"])

    def test_03_api_campaign_options(self):
        """Verify GET /api/campaign-options returns dataset categories."""
        res = self.client.get("/api/campaign-options")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "success")
        opts = data["options"]
        self.assertIn("platform", opts)
        self.assertIn("Facebook", opts["platform"])
        self.assertIn("campaign_objective", opts)

    def test_04_api_dashboard_overview(self):
        """Verify GET /api/dashboard-overview returns KPIs and historical charts."""
        res = self.client.get("/api/dashboard-overview")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()["data"]
        self.assertIn("kpis", data)
        self.assertGreater(data["kpis"]["total_campaigns"], 0)
        self.assertGreater(data["kpis"]["avg_revenue"], 0)
        self.assertIn("channel_performance", data)
        self.assertIn("recent_campaigns", data)

    def test_05_api_predict(self):
        """Verify POST /api/predict executes all 4 ML models on valid input."""
        sample = get_sample_campaign("standard")
        res = self.client.post("/api/predict", json=sample)
        self.assertEqual(res.status_code, 200)
        pred = res.get_json()["prediction"]
        self.assertIn("predicted_roi", pred)
        self.assertIn("predicted_revenue", pred)
        self.assertIn("predicted_conversions", pred)
        self.assertIn("success_probability", pred)
        self.assertIn("₹", pred["predicted_revenue_formatted"])

    def test_06_api_optimize(self):
        """Verify POST /api/optimize evaluates candidates and ranks recommendations."""
        sample = get_sample_campaign("standard")
        res = self.client.post("/api/optimize", json={"campaign": sample, "priority": "balanced"})
        self.assertEqual(res.status_code, 200)
        opt = res.get_json()["optimization"]
        self.assertIn("recommended", opt)
        self.assertIn("baseline", opt)
        self.assertIn("deltas", opt)
        self.assertIn("explainability", opt)
        self.assertGreaterEqual(opt["recommended"]["composite_score"], 0)

    def test_07_api_what_if(self):
        """Verify POST /api/what-if computes exact comparative deltas."""
        cur = get_sample_campaign("standard")
        prop = get_sample_campaign("ecommerce")
        res = self.client.post("/api/what-if", json={"current": cur, "proposed": prop})
        self.assertEqual(res.status_code, 200)
        analysis = res.get_json()["analysis"]
        self.assertIn("deltas", analysis)
        self.assertIn("roi", analysis["deltas"])
        self.assertIn("verdict", analysis)

    def test_08_api_compare(self):
        """Verify POST /api/compare handles multi-campaign comparison and highlights winner."""
        c1 = get_sample_campaign("standard")
        c2 = get_sample_campaign("ecommerce")
        res = self.client.post("/api/compare", json={"campaigns": [c1, c2]})
        self.assertEqual(res.status_code, 200)
        comp = res.get_json()["comparison"]
        self.assertEqual(len(comp["campaigns"]), 2)
        self.assertIn(comp["recommended_index"], [0, 1])
        self.assertIn("chart_data", comp)


if __name__ == "__main__":
    unittest.main()
