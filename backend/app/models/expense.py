from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String(100), nullable=True)
    is_claimed = Column(Boolean, nullable=False, default=False)
    claimed_date = Column(Date, nullable=True)
    source = Column(String(255), nullable=True)

    project = relationship("Project", back_populates="expenses")
