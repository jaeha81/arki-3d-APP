from pydantic import BaseModel
import uuid


class MaterialResponse(BaseModel):
    id: uuid.UUID
    name: str
    category: str
    thumbnail_url: str | None
    texture_url: str | None
    color_hex: str | None
    is_free: bool
    sort_order: int

    model_config = {"from_attributes": True}
