import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.material import Material


class MaterialRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_materials(self, category: str | None = None) -> list[Material]:
        stmt = select(Material).order_by(Material.sort_order)
        if category:
            stmt = stmt.where(Material.category == category)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, material_id: uuid.UUID) -> Material | None:
        result = await self.db.execute(select(Material).where(Material.id == material_id))
        return result.scalar_one_or_none()
