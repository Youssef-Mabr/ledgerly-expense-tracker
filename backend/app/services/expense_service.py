from datetime import date
from typing import Iterable

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.expense import Expense
from app.models.project import Project
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


class ExpenseService:
    @staticmethod
    def list_expenses(
        db: Session,
        project_id: int | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
        category: str | None = None,
        claim_status: str | None = None,
    ) -> list[Expense]:
        query = db.query(Expense)
        if project_id is not None:
            query = query.filter(Expense.project_id == project_id)
        if from_date is not None:
            query = query.filter(Expense.date >= from_date)
        if to_date is not None:
            query = query.filter(Expense.date <= to_date)
        if category:
            query = query.filter(Expense.category == category)
        if claim_status == "claimed":
            query = query.filter(Expense.is_claimed.is_(True))
        elif claim_status == "unclaimed":
            query = query.filter(Expense.is_claimed.is_(False))
        return query.order_by(Expense.date.desc(), Expense.id.desc()).all()

    @staticmethod
    def delete_expenses(
        db: Session,
        project_id: int | None = None,
        from_date: date | None = None,
        to_date: date | None = None,
        category: str | None = None,
        claim_status: str | None = None,
    ) -> int:
        query = db.query(Expense)
        if project_id is not None:
            query = query.filter(Expense.project_id == project_id)
        if from_date is not None:
            query = query.filter(Expense.date >= from_date)
        if to_date is not None:
            query = query.filter(Expense.date <= to_date)
        if category:
            query = query.filter(Expense.category == category)
        if claim_status == "claimed":
            query = query.filter(Expense.is_claimed.is_(True))
        elif claim_status == "unclaimed":
            query = query.filter(Expense.is_claimed.is_(False))

        deleted = query.delete(synchronize_session=False)
        db.commit()
        return deleted

    @staticmethod
    def get_expense(db: Session, expense_id: int) -> Expense:
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found",
            )
        return expense

    @staticmethod
    def create_expense(db: Session, payload: ExpenseCreate) -> Expense:
        ExpenseService._validate_project(db, payload.project_id)
        if ExpenseService._is_duplicate(db, payload):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Duplicate expense detected",
            )
        expense = Expense(**payload.model_dump())
        db.add(expense)
        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def create_expenses(db: Session, payloads: list[ExpenseCreate]) -> list[Expense]:
        if not payloads:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Expense list cannot be empty",
            )

        for payload in payloads:
            ExpenseService._validate_project(db, payload.project_id)

        dedupe_keys: set[tuple] = set()
        expenses: list[Expense] = []

        for payload in payloads:
            key = ExpenseService._dedupe_key(
                payload.project_id,
                payload.date,
                payload.description,
                payload.amount,
            )
            if key in dedupe_keys:
                continue
            dedupe_keys.add(key)

            if ExpenseService._is_duplicate(db, payload):
                continue

            expenses.append(Expense(**payload.model_dump()))

        if not expenses:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No new expenses to import (all detected as duplicates)",
            )

        db.add_all(expenses)
        db.commit()
        for expense in expenses:
            db.refresh(expense)
        return expenses

    @staticmethod
    def update_expense(db: Session, expense_id: int, payload: ExpenseUpdate) -> Expense:
        expense = ExpenseService.get_expense(db, expense_id)
        updates = payload.model_dump(exclude_unset=True)

        if "project_id" in updates and updates["project_id"] is not None:
            ExpenseService._validate_project(db, updates["project_id"])

        if "is_claimed" in updates and updates["is_claimed"] is not None:
            is_claimed = updates["is_claimed"]
            if is_claimed and not updates.get("claimed_date"):
                updates["claimed_date"] = date.today()
            if not is_claimed:
                updates["claimed_date"] = None

        for key, value in updates.items():
            setattr(expense, key, value)

        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def delete_expense(db: Session, expense_id: int) -> None:
        expense = ExpenseService.get_expense(db, expense_id)
        db.delete(expense)
        db.commit()

    @staticmethod
    def toggle_claim_status(db: Session, expense_id: int, is_claimed: bool) -> Expense:
        expense = ExpenseService.get_expense(db, expense_id)

        expense.is_claimed = is_claimed
        expense.claimed_date = date.today() if is_claimed else None
        db.commit()
        db.refresh(expense)
        return expense

    @staticmethod
    def toggle_claim_status_bulk(
        db: Session,
        expense_ids: Iterable[int],
        is_claimed: bool,
    ) -> list[Expense]:
        ids = list(dict.fromkeys(expense_ids))
        if not ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="expense_ids cannot be empty",
            )

        expenses = db.query(Expense).filter(Expense.id.in_(ids)).all()
        if len(expenses) != len(ids):
            found_ids = {expense.id for expense in expenses}
            missing = [expense_id for expense_id in ids if expense_id not in found_ids]
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Expenses not found: {missing}",
            )

        claimed_date = date.today() if is_claimed else None
        for expense in expenses:
            expense.is_claimed = is_claimed
            expense.claimed_date = claimed_date

        db.commit()
        for expense in expenses:
            db.refresh(expense)
        return expenses

    @staticmethod
    def _validate_project(db: Session, project_id: int) -> None:
        project_exists = db.query(Project.id).filter(Project.id == project_id).first()
        if not project_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with id={project_id} not found",
            )

    @staticmethod
    def _dedupe_key(project_id: int, txn_date: date, description: str, amount: float) -> tuple:
        return (
            int(project_id),
            txn_date.isoformat(),
            " ".join(description.lower().split()),
            round(float(amount), 2),
        )

    @staticmethod
    def _is_duplicate(db: Session, payload: ExpenseCreate) -> bool:
        key = ExpenseService._dedupe_key(
            payload.project_id,
            payload.date,
            payload.description,
            payload.amount,
        )

        candidates = (
            db.query(Expense)
            .filter(
                Expense.project_id == payload.project_id,
                Expense.date == payload.date,
                Expense.amount == round(float(payload.amount), 2),
            )
            .all()
        )

        for candidate in candidates:
            candidate_key = ExpenseService._dedupe_key(
                candidate.project_id,
                candidate.date,
                candidate.description,
                candidate.amount,
            )
            if candidate_key == key:
                return True

        return False
