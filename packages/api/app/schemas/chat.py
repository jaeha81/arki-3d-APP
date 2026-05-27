from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime
import uuid


class FurnishObject(BaseModel):
    assetId: str
    name: Optional[str] = None
    position: dict[str, float]
    rotation: dict[str, float]
    scale: Optional[dict[str, float]] = None


class MaterialChange(BaseModel):
    target: str
    materialId: str


class FurnishVariant(BaseModel):
    name: str
    description: str
    objects: list[FurnishObject]
    materials: list[MaterialChange]
    estimated_cost: Optional[int] = None


class ColorSwatch(BaseModel):
    name: str
    hex: str
    usage: str


class ConceptProposal(BaseModel):
    concept_name: str
    mood: str
    color_palette: list[ColorSwatch]
    key_furniture: list[str]
    style_keywords: list[str]
    budget_range: Optional[dict[str, Any]] = None
    summary: str


class EstimateLineItem(BaseModel):
    category: str
    unit_price: Optional[int] = None
    estimated_qty: Optional[str] = None
    total: int


class EstimateDraft(BaseModel):
    room_type: str
    area_m2: Optional[float] = None
    breakdown: list[EstimateLineItem]
    subtotal: int
    margin_rate: float
    total: int
    notes: Optional[str] = None


class ConsultationSummary(BaseModel):
    title: str
    agreed_style: Optional[str] = None
    key_points: list[str]
    client_preferences: Optional[dict[str, Any]] = None
    estimate_draft: Optional[EstimateDraft] = None
    next_actions: list[str]
    summary_text: str


class ChatAction(BaseModel):
    type: str
    variants: Optional[list[FurnishVariant]] = None
    images: Optional[list[str]] = None
    concept: Optional[ConceptProposal] = None
    estimate_draft: Optional[EstimateDraft] = None


class MessageRequest(BaseModel):
    project_id: str
    message: str
    attachments: Optional[list[dict[str, Any]]] = None
    floor_plan_data: Optional[dict[str, Any]] = None


class MessageResponse(BaseModel):
    reply: str
    intent: str
    actions: list[ChatAction]
    images: list[str]
    estimate: Optional[dict[str, Any]] = None
    credits_used: int
    credits_remaining: int
    message_id: str
    cached: bool = False  # Phase 4: 캐시 히트 시 true, 크레딧 소비 없음


class ChatHistoryItem(BaseModel):
    id: str
    role: str
    content: str
    intent: Optional[str] = None
    actions_data: Optional[dict[str, Any]] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class ConsultationSummaryResponse(BaseModel):
    summary: ConsultationSummary
    credits_used: int
    credits_remaining: int
