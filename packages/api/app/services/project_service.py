import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.project_repo import ProjectRepository
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    def __init__(self, db: AsyncSession):
        self.repo = ProjectRepository(db)

    async def list_projects(
        self, user_id: uuid.UUID, skip: int = 0, limit: int = 50
    ) -> tuple[list[Project], int]:
        return await self.repo.list_by_user(user_id, skip=skip, limit=limit)

    async def get_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> Project | None:
        return await self.repo.get_by_id(project_id, user_id)

    async def create_project(self, user_id: uuid.UUID, data: ProjectCreate) -> Project:
        return await self.repo.create(
            user_id=user_id,
            name=data.name,
            description=data.description,
        )

    async def update_project(
        self, project_id: uuid.UUID, user_id: uuid.UUID, data: ProjectUpdate
    ) -> Project | None:
        project = await self.repo.get_by_id(project_id, user_id)
        if not project:
            return None
        update_data = data.model_dump(exclude_unset=True)
        return await self.repo.update(project, **update_data)

    async def delete_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        project = await self.repo.get_by_id(project_id, user_id)
        if not project:
            return False
        await self.repo.delete(project)
        return True
