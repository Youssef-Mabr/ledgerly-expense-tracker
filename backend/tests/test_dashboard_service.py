import unittest

from app.services.dashboard_service import calculate_dashboard_totals


class TestDashboardService(unittest.TestCase):
    def test_calculate_dashboard_totals(self):
        incomes = [3000.0, 500.0]
        expenses = [
            (100.0, True),
            (250.0, False),
            (50.0, True),
        ]

        result = calculate_dashboard_totals(incomes, expenses)

        self.assertEqual(result["total_income"], 3500.0)
        self.assertEqual(result["total_expenses"], 400.0)
        self.assertEqual(result["claimed_total"], 150.0)
        self.assertEqual(result["unclaimed_total"], 250.0)
        self.assertEqual(result["net_balance"], 3100.0)


if __name__ == "__main__":
    unittest.main()
