from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    source = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)

    project = relationship("Project", back_populates="incomes")
