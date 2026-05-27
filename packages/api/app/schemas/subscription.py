from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SubscriptionResponse(BaseModel):
    id: str
    user_id: str
    plan: str
    credits_used: int
    images_used: int
    credits_remaining: int  # computed: limit - used (-1 = unlimited)
    images_remaining: int   # computed
    is_active: bool

    model_config = {"from_attributes": True}


class PlanInfo(BaseModel):
    plan: str
    price: int
    credits_per_month: int  # -1 = unlimited
    images_per_month: int
    max_projects: int


class SubscriptionUpgradeRequest(BaseModel):
    plan: str  # "starter" | "pro" | "enterprise"
    payment_method_id: Optional[str] = None  # Stripe PM ID


class AdminUserItem(BaseModel):
    id: str
    email: str
    full_name: str
    plan: str
    created_at: datetime


class AdminStatsResponse(BaseModel):
    total_users: int
    active_subscriptions: int
    pro_users: int
    starter_users: int
    free_users: int
    total_projects: int
    total_estimates: int
    # AI 비용 통계
    ai_calls_today: int = 0
    ai_calls_this_month: int = 0
    ai_cost_this_month_usd: float = 0.0
    ai_cost_this_month_krw: int = 0  # USD × 1350 환율
    failed_ai_requests: int = 0


class AdminAIModelBreakdown(BaseModel):
    model: str
    call_count: int
    total_cost_usd: float
    total_input_tokens: int
    total_output_tokens: int


class AdminAIStatsDetail(BaseModel):
    daily_calls: list[dict]          # [{date, count, cost_usd}]
    model_breakdown: list[AdminAIModelBreakdown]
    top_users: list[dict]            # [{user_id, email, credits_used, cost_usd}]
