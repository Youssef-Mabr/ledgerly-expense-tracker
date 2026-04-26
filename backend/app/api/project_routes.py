from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.project_service import ProjectService

router = APIRouter(tags=["projects"])


@router.get("/projects", response_model=list[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return ProjectService.list_projects(db)


@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    return ProjectService.create_project(db, payload)


@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    return ProjectService.get_project(db, project_id)


@router.patch("/projects/{project_id}", response_model=ProjectResponse)
def patch_project(project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db)):
    return ProjectService.update_project(db, project_id, payload)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    ProjectService.delete_project(db, project_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
