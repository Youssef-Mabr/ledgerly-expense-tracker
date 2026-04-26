"""Test the updated PDF parser with dual-date extraction"""
import sys
sys.path.insert(0, '/home/user/project-coin-main/backend')

from app.services.pdf_service import extract_transactions_from_pdf
import json

# Read the PDF
with open('bank_statement.pdf', 'rb') as f:
    pdf_bytes = f.read()

# Parse transactions
transactions = extract_transactions_from_pdf(pdf_bytes)

print(f"\n✅ Extracted {len(transactions)} transactions:\n")
for i, txn in enumerate(transactions[:5], 1):
    print(f"{i}. Post Date: {txn.get('post_date'):10} | Trans Date: {txn.get('trans_date'):10} | {txn['description'][:35]:35} | RM {txn['amount']:8.2f}")

print(f"\n... and {len(transactions) - 5} more transactions")
print("\nFull JSON of first transaction:")
print(json.dumps(transactions[0], indent=2))
