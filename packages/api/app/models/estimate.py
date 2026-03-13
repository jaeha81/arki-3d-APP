import uuid
from sqlalchemy import String, Text, Integer, Float, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.base import TimestampMixin


class PriceCatalog(Base, TimestampMixin):
    __tablename__ = "price_catalog"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # "flooring", "paint", "furniture", "labor"
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)  # "m²", "개", "식"
    unit_price: Mapped[int] = mapped_column(Integer, nullable=False)  # 원
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Estimate(Base, TimestampMixin):
    __tablename__ = "estimates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False, default="견적서")
    material_cost: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    labor_cost: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    margin_rate: Mapped[float] = mapped_column(Float, default=0.15, nullable=False)
    total_cost: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    scene_snapshot: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # 견적 생성 시 씬 데이터 snapshot

    items: Mapped[list["EstimateItem"]] = relationship(
        "EstimateItem", back_populates="estimate", cascade="all, delete-orphan"
    )


class EstimateItem(Base, TimestampMixin):
    __tablename__ = "estimate_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    estimate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("estimates.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    unit_price: Mapped[int] = mapped_column(Integer, nullable=False)
    total_price: Mapped[int] = mapped_column(Integer, nullable=False)

    estimate: Mapped["Estimate"] = relationship("Estimate", back_populates="items")


class ShareLink(Base, TimestampMixin):
    __tablename__ = "share_links"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
