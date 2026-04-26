from datetime import date

from pydantic import BaseModel, ConfigDict

from app.models.project import ProjectStatus


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    budget: float | None = None
    status: ProjectStatus = ProjectStatus.active
    start_date: date | None = None
    end_date: date | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    budget: float | None = None
    status: ProjectStatus | None = None
    start_date: date | None = None
    end_date: date | None = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    budget: float | None
    status: ProjectStatus
    start_date: date | None
    end_date: date | None
