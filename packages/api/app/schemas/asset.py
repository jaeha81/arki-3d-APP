from pydantic import BaseModel
import uuid


class AssetCategoryResponse(BaseModel):
    id: uuid.UUID
    parent_id: uuid.UUID | None
    name: str
    slug: str
    icon: str | None
    sort_order: int
    children: list["AssetCategoryResponse"] = []

    model_config = {"from_attributes": True}


AssetCategoryResponse.model_rebuild()


class AssetResponse(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID | None
    name: str
    slug: str
    description: str | None
    thumbnail_url: str | None
    model_url: str | None
    width_mm: int | None
    depth_mm: int | None
    height_mm: int | None
    style: str | None
    is_free: bool
    sort_order: int

    model_config = {"from_attributes": True, "protected_namespaces": ()}
