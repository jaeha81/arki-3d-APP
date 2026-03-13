from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.subscription import Subscription, PlanType
from app.models.project import Project
from app.models.estimate import Estimate
from app.schemas.subscription import AdminUserItem, AdminStatsResponse

router = APIRouter(prefix="/admin", tags=["admin"])


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """is_superuser 체크"""
    if not getattr(current_user, 'is_superuser', False):
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user


@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active_subs = (
        await db.execute(
            select(func.count(Subscription.id)).where(Subscription.is_active == True)
        )
    ).scalar() or 0
    pro_users = (
        await db.execute(
            select(func.count(Subscription.id)).where(Subscription.plan == PlanType.pro)
        )
    ).scalar() or 0
    starter_users = (
        await db.execute(
            select(func.count(Subscription.id)).where(Subscription.plan == PlanType.starter)
        )
    ).scalar() or 0
    free_users = (
        await db.execute(
            select(func.count(Subscription.id)).where(Subscription.plan == PlanType.free)
        )
    ).scalar() or 0
    total_projects = (await db.execute(select(func.count(Project.id)))).scalar() or 0
    total_estimates = (await db.execute(select(func.count(Estimate.id)))).scalar() or 0

    return AdminStatsResponse(
        total_users=total_users,
        active_subscriptions=active_subs,
        pro_users=pro_users,
        starter_users=starter_users,
        free_users=free_users,
        total_projects=total_projects,
        total_estimates=total_estimates,
    )


@router.get("/users", response_model=list[AdminUserItem])
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
    limit: int = 50,
    offset: int = 0,
):
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).limit(limit).offset(offset)
    )
    users = result.scalars().all()

    items = []
    for u in users:
        sub_result = await db.execute(
            select(Subscription).where(Subscription.user_id == u.id)
        )
        sub = sub_result.scalar_one_or_none()
        items.append(
            AdminUserItem(
                id=str(u.id),
                email=u.email,
                full_name=getattr(u, 'full_name', None) or getattr(u, 'name', None) or u.email,
                plan=sub.plan if sub else "free",
                created_at=u.created_at,
            )
        )
    return items
