from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.repositories.asset_repo import AssetCategoryRepository
from app.schemas.asset import AssetCategoryResponse

router = APIRouter()


@router.get("", response_model=list[AssetCategoryResponse])
async def list_asset_categories(db: AsyncSession = Depends(get_db)):
    repo = AssetCategoryRepository(db)
    categories = await repo.get_all_tree()
    return categories
