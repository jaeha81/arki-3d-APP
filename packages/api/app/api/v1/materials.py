import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.repositories.material_repo import MaterialRepository
from app.schemas.material import MaterialResponse

router = APIRouter()


@router.get("", response_model=dict)
async def list_materials(
    category: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    repo = MaterialRepository(db)
    materials = await repo.list_materials(category=category)
    return {"data": [MaterialResponse.model_validate(m) for m in materials]}


@router.get("/{material_id}", response_model=dict)
async def get_material(material_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = MaterialRepository(db)
    material = await repo.get_by_id(material_id)
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"data": MaterialResponse.model_validate(material)}
