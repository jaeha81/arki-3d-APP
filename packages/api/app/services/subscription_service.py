from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.subscription import Subscription, PlanType, PLAN_LIMITS
import uuid


async def get_or_create_subscription(db: AsyncSession, user_id: uuid.UUID) -> Subscription:
    result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
    sub = result.scalar_one_or_none()
    if not sub:
        sub = Subscription(user_id=user_id, plan=PlanType.free)
        db.add(sub)
        await db.commit()
        await db.refresh(sub)
    return sub


async def consume_credits(db: AsyncSession, user_id: uuid.UUID, amount: int) -> bool:
    """크레딧 소비. 한도 초과 시 False 반환"""
    sub = await get_or_create_subscription(db, user_id)
    limits = PLAN_LIMITS[PlanType(sub.plan)]
    credit_limit = limits["credits_per_month"]
    if credit_limit != -1 and sub.credits_used + amount > credit_limit:
        return False
    sub.credits_used += amount
    await db.commit()
    return True


async def upgrade_plan(db: AsyncSession, user_id: uuid.UUID, new_plan: str) -> Subscription:
    sub = await get_or_create_subscription(db, user_id)
    sub.plan = PlanType(new_plan)
    await db.commit()
    await db.refresh(sub)
    return sub


def get_credits_remaining(sub: Subscription) -> int:
    limits = PLAN_LIMITS[PlanType(sub.plan)]
    limit = limits["credits_per_month"]
    if limit == -1:
        return -1
    return max(0, limit - sub.credits_used)


def get_images_remaining(sub: Subscription) -> int:
    limits = PLAN_LIMITS[PlanType(sub.plan)]
    limit = limits["images_per_month"]
    if limit == -1:
        return -1
    return max(0, limit - sub.images_used)
