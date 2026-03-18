from __future__ import annotations
import uuid
import enum
from sqlalchemy import String, Integer, Boolean, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
from app.models.base import TimestampMixin


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    done = "done"
    canceled = "canceled"
    failed = "failed"
    partial_canceled = "partial_canceled"


class PaymentMethod(str, enum.Enum):
    card = "card"
    virtual_account = "virtual_account"
    easy_pay = "easy_pay"
    bank_transfer = "bank_transfer"


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    order_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    order_name: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(String(20), nullable=False, default=PaymentStatus.pending)
    plan: Mapped[str] = mapped_column(String(20), nullable=False)

    payment_key: Mapped[str | None] = mapped_column(String(200), nullable=True, index=True)
    method: Mapped[str | None] = mapped_column(String(30), nullable=True)
    receipt_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    toss_raw: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
