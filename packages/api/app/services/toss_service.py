import uuid
import base64
import json
from typing import Any
import httpx
from app.config import settings
from app.models.subscription import PLAN_PRICES, PlanType

TOSS_API = "https://api.tosspayments.com/v1"


def _auth_header() -> dict[str, str]:
    token = base64.b64encode(f"{settings.TOSS_SECRET_KEY}:".encode()).decode()
    return {"Authorization": f"Basic {token}", "Content-Type": "application/json"}


def generate_order_id(user_id: str, plan: str) -> str:
    short = str(uuid.uuid4()).replace("-", "")[:16]
    return f"SP-{plan[:3].upper()}-{short}"


async def confirm_payment(payment_key: str, order_id: str, amount: int) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{TOSS_API}/payments/confirm",
            headers=_auth_header(),
            json={"paymentKey": payment_key, "orderId": order_id, "amount": amount},
        )
        resp.raise_for_status()
        return resp.json()


async def cancel_payment(payment_key: str, cancel_reason: str) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{TOSS_API}/payments/{payment_key}/cancel",
            headers=_auth_header(),
            json={"cancelReason": cancel_reason},
        )
        resp.raise_for_status()
        return resp.json()


def get_plan_amount(plan: str) -> int:
    return PLAN_PRICES.get(PlanType(plan), 0)


def get_order_name(plan: str) -> str:
    names = {
        "starter": "SpacePlanner Starter 월 구독",
        "pro": "SpacePlanner Pro 월 구독",
        "enterprise": "SpacePlanner Enterprise 구독",
    }
    return names.get(plan, f"SpacePlanner {plan} 구독")
