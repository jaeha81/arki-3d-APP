from __future__ import annotations

import uuid
from typing import TYPE_CHECKING
from sqlalchemy import String, Text, Boolean, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.base import TimestampMixin
from app.models.user import User

if TYPE_CHECKING:
    from app.models.project_version import ProjectVersion


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    scene_data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    settings: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    share_token: Mapped[str | None] = mapped_column(String(32), unique=True, nullable=True, index=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    owner: Mapped["User"] = relationship("User", backref="projects")
    versions: Mapped[list["ProjectVersion"]] = relationship(
        "ProjectVersion", back_populates="project", cascade="all, delete-orphan"
    )
