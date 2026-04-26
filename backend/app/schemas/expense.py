from __future__ import annotations

import datetime as dt
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ExpenseCreate(BaseModel):
    project_id: int
    date: dt.date
    description: str
    amount: float
    category: Optional[str] = None
    is_claimed: bool = False
    claimed_date: Optional[dt.date] = None
    source: Optional[str] = None


class ExpenseClaimUpdate(BaseModel):
    is_claimed: bool


class ExpenseBulkClaimUpdate(BaseModel):
    expense_ids: list[int]
    is_claimed: bool


class ExpenseUpdate(BaseModel):
    project_id: Optional[int] = None
    date: Optional[dt.date] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    is_claimed: Optional[bool] = None
    claimed_date: Optional[dt.date] = None
    source: Optional[str] = None


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    date: dt.date
    description: str
    amount: float
    category: Optional[str]
    is_claimed: bool
    claimed_date: Optional[dt.date]
    source: Optional[str]
