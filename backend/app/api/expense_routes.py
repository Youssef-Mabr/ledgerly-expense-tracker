from typing import Union
from datetime import date

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.expense import (
    ExpenseBulkClaimUpdate,
    ExpenseClaimUpdate,
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate,
)
from app.services.expense_service import ExpenseService

router = APIRouter(tags=["expenses"])


@router.get("/expenses", response_model=list[ExpenseResponse])
def get_expenses(
    project_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    category: str | None = None,
    claim_status: str | None = None,
    db: Session = Depends(get_db),
):
    return ExpenseService.list_expenses(
        db,
        project_id=project_id,
        from_date=from_date,
        to_date=to_date,
        category=category,
        claim_status=claim_status,
    )


@router.delete("/expenses")
def delete_expenses(
    project_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    category: str | None = None,
    claim_status: str | None = None,
    db: Session = Depends(get_db),
):
    deleted = ExpenseService.delete_expenses(
        db,
        project_id=project_id,
        from_date=from_date,
        to_date=to_date,
        category=category,
        claim_status=claim_status,
    )
    return {"deleted": deleted}


@router.post("/expenses", response_model=Union[ExpenseResponse, list[ExpenseResponse]])
def create_expense(
    payload: Union[ExpenseCreate, list[ExpenseCreate]],
    db: Session = Depends(get_db),
):
    if isinstance(payload, list):
        return ExpenseService.create_expenses(db, payload)
    return ExpenseService.create_expense(db, payload)


@router.get("/expenses/{expense_id}", response_model=ExpenseResponse)
def get_expense(expense_id: int, db: Session = Depends(get_db)):
    return ExpenseService.get_expense(db, expense_id)


@router.patch("/expenses/{expense_id}", response_model=ExpenseResponse)
def patch_expense(expense_id: int, payload: ExpenseUpdate, db: Session = Depends(get_db)):
    return ExpenseService.update_expense(db, expense_id, payload)


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    ExpenseService.delete_expense(db, expense_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/expenses/{expense_id}/claim", response_model=ExpenseResponse)
def patch_expense_claim(
    expense_id: int,
    payload: ExpenseClaimUpdate,
    db: Session = Depends(get_db),
):
    return ExpenseService.toggle_claim_status(db, expense_id, payload.is_claimed)


@router.patch("/expenses/claim/bulk", response_model=list[ExpenseResponse])
def patch_expense_claim_bulk(payload: ExpenseBulkClaimUpdate, db: Session = Depends(get_db)):
    return ExpenseService.toggle_claim_status_bulk(db, payload.expense_ids, payload.is_claimed)
