from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.subscription import PLAN_PRICES, PLAN_LIMITS, PlanType
from app.schemas.subscription import SubscriptionResponse, PlanInfo, SubscriptionUpgradeRequest
from app.services.subscription_service import (
    get_or_create_subscription,
    upgrade_plan,
    get_credits_remaining,
    get_images_remaining,
)

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/me", response_model=SubscriptionResponse)
async def get_my_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = await get_or_create_subscription(db, current_user.id)
    return SubscriptionResponse(
        id=str(sub.id),
        user_id=str(sub.user_id),
        plan=sub.plan,
        credits_used=sub.credits_used,
        images_used=sub.images_used,
        credits_remaining=get_credits_remaining(sub),
        images_remaining=get_images_remaining(sub),
        is_active=sub.is_active,
    )


@router.get("/plans", response_model=list[PlanInfo])
async def get_plans():
    """요금제 목록"""
    return [
        PlanInfo(
            plan=plan.value,
            price=PLAN_PRICES[plan],
            credits_per_month=limits["credits_per_month"],
            images_per_month=limits["images_per_month"],
            max_projects=limits["max_projects"],
        )
        for plan, limits in PLAN_LIMITS.items()
    ]


@router.post("/upgrade", response_model=SubscriptionResponse)
async def upgrade_subscription(
    body: SubscriptionUpgradeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """요금제 업그레이드 (Stripe 연동은 stub — payment_method_id 수신만)"""
    sub = await upgrade_plan(db, current_user.id, body.plan)
    return SubscriptionResponse(
        id=str(sub.id),
        user_id=str(sub.user_id),
        plan=sub.plan,
        credits_used=sub.credits_used,
        images_used=sub.images_used,
        credits_remaining=get_credits_remaining(sub),
        images_remaining=get_images_remaining(sub),
        is_active=sub.is_active,
    )
