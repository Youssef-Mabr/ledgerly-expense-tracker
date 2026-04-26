from __future__ import annotations

import datetime as dt
from typing import Optional

from pydantic import BaseModel, ConfigDict


class IncomeCreate(BaseModel):
    project_id: int
    date: dt.date
    source: str
    amount: float
    notes: Optional[str] = None


class IncomeUpdate(BaseModel):
    project_id: Optional[int] = None
    date: Optional[dt.date] = None
    source: Optional[str] = None
    amount: Optional[float] = None
    notes: Optional[str] = None


class IncomeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    date: dt.date
    source: str
    amount: float
    notes: Optional[str]
