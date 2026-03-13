from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EstimateItemSchema(BaseModel):
    id: str
    category: str
    name: str
    quantity: float
    unit: str
    unit_price: int
    total_price: int

    model_config = {"from_attributes": True}


class EstimateResponse(BaseModel):
    id: str
    project_id: str
    name: str
    material_cost: int
    labor_cost: int
    margin_rate: float
    total_cost: int
    items: list[EstimateItemSchema]
    created_at: datetime

    model_config = {"from_attributes": True}


class EstimateCreate(BaseModel):
    project_id: str
    name: str = "견적서"
    scene_data: dict  # FloorPlan + 가구 배치 데이터


class PriceCatalogItem(BaseModel):
    id: str
    category: str
    name: str
    unit: str
    unit_price: int

    model_config = {"from_attributes": True}


class ShareLinkResponse(BaseModel):
    token: str
    url: str
    project_id: str
    is_active: bool
    view_count: int

    model_config = {"from_attributes": True}
