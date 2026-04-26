from enum import Enum

from sqlalchemy import Column, Date, Enum as SqlEnum, Float, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class ProjectStatus(str, Enum):
    active = "active"
    on_hold = "on_hold"
    closed = "closed"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    budget = Column(Float, nullable=True)
    status = Column(SqlEnum(ProjectStatus), nullable=False, default=ProjectStatus.active)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)

    expenses = relationship(
        "Expense",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    incomes = relationship(
        "Income",
        back_populates="project",
        cascade="all, delete-orphan",
    )
