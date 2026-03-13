import secrets
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.estimate import ShareLink
from app.schemas.estimate import ShareLinkResponse

router = APIRouter(prefix="/share", tags=["share"])


@router.post("/{project_id}", response_model=ShareLinkResponse)
async def create_share_link(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ShareLinkResponse:
    """프로젝트 공유 링크 생성 (기존 링크 있으면 재활용)"""
    project_uuid = uuid.UUID(project_id)

    # 기존 활성 링크 조회
    result = await db.execute(
        select(ShareLink).where(
            ShareLink.project_id == project_uuid,
            ShareLink.is_active == True,  # noqa: E712
        )
    )
    link = result.scalar_one_or_none()

    if not link:
        token = secrets.token_urlsafe(24)[:32]
        link = ShareLink(project_id=project_uuid, token=token)
        db.add(link)
        await db.commit()
        await db.refresh(link)

    return ShareLinkResponse(
        token=link.token,
        url=f"/share/{link.token}",
        project_id=str(link.project_id),
        is_active=link.is_active,
        view_count=link.view_count,
    )


@router.get("/{token}")
async def get_shared_project(
    token: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """공유 링크로 프로젝트 데이터 조회 (인증 불필요)"""
    from app.models.project import Project

    result = await db.execute(
        select(ShareLink).where(
            ShareLink.token == token,
            ShareLink.is_active == True,  # noqa: E712
        )
    )
    link = result.scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=404, detail="Share link not found")

    proj_result = await db.execute(
        select(Project).where(Project.id == link.project_id)
    )
    project = proj_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 조회수 증가
    link.view_count += 1
    await db.commit()

    return {
        "project_id": str(project.id),
        "name": project.name,
        "scene_data": project.scene_data,
    }
