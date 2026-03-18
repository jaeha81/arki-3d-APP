import uuid
import enum
from sqlalchemy import String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from app.models.base import TimestampMixin


class PlanType(str, enum.Enum):
    free = "free"
    starter = "starter"
    pro = "pro"
    enterprise = "enterprise"


PLAN_LIMITS = {
    PlanType.free: {"credits_per_month": 5, "images_per_month": 2, "max_projects": 3},
    PlanType.starter: {"credits_per_month": 50, "images_per_month": 20, "max_projects": 10},
    PlanType.pro: {"credits_per_month": -1, "images_per_month": 100, "max_projects": -1},  # -1 = unlimited
    PlanType.enterprise: {"credits_per_month": -1, "images_per_month": -1, "max_projects": -1},
}

PLAN_PRICES = {  # 원/월
    PlanType.free: 0,
    PlanType.starter: 29000,
    PlanType.pro: 79000,
    PlanType.enterprise: 0,  # 협의
}


class Subscription(Base, TimestampMixin):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    plan: Mapped[PlanType] = mapped_column(String(20), nullable=False, default=PlanType.free)
    credits_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    images_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    credits_reset_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    stripe_customer_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    stripe_subscription_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    toss_customer_key: Mapped[str | None] = mapped_column(String(200), nullable=True)
    toss_billing_key: Mapped[str | None] = mapped_column(String(200), nullable=True)
