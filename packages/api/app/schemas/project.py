from pydantic import BaseModel, Field
from typing import Any
import uuid
from datetime import datetime


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    scene_data: dict[str, Any] | None = None
    settings: dict[str, Any] | None = None
    thumbnail_url: str | None = None


class ProjectResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None
    thumbnail_url: str | None
    scene_data: dict[str, Any]
    settings: dict[str, Any]
    is_public: bool
    share_token: str | None
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    data: list[ProjectResponse]
    meta: dict[str, int]
