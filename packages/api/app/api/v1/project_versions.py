import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.project_repo import ProjectRepository
from app.repositories.project_version_repo import ProjectVersionRepository
from app.schemas.project_version import ProjectVersionCreate, ProjectVersionResponse

router = APIRouter(prefix="/projects/{project_id}/versions", tags=["versions"])


async def _get_project_or_404(
    project_id: uuid.UUID,
    current_user: User,
    db: AsyncSession,
):
    repo = ProjectRepository(db)
    project = await repo.get_by_id(project_id, current_user.id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    return project


@router.post("", response_model=ProjectVersionResponse, status_code=status.HTTP_201_CREATED)
async def create_version(
    project_id: uuid.UUID,
    body: ProjectVersionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_project_or_404(project_id, current_user, db)

    version_repo = ProjectVersionRepository(db)
    version = await version_repo.create_version(project_id, body)

    # 자동저장이면 오래된 autosave 정리 (10개 초과 시 삭제)
    if body.is_autosave:
        await version_repo.delete_old_autosaves(project_id, keep_count=10)

    return ProjectVersionResponse.model_validate(version)


@router.get("", response_model=list[ProjectVersionResponse])
async def list_versions(
    project_id: uuid.UUID,
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_project_or_404(project_id, current_user, db)

    version_repo = ProjectVersionRepository(db)
    versions = await version_repo.get_versions(project_id, limit=limit)
    return [ProjectVersionResponse.model_validate(v) for v in versions]


@router.get("/{version_id}", response_model=ProjectVersionResponse)
async def get_version(
    project_id: uuid.UUID,
    version_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_project_or_404(project_id, current_user, db)

    version_repo = ProjectVersionRepository(db)
    version = await version_repo.get_version(project_id, version_id)
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Version not found"
        )
    return ProjectVersionResponse.model_validate(version)


@router.delete("/{version_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_version(
    project_id: uuid.UUID,
    version_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_project_or_404(project_id, current_user, db)

    version_repo = ProjectVersionRepository(db)
    version = await version_repo.get_version(project_id, version_id)
    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Version not found"
        )
    await version_repo.delete_version(version)
