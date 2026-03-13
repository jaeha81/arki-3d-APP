import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.estimate import Estimate, EstimateItem
from app.schemas.estimate import EstimateCreate, EstimateResponse
from app.services.estimate_engine import extract_bom, calculate_estimate
from app.services.pdf_generator import generate_estimate_pdf

router = APIRouter(prefix="/estimates", tags=["estimates"])


@router.post("/", response_model=EstimateResponse)
async def create_estimate(
    body: EstimateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Estimate:
    bom = extract_bom(body.scene_data)
    calc = calculate_estimate(bom)

    est = Estimate(
        project_id=uuid.UUID(body.project_id),
        user_id=current_user.id,
        name=body.name,
        material_cost=calc["material_cost"],
        labor_cost=calc["labor_cost"],
        margin_rate=calc["margin_rate"],
        total_cost=calc["total_cost"],
        scene_snapshot=body.scene_data,
    )
    db.add(est)
    await db.flush()

    for item_data in calc["items"]:
        item = EstimateItem(
            estimate_id=est.id,
            category=item_data["category"],
            name=item_data["name"],
            quantity=item_data["quantity"],
            unit=item_data["unit"],
            unit_price=item_data["unit_price"],
            total_price=item_data["total_price"],
        )
        db.add(item)

    await db.commit()
    await db.refresh(est)

    # items 관계 로드
    result = await db.execute(
        select(Estimate)
        .where(Estimate.id == est.id)
        .options(selectinload(Estimate.items))
    )
    return result.scalar_one()


@router.get("/{estimate_id}", response_model=EstimateResponse)
async def get_estimate(
    estimate_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Estimate:
    result = await db.execute(
        select(Estimate)
        .where(Estimate.id == uuid.UUID(estimate_id))
        .options(selectinload(Estimate.items))
    )
    est = result.scalar_one_or_none()
    if not est or est.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Estimate not found")
    return est


@router.get("/{estimate_id}/pdf")
async def download_pdf(
    estimate_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    result = await db.execute(
        select(Estimate)
        .where(Estimate.id == uuid.UUID(estimate_id))
        .options(selectinload(Estimate.items))
    )
    est = result.scalar_one_or_none()
    if not est or est.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Estimate not found")

    estimate_data = {
        "material_cost": est.material_cost,
        "labor_cost": est.labor_cost,
        "margin_rate": est.margin_rate,
        "total_cost": est.total_cost,
        "items": [
            {
                "name": i.name,
                "quantity": i.quantity,
                "unit": i.unit,
                "unit_price": i.unit_price,
                "total_price": i.total_price,
            }
            for i in est.items
        ],
    }
    pdf_bytes = generate_estimate_pdf(estimate_data, est.name)
    short_id = str(estimate_id)[:8]
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="estimate_{short_id}.pdf"'},
    )
