from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    @staticmethod
    def list_projects(db: Session) -> list[Project]:
        return db.query(Project).order_by(Project.id.desc()).all()

    @staticmethod
    def create_project(db: Session, payload: ProjectCreate) -> Project:
        project = Project(**payload.model_dump())
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def get_project(db: Session, project_id: int) -> Project:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )
        return project

    @staticmethod
    def update_project(db: Session, project_id: int, payload: ProjectUpdate) -> Project:
        project = ProjectService.get_project(db, project_id)
        updates = payload.model_dump(exclude_unset=True)
        for key, value in updates.items():
            setattr(project, key, value)
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def delete_project(db: Session, project_id: int) -> None:
        project = ProjectService.get_project(db, project_id)
        db.delete(project)
        db.commit()
