import unittest

from app.services.pdf_service import parse_transaction_lines


class TestPDFParser(unittest.TestCase):
    def test_parse_transaction_lines_filters_invalid_rows(self):
        lines = [
            "01/03 Grocery Store MYR 120.50",
            "02/03 REFUND SHOP CR 120.50",
            "Account Summary",
            "03/03 Online Subscription 45.90",
            "Subtotal 166.40",
            "04/03 Coffee 0.00",
            "Invalid line without date",
        ]

        result = parse_transaction_lines(lines)

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["date"], "01/03")
        self.assertEqual(result[0]["description"], "Grocery Store MYR")
        self.assertEqual(result[0]["amount"], 120.50)
        self.assertEqual(result[1]["date"], "03/03")
        self.assertEqual(result[1]["amount"], 45.90)


if __name__ == "__main__":
    unittest.main()
