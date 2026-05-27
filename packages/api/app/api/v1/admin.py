from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.subscription import Subscription, PlanType
from app.models.project import Project
from app.models.estimate import Estimate
from app.models.ai_usage import AIUsageLog
from app.schemas.subscription import (
    AdminUserItem,
    AdminStatsResponse,
    AdminAIStatsDetail,
    AdminAIModelBreakdown,
)

router = APIRouter(prefix="/admin", tags=["admin"])

KRW_PER_USD = 1350


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not getattr(current_user, "is_superuser", False):
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user


@router.get("/stats", response_model=AdminStatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

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

    ai_calls_today = (
        await db.execute(
            select(func.count(AIUsageLog.id)).where(AIUsageLog.created_at >= today_start)
        )
    ).scalar() or 0
    ai_calls_month = (
        await db.execute(
            select(func.count(AIUsageLog.id)).where(AIUsageLog.created_at >= month_start)
        )
    ).scalar() or 0
    ai_cost_month_usd = float(
        (
            await db.execute(
                select(func.coalesce(func.sum(AIUsageLog.estimated_cost_usd), 0))
                .where(AIUsageLog.created_at >= month_start)
            )
        ).scalar() or 0
    )

    return AdminStatsResponse(
        total_users=total_users,
        active_subscriptions=active_subs,
        pro_users=pro_users,
        starter_users=starter_users,
        free_users=free_users,
        total_projects=total_projects,
        total_estimates=total_estimates,
        ai_calls_today=ai_calls_today,
        ai_calls_this_month=ai_calls_month,
        ai_cost_this_month_usd=round(ai_cost_month_usd, 4),
        ai_cost_this_month_krw=int(ai_cost_month_usd * KRW_PER_USD),
    )


@router.get("/ai-stats", response_model=AdminAIStatsDetail)
async def get_ai_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """최근 30일 AI 호출 통계 (일별 / 모델별 / 유저별)."""
    now = datetime.now(timezone.utc)
    since = now - timedelta(days=30)

    # 일별 호출 수 & 비용
    daily_rows = (
        await db.execute(
            select(
                func.date_trunc("day", AIUsageLog.created_at).label("day"),
                func.count(AIUsageLog.id).label("count"),
                func.coalesce(func.sum(AIUsageLog.estimated_cost_usd), 0).label("cost"),
            )
            .where(AIUsageLog.created_at >= since)
            .group_by(text("day"))
            .order_by(text("day"))
        )
    ).all()
    daily_calls = [
        {"date": str(r.day)[:10], "count": r.count, "cost_usd": round(float(r.cost), 6)}
        for r in daily_rows
    ]

    # 모델별 분석
    model_rows = (
        await db.execute(
            select(
                AIUsageLog.model,
                func.count(AIUsageLog.id).label("cnt"),
                func.coalesce(func.sum(AIUsageLog.estimated_cost_usd), 0).label("cost"),
                func.coalesce(func.sum(AIUsageLog.input_tokens), 0).label("in_tok"),
                func.coalesce(func.sum(AIUsageLog.output_tokens), 0).label("out_tok"),
            )
            .where(AIUsageLog.created_at >= since)
            .group_by(AIUsageLog.model)
        )
    ).all()
    model_breakdown = [
        AdminAIModelBreakdown(
            model=r.model,
            call_count=r.cnt,
            total_cost_usd=round(float(r.cost), 6),
            total_input_tokens=r.in_tok,
            total_output_tokens=r.out_tok,
        )
        for r in model_rows
    ]

    # 유저별 상위 10명
    top_rows = (
        await db.execute(
            select(
                AIUsageLog.user_id,
                func.count(AIUsageLog.id).label("credits"),
                func.coalesce(func.sum(AIUsageLog.estimated_cost_usd), 0).label("cost"),
            )
            .where(AIUsageLog.created_at >= since)
            .group_by(AIUsageLog.user_id)
            .order_by(text("cost DESC"))
            .limit(10)
        )
    ).all()
    top_users = []
    for r in top_rows:
        user = (await db.execute(select(User).where(User.id == r.user_id))).scalar_one_or_none()
        top_users.append({
            "user_id": str(r.user_id),
            "email": user.email if user else "unknown",
            "credits_used": r.credits,
            "cost_usd": round(float(r.cost), 6),
        })

    return AdminAIStatsDetail(
        daily_calls=daily_calls,
        model_breakdown=model_breakdown,
        top_users=top_users,
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
                full_name=getattr(u, "full_name", None) or getattr(u, "name", None) or u.email,
                plan=sub.plan if sub else "free",
                created_at=u.created_at,
            )
        )
    return items
