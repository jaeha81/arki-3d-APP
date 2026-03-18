from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PaymentPrepareRequest(BaseModel):
    plan: str


class PaymentPrepareResponse(BaseModel):
    order_id: str
    order_name: str
    amount: int
    customer_key: str
    client_key: str
    success_url: str
    fail_url: str


class PaymentConfirmRequest(BaseModel):
    payment_key: str
    order_id: str
    amount: int


class PaymentResponse(BaseModel):
    id: str
    order_id: str
    order_name: str
    amount: int
    status: str
    method: Optional[str] = None
    receipt_url: Optional[str] = None
    plan: str
    created_at: datetime

    model_config = {"from_attributes": True}
