import uuid
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project_version import ProjectVersion
from app.schemas.project_version import ProjectVersionCreate


class ProjectVersionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_version(
        self, project_id: uuid.UUID, data: ProjectVersionCreate
    ) -> ProjectVersion:
        # 해당 project의 최대 version_number + 1
        result = await self.db.execute(
            select(func.max(ProjectVersion.version_number)).where(
                ProjectVersion.project_id == project_id
            )
        )
        max_version = result.scalar_one_or_none()
        next_version = (max_version or 0) + 1

        version = ProjectVersion(
            project_id=project_id,
            version_number=next_version,
            name=data.name,
            floor_plan_data=data.floor_plan_data,
            scene_metadata=data.scene_metadata,
            is_autosave=data.is_autosave,
        )
        self.db.add(version)
        await self.db.flush()
        await self.db.refresh(version)
        return version

    async def get_versions(
        self, project_id: uuid.UUID, limit: int = 20
    ) -> list[ProjectVersion]:
        result = await self.db.execute(
            select(ProjectVersion)
            .where(ProjectVersion.project_id == project_id)
            .order_by(ProjectVersion.version_number.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_version(
        self, project_id: uuid.UUID, version_id: uuid.UUID
    ) -> ProjectVersion | None:
        result = await self.db.execute(
            select(ProjectVersion).where(
                ProjectVersion.project_id == project_id,
                ProjectVersion.id == version_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_latest_version(self, project_id: uuid.UUID) -> ProjectVersion | None:
        result = await self.db.execute(
            select(ProjectVersion)
            .where(ProjectVersion.project_id == project_id)
            .order_by(ProjectVersion.version_number.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def delete_old_autosaves(
        self, project_id: uuid.UUID, keep_count: int = 10
    ) -> None:
        # 자동저장 목록을 최신순으로 조회
        result = await self.db.execute(
            select(ProjectVersion.id)
            .where(
                ProjectVersion.project_id == project_id,
                ProjectVersion.is_autosave == True,  # noqa: E712
            )
            .order_by(ProjectVersion.version_number.desc())
        )
        autosave_ids = [row[0] for row in result.fetchall()]

        # keep_count 초과분 삭제
        if len(autosave_ids) > keep_count:
            ids_to_delete = autosave_ids[keep_count:]
            await self.db.execute(
                delete(ProjectVersion).where(ProjectVersion.id.in_(ids_to_delete))
            )
            await self.db.flush()

    async def delete_version(self, version: ProjectVersion) -> None:
        await self.db.delete(version)
        await self.db.flush()
