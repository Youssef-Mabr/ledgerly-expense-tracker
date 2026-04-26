from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.income import IncomeCreate, IncomeResponse, IncomeUpdate
from app.services.income_service import IncomeService

router = APIRouter(tags=["income"])


@router.get("/income", response_model=list[IncomeResponse])
def get_income(project_id: int | None = None, db: Session = Depends(get_db)):
    return IncomeService.list_income(db, project_id)


@router.delete("/income")
def delete_income_bulk(project_id: int | None = None, db: Session = Depends(get_db)):
    deleted = IncomeService.delete_income_bulk(db, project_id)
    return {"deleted": deleted}


@router.post("/income", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
def create_income(payload: IncomeCreate, db: Session = Depends(get_db)):
    return IncomeService.create_income(db, payload)


@router.get("/income/{income_id}", response_model=IncomeResponse)
def get_income_by_id(income_id: int, db: Session = Depends(get_db)):
    return IncomeService.get_income_by_id(db, income_id)


@router.patch("/income/{income_id}", response_model=IncomeResponse)
def patch_income(income_id: int, payload: IncomeUpdate, db: Session = Depends(get_db)):
    return IncomeService.update_income(db, income_id, payload)


@router.delete("/income/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(income_id: int, db: Session = Depends(get_db)):
    IncomeService.delete_income(db, income_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
