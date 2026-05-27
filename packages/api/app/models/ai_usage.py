import uuid
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from app.models.base import TimestampMixin


class AIUsageLog(Base, TimestampMixin):
    """사용자별 AI 호출 이력 — 비용 추적 및 크레딧 차감에 사용된다."""
    __tablename__ = "ai_usage_logs"
    __table_args__ = (
        Index("ix_ai_usage_user_created", "user_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    request_type: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(80), nullable=False)
    input_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    estimated_cost_usd: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    credits_charged: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    cached: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    project_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
