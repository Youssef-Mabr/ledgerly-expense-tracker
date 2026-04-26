from pydantic import BaseModel


class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_balance: float
    claimed_total: float
    unclaimed_total: float
