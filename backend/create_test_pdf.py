import os
import sys
from datetime import datetime

# Add backend to path
sys.path.insert(0, r"c:\Users\user\Downloads\project-coin-main\project-coin-main\backend")

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
except ImportError:
    print("Installing reportlab...")
    os.system("pip install reportlab")
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter

# Create PDF
pdf_path = r"c:\Users\user\Downloads\project-coin-main\project-coin-main\backend\test_statement.pdf"
c = canvas.Canvas(pdf_path, pagesize=letter)
c.setFont("Helvetica", 12)

# Header
c.drawString(50, 750, "MAYBANK CREDIT CARD STATEMENT")
c.drawString(50, 730, "September 2024")

# Column headers
y = 700
c.drawString(50, y, "Date")
c.drawString(100, y, "Description")
c.drawString(350, y, "Amount (MYR)")

y -= 20
c.drawString(50, y, "-" * 80)

# Sample transactions (mixing valid and invalid)
transactions = [
    ("01/09", "GRAB MALAYSIA SDN BHD", "42.50"),
    ("02/09", "STARBUCKS PAVILION KL", "18.90"),
    ("03/09", "AMAZON WEB SERVICES", "456.78"),
    ("04/09", "REFUND COFFEE SHOP", "25.00 CR"),  # This is CR (credit) - should ignore
    ("05/09", "TOUCH N GO RELOAD", "100.00"),
    ("06/09", "FOODPANDA", "67.45"),
    ("Account Summary", "", ""),  # Should ignore
    ("Subtotal brought forward", "", "711.63"),  # Should ignore
    ("07/09", "LAZADA MALAYSIA", "234.56"),
    ("08/09", "DELL MALAYSIA SDN BHD", "1899.00"),
    ("Total transactions", "", "3244.82"),  # Should ignore
]

for trans in transactions:
    y -= 20
    if len(trans) == 3:
        c.drawString(50, y, trans[0])
        c.drawString(100, y, trans[1])
        c.drawString(350, y, trans[2])

# Footer
y -= 40
c.drawString(50, y, "Balance carried forward: RM 3,244.82")

c.save()
print(f"✅ Test PDF created: {pdf_path}")
