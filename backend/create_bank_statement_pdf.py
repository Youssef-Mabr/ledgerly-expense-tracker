"""Generate a realistic bank statement PDF with Post Date and Trans Date columns"""
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

doc = SimpleDocTemplate("bank_statement.pdf", pagesize=letter)
elements = []
styles = getSampleStyleSheet()

# Title
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=14,
    textColor=colors.HexColor('#8B0000'),
    spaceAfter=12
)
elements.append(Paragraph("Transaction Details", title_style))
elements.append(Spacer(1, 0.2*inch))

# Create table with actual data from the image
data = [
    ['Post Date', 'Trans Date', 'Transaction Description', 'Amount (RM)'],
    ['02/03', '01/03', 'TNG EWALLET RELOAD *VIA FPX', '150.00'],
    ['03/03', '02/03', 'GRAB *RIDE KUALA LUMPUR', '22.40'],
    ['04/03', '03/03', 'SHOPEE MALAYSIA SDN BHD', '189.90'],
    ['05/03', '04/03', 'AEON CO (M) BHD  MELAKA', '287.65'],
    ['06/03', '05/03', 'PETRONAS AYER KEROH', '120.00'],
    ['07/03', '06/03', 'TNB ELECTRICITY BILL PAYMENT', '245.80'],
    ['09/03', '08/03', 'STARBUCKS DATARAN PAHLAWAN', '28.50'],
    ['10/03', '09/03', 'PAYMENT - JOMPAY THANK YOU', '1,856.20 CR'],
    ['11/03', '10/03', 'LAZADA MALAYSIA SDN BHD', '95.40'],
    ['12/03', '11/03', 'PLUS HIGHWAY TOLL - AYER KEROH', '18.30'],
    ['13/03', '12/03', 'FOODPANDA *ORDER MELAKA', '37.85'],
    ['14/03', '13/03', 'NETFLIX.COM 0355226262', '55.00'],
    ['15/03', '14/03', 'ASTRO BYOND SUBSCRIPTION', '149.90'],
    ['17/03', '16/03', 'JAYA GROCER DATARAN PAHLAWAN', '312.48'],
    ['18/03', '17/03', 'SENHENG ELECTRIC MELAKA', '1,899.00'],
    ['19/03', '18/03', 'AMAZON WEB SERVICES AWS USD 95.20', '449.72'],
    ['19/03', '18/03', 'OVERSEAS TRANSACTION FEE 1%', '4.50'],
    ['20/03', '19/03', 'MAXIS POSTPAID BILL', '128.00'],
    ['22/03', '21/03', 'THE CHICKEN RICE SHOP MELAKA', '58.70'],
    ['23/03', '22/03', 'SHELL JALAN TUN PERAK KL', '110.00'],
    ['24/03', '23/03', 'MCDONALDS DRIVE-THRU MELAKA', '32.15'],
]

# Create table
table = Table(data, colWidths=[1.2*inch, 1.2*inch, 3*inch, 1.3*inch])

# Style the table
table.setStyle(TableStyle([
    # Header row styling
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8B0000')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    
    # Data rows
    ('ALIGN', (0, 1), (3, -1), 'LEFT'),
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, -1), 9),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5F5')]),
    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
    ('PADDING', (0, 0), (-1, -1), 8),
    
    # Right align amount column
    ('ALIGN', (3, 1), (3, -1), 'RIGHT'),
]))

elements.append(table)

# Build PDF
doc.build(elements)
print("✅ Bank statement PDF created: bank_statement.pdf")
