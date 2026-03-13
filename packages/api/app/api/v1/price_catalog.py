from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.estimate import PriceCatalog
from app.schemas.estimate import PriceCatalogItem
from pydantic import BaseModel

router = APIRouter(prefix="/price-catalog", tags=["price-catalog"])


class PriceCatalogCreate(BaseModel):
    category: str
    name: str
    unit: str
    unit_price: int


@router.get("/", response_model=list[PriceCatalogItem])
async def list_prices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PriceCatalog).where(PriceCatalog.is_active == True)
    )
    return [
        PriceCatalogItem(
            id=str(p.id),
            category=p.category,
            name=p.name,
            unit=p.unit,
            unit_price=p.unit_price,
        )
        for p in result.scalars().all()
    ]


@router.post("/", response_model=PriceCatalogItem)
async def create_price(
    body: PriceCatalogCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = PriceCatalog(
        category=body.category,
        name=body.name,
        unit=body.unit,
        unit_price=body.unit_price,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return PriceCatalogItem(
        id=str(item.id),
        category=item.category,
        name=item.name,
        unit=item.unit,
        unit_price=item.unit_price,
    )
