import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.asset import Asset, AssetCategory


class AssetCategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_tree(self) -> list[AssetCategory]:
        # 루트 카테고리만 가져오고 children은 selectinload로 eager load
        result = await self.db.execute(
            select(AssetCategory)
            .where(AssetCategory.parent_id == None)  # noqa: E711
            .options(selectinload(AssetCategory.children))
            .order_by(AssetCategory.sort_order)
        )
        return list(result.scalars().all())


class AssetRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_assets(
        self,
        category_id: uuid.UUID | None = None,
        search: str | None = None,
        style: str | None = None,
        skip: int = 0,
        limit: int = 50,
    ) -> list[Asset]:
        stmt = select(Asset).order_by(Asset.sort_order)
        if category_id:
            stmt = stmt.where(Asset.category_id == category_id)
        if style:
            stmt = stmt.where(Asset.style == style)
        if search:
            stmt = stmt.where(Asset.name.ilike(f"%{search}%"))
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, asset_id: uuid.UUID) -> Asset | None:
        result = await self.db.execute(select(Asset).where(Asset.id == asset_id))
        return result.scalar_one_or_none()
