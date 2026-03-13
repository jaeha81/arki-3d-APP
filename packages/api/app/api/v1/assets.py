import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.repositories.asset_repo import AssetRepository
from app.schemas.asset import AssetResponse

router = APIRouter()


@router.get("", response_model=dict)
async def list_assets(
    category_id: uuid.UUID | None = Query(default=None),
    search: str | None = Query(default=None),
    style: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    repo = AssetRepository(db)
    assets = await repo.list_assets(category_id=category_id, search=search, style=style, skip=skip, limit=limit)
    return {"data": [AssetResponse.model_validate(a) for a in assets]}


@router.get("/{asset_id}", response_model=dict)
async def get_asset(asset_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    repo = AssetRepository(db)
    asset = await repo.get_by_id(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"data": AssetResponse.model_validate(asset)}
