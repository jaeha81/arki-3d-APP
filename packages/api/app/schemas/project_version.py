from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid


class ProjectVersionBase(BaseModel):
    name: Optional[str] = None
    floor_plan_data: dict[str, object]
    scene_metadata: Optional[dict[str, object]] = None
    is_autosave: bool = True


class ProjectVersionCreate(ProjectVersionBase):
    pass


class ProjectVersionResponse(ProjectVersionBase):
    id: uuid.UUID
    project_id: uuid.UUID
    version_number: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
