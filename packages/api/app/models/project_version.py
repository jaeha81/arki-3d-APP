from __future__ import annotations

import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.project import Project


class ProjectVersion(Base, TimestampMixin):
    __tablename__ = "project_versions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    floor_plan_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    scene_metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_autosave: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    project: Mapped["Project"] = relationship("Project", back_populates="versions")
