from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime
import uuid


class FurnishObject(BaseModel):
    assetId: str
    name: Optional[str] = None
    position: dict[str, float]  # {x, y, z}
    rotation: dict[str, float]  # {x, y, z}
    scale: Optional[dict[str, float]] = None  # {x, y, z}


class MaterialChange(BaseModel):
    target: str  # "room-1-floor" etc
    materialId: str


class FurnishVariant(BaseModel):
    name: str
    description: str
    objects: list[FurnishObject]
    materials: list[MaterialChange]
    estimated_cost: Optional[int] = None


class ChatAction(BaseModel):
    type: str  # "auto_furnish", "restyle_photo", etc
    variants: Optional[list[FurnishVariant]] = None
    images: Optional[list[str]] = None  # image URLs


class MessageRequest(BaseModel):
    project_id: str
    message: str
    attachments: Optional[list[dict[str, Any]]] = None
    floor_plan_data: Optional[dict[str, Any]] = None  # 현재 도면 데이터


class MessageResponse(BaseModel):
    reply: str
    intent: str
    actions: list[ChatAction]
    images: list[str]
    estimate: Optional[dict[str, Any]] = None
    credits_used: int
    credits_remaining: int
    message_id: str


class ChatHistoryItem(BaseModel):
    id: str
    role: str
    content: str
    intent: Optional[str] = None
    actions_data: Optional[dict[str, Any]] = None
    created_at: datetime
    model_config = {"from_attributes": True}
