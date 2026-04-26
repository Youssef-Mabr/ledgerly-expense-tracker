"""Seed database with sample data for testing"""
import sys
import os
from datetime import date

# Set working directory to backend folder
os.chdir(r"c:\Users\user\Downloads\project-coin-main\project-coin-main\backend")
sys.path.insert(0, os.getcwd())

from app.db.session import SessionLocal, engine, Base
from app.models.project import Project, ProjectStatus
from app.models.expense import Expense
from app.models.income import Income

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Clear existing data
db.query(Expense).delete()
db.query(Income).delete()
db.query(Project).delete()
db.commit()

# Create projects
p1 = Project(
    name="Mayhill Bank Migration",
    description="Core banking platform replatform — phase 1.",
    start_date=date(2024, 4, 1),
    end_date=date(2024, 12, 31),
    budget=250000,
    status=ProjectStatus.active,
)
p2 = Project(
    name="KL Office Refit",
    description="Office expansion and furniture.",
    start_date=date(2024, 6, 1),
    budget=80000,
    status=ProjectStatus.active,
)
p3 = Project(
    name="Internal AI Tooling",
    description="Internal LLM workflows for ops team.",
    start_date=date(2024, 2, 15),
    budget=45000,
    status=ProjectStatus.on_hold,
)
p4 = Project(
    name="Q1 Marketing Campaign",
    budget=30000,
    status=ProjectStatus.closed,
    end_date=date(2024, 3, 31),
)

db.add_all([p1, p2, p3, p4])
db.flush()

# Create expenses
expenses_data = [
    (p1.id, date(2024, 9, 4), "Grab — KLIA to office", 78.5, "travel", True, date(2024, 9, 12), "stmt-2024-09.pdf"),
    (p1.id, date(2024, 9, 6), "AWS Services", 1240.9, "software", False, None, "stmt-2024-09.pdf"),
    (p1.id, date(2024, 9, 9), "Starbucks Pavilion", 42.0, "meals", True, date(2024, 9, 15), None),
    (p1.id, date(2024, 9, 14), "Dell Malaysia — Monitor", 1899.0, "equipment", False, None, None),
    (p1.id, date(2024, 9, 21), "MAS — KUL/SIN return", 1320.4, "travel", False, None, "stmt-2024-09.pdf"),
    (p2.id, date(2024, 9, 3), "IKEA Damansara", 4520.0, "equipment", True, date(2024, 9, 10), None),
    (p2.id, date(2024, 9, 11), "TNB — Office utility", 612.3, "office", False, None, None),
    (p2.id, date(2024, 9, 18), "Office cleaning", 350.0, "office", False, None, None),
    (p3.id, date(2024, 8, 22), "OpenAI — API credits", 980.6, "software", True, date(2024, 9, 1), None),
    (p3.id, date(2024, 8, 29), "Notion subscription", 96.0, "software", False, None, None),
    (p4.id, date(2024, 2, 14), "Meta Ads", 5200.0, "fees", True, date(2024, 3, 1), None),
    (p4.id, date(2024, 3, 2), "Photographer — Campaign", 2100.0, "fees", True, date(2024, 3, 15), None),
]

for project_id, exp_date, description, amount, category, is_claimed, claimed_date, source in expenses_data:
    expense = Expense(
        project_id=project_id,
        date=exp_date,
        description=description,
        amount=amount,
        category=category,
        is_claimed=is_claimed,
        claimed_date=claimed_date,
        source=source,
    )
    db.add(expense)

# Create income
income_data = [
    (p1.id, date(2024, 8, 30), "Client milestone 1 — Mayhill Bank", 95000),
    (p1.id, date(2024, 9, 28), "Client milestone 2 — Mayhill Bank", 65000),
    (p2.id, date(2024, 9, 15), "Internal capex allocation", 80000),
    (p4.id, date(2024, 3, 31), "Marketing budget reimbursement", 25000),
]

for project_id, inc_date, source, amount in income_data:
    income = Income(
        project_id=project_id,
        date=inc_date,
        source=source,
        amount=amount,
    )
    db.add(income)

db.commit()
print("✅ Database seeded with sample data!")

db.close()
