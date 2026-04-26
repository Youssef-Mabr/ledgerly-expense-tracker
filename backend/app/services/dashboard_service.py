from collections.abc import Sequence

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.income import Income


def calculate_dashboard_totals(
    income_amounts: Sequence[float],
    expenses: Sequence[tuple[float, bool]],
) -> dict[str, float]:
    total_income = float(sum(income_amounts))
    total_expenses = float(sum(amount for amount, _ in expenses))
    claimed_total = float(sum(amount for amount, is_claimed in expenses if is_claimed))
    unclaimed_total = float(
        sum(amount for amount, is_claimed in expenses if not is_claimed)
    )
    net_balance = total_income - total_expenses

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net_balance": net_balance,
        "claimed_total": claimed_total,
        "unclaimed_total": unclaimed_total,
    }


class DashboardService:
    @staticmethod
    def get_summary(db: Session, project_id: int | None = None) -> dict[str, float]:
        income_query = db.query(func.coalesce(func.sum(Income.amount), 0.0))
        expense_query = db.query(Expense.amount, Expense.is_claimed)

        if project_id is not None:
            income_query = income_query.filter(Income.project_id == project_id)
            expense_query = expense_query.filter(Expense.project_id == project_id)

        total_income = float(income_query.scalar() or 0.0)
        expense_rows = [(float(amount), bool(is_claimed)) for amount, is_claimed in expense_query]

        return calculate_dashboard_totals([total_income], expense_rows)
