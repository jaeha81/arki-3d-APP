import uuid
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.payment import Payment, PaymentStatus
from app.schemas.payment import (
    PaymentPrepareRequest,
    PaymentPrepareResponse,
    PaymentConfirmRequest,
    PaymentResponse,
)
from app.services.toss_service import (
    generate_order_id,
    confirm_payment,
    get_plan_amount,
    get_order_name,
)
from app.services.subscription_service import upgrade_plan
from app.config import settings

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/prepare", response_model=PaymentPrepareResponse)
async def prepare_payment(
    body: PaymentPrepareRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    amount = get_plan_amount(body.plan)
    if amount == 0:
        raise HTTPException(status_code=400, detail="무료 플랜은 결제가 필요하지 않습니다")

    order_id = generate_order_id(str(current_user.id), body.plan)
    order_name = get_order_name(body.plan)
    customer_key = str(current_user.id)

    payment = Payment(
        user_id=current_user.id,
        order_id=order_id,
        order_name=order_name,
        amount=amount,
        plan=body.plan,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    await db.commit()

    return PaymentPrepareResponse(
        order_id=order_id,
        order_name=order_name,
        amount=amount,
        customer_key=customer_key,
        client_key=settings.TOSS_CLIENT_KEY,
        success_url=f"{settings.FRONTEND_URL}/payment/success",
        fail_url=f"{settings.FRONTEND_URL}/payment/fail",
    )


@router.post("/confirm", response_model=PaymentResponse)
async def confirm_payment_endpoint(
    body: PaymentConfirmRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Payment).where(
            Payment.order_id == body.order_id,
            Payment.user_id == current_user.id,
        )
    )
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="결제 정보를 찾을 수 없습니다")
    if payment.status == PaymentStatus.done:
        raise HTTPException(status_code=400, detail="이미 완료된 결제입니다")
    if payment.amount != body.amount:
        raise HTTPException(status_code=400, detail="결제 금액이 일치하지 않습니다")

    try:
        toss_resp = await confirm_payment(body.payment_key, body.order_id, body.amount)
    except Exception as exc:
        payment.status = PaymentStatus.failed
        await db.commit()
        raise HTTPException(status_code=400, detail=f"토스 결제 확인 실패: {exc}") from exc

    payment.payment_key = body.payment_key
    payment.status = PaymentStatus.done
    payment.method = toss_resp.get("method")
    payment.receipt_url = toss_resp.get("receipt", {}).get("url")
    payment.toss_raw = json.dumps(toss_resp, ensure_ascii=False)
    await db.commit()

    await upgrade_plan(db, current_user.id, payment.plan)

    await db.refresh(payment)
    return PaymentResponse(
        id=str(payment.id),
        order_id=payment.order_id,
        order_name=payment.order_name,
        amount=payment.amount,
        status=payment.status,
        method=payment.method,
        receipt_url=payment.receipt_url,
        plan=payment.plan,
        created_at=payment.created_at,
    )


@router.get("/history", response_model=list[PaymentResponse])
async def get_payment_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Payment)
        .where(Payment.user_id == current_user.id, Payment.status == PaymentStatus.done)
        .order_by(desc(Payment.created_at))
        .limit(50)
    )
    payments = result.scalars().all()
    return [
        PaymentResponse(
            id=str(p.id),
            order_id=p.order_id,
            order_name=p.order_name,
            amount=p.amount,
            status=p.status,
            method=p.method,
            receipt_url=p.receipt_url,
            plan=p.plan,
            created_at=p.created_at,
        )
        for p in payments
    ]
