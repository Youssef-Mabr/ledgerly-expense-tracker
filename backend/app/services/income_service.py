from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.income import Income
from app.models.project import Project
from app.schemas.income import IncomeCreate, IncomeUpdate


class IncomeService:
    @staticmethod
    def list_income(db: Session, project_id: int | None = None) -> list[Income]:
        query = db.query(Income)
        if project_id is not None:
            query = query.filter(Income.project_id == project_id)
        return query.order_by(Income.date.desc(), Income.id.desc()).all()

    @staticmethod
    def delete_income_bulk(db: Session, project_id: int | None = None) -> int:
        query = db.query(Income)
        if project_id is not None:
            query = query.filter(Income.project_id == project_id)
        deleted = query.delete(synchronize_session=False)
        db.commit()
        return deleted

    @staticmethod
    def create_income(db: Session, payload: IncomeCreate) -> Income:
        IncomeService._validate_project(db, payload.project_id)
        income = Income(**payload.model_dump())
        db.add(income)
        db.commit()
        db.refresh(income)
        return income

    @staticmethod
    def get_income_by_id(db: Session, income_id: int) -> Income:
        income = db.query(Income).filter(Income.id == income_id).first()
        if not income:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Income record not found",
            )
        return income

    @staticmethod
    def update_income(db: Session, income_id: int, payload: IncomeUpdate) -> Income:
        income = IncomeService.get_income_by_id(db, income_id)
        updates = payload.model_dump(exclude_unset=True)

        if "project_id" in updates and updates["project_id"] is not None:
            IncomeService._validate_project(db, updates["project_id"])

        for key, value in updates.items():
            setattr(income, key, value)

        db.commit()
        db.refresh(income)
        return income

    @staticmethod
    def delete_income(db: Session, income_id: int) -> None:
        income = IncomeService.get_income_by_id(db, income_id)
        db.delete(income)
        db.commit()

    @staticmethod
    def _validate_project(db: Session, project_id: int) -> None:
        project_exists = db.query(Project.id).filter(Project.id == project_id).first()
        if not project_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with id={project_id} not found",
            )
