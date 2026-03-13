import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.estimate import Estimate, EstimateItem, ShareLink


class EstimateRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, estimate_id: uuid.UUID) -> Estimate | None:
        result = await self.db.execute(
            select(Estimate)
            .where(Estimate.id == estimate_id)
            .options(selectinload(Estimate.items))
        )
        return result.scalar_one_or_none()

    async def list_by_project(self, project_id: uuid.UUID, user_id: uuid.UUID) -> list[Estimate]:
        result = await self.db.execute(
            select(Estimate)
            .where(Estimate.project_id == project_id, Estimate.user_id == user_id)
            .options(selectinload(Estimate.items))
            .order_by(Estimate.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(
        self,
        project_id: uuid.UUID,
        user_id: uuid.UUID,
        name: str,
        material_cost: int,
        labor_cost: int,
        margin_rate: float,
        total_cost: int,
        scene_snapshot: dict | None,
        items: list[dict],
    ) -> Estimate:
        estimate = Estimate(
            project_id=project_id,
            user_id=user_id,
            name=name,
            material_cost=material_cost,
            labor_cost=labor_cost,
            margin_rate=margin_rate,
            total_cost=total_cost,
            scene_snapshot=scene_snapshot,
        )
        self.db.add(estimate)
        await self.db.flush()

        for item_data in items:
            item = EstimateItem(
                estimate_id=estimate.id,
                category=item_data["category"],
                name=item_data["name"],
                quantity=item_data["quantity"],
                unit=item_data["unit"],
                unit_price=item_data["unit_price"],
                total_price=item_data["total_price"],
            )
            self.db.add(item)

        await self.db.flush()
        await self.db.refresh(estimate)
        return estimate

    async def delete(self, estimate: Estimate) -> None:
        await self.db.delete(estimate)
        await self.db.flush()


class ShareLinkRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_project(self, project_id: uuid.UUID) -> ShareLink | None:
        result = await self.db.execute(
            select(ShareLink).where(
                ShareLink.project_id == project_id,
                ShareLink.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def get_by_token(self, token: str) -> ShareLink | None:
        result = await self.db.execute(
            select(ShareLink).where(
                ShareLink.token == token,
                ShareLink.is_active == True,  # noqa: E712
            )
        )
        return result.scalar_one_or_none()

    async def create(self, project_id: uuid.UUID, token: str) -> ShareLink:
        link = ShareLink(project_id=project_id, token=token)
        self.db.add(link)
        await self.db.flush()
        await self.db.refresh(link)
        return link

    async def increment_view_count(self, link: ShareLink) -> None:
        link.view_count += 1
        await self.db.flush()
