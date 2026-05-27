import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.subscription import Subscription, PlanType, PLAN_LIMITS
from app.models.ai_usage import AIUsageLog
from app.schemas.chat import (
    MessageRequest,
    MessageResponse,
    ChatHistoryItem,
    ChatAction,
    FurnishVariant,
)
from app.repositories.chat_repo import get_or_create_session, save_message, get_history
from app.services.ai.conversation_agent import analyze_intent
from app.services.ai.furnish_agent import generate_furnish_variants
from app.services.ai.image_agent import analyze_photo, generate_style_images
from app.models.chat_message import MessageRole

router = APIRouter(prefix="/chat", tags=["chat"])

# 플랜별 월 크레딧 한도 (PDF 명령서 기준)
PLAN_CREDIT_LIMITS: dict[str, int] = {
    "free":       5,
    "starter":    50,
    "studio":     50,
    "pro":        300,
    "firm":       300,
    "enterprise": 9999,
}


async def _get_monthly_credits_used(db: AsyncSession, user_id: uuid.UUID) -> int:
    """이번 달 사용한 크레딧 합계를 반환한다."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(func.coalesce(func.sum(AIUsageLog.credits_charged), 0))
        .where(AIUsageLog.user_id == user_id)
        .where(AIUsageLog.created_at >= month_start)
    )
    return int(result.scalar() or 0)


async def _log_ai_usage(
    db: AsyncSession,
    user_id: uuid.UUID,
    project_id: str | None,
    credits: int,
    ai_result,
) -> None:
    """AI 호출 결과를 ai_usage_logs 에 기록한다."""
    if ai_result is None:
        return
    log = AIUsageLog(
        user_id=user_id,
        request_type=ai_result.request_type,
        model=ai_result.model,
        input_tokens=ai_result.input_tokens,
        output_tokens=ai_result.output_tokens,
        estimated_cost_usd=ai_result.estimated_cost_usd,
        credits_charged=credits,
        project_id=project_id,
    )
    db.add(log)
    await db.flush()


@router.post("/message", response_model=MessageResponse)
async def send_message(
    body: MessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    # 구독 조회
    sub_result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = sub_result.scalar_one_or_none()
    plan_name = subscription.plan if subscription else "free"
    monthly_limit = PLAN_CREDIT_LIMITS.get(str(plan_name), 5)

    # 이번 달 사용량 확인
    credits_this_month = await _get_monthly_credits_used(db, current_user.id)
    if monthly_limit != 9999 and credits_this_month >= monthly_limit:
        raise HTTPException(
            status_code=429,
            detail=f"월 AI 크레딧({monthly_limit}회)을 모두 사용했습니다. 플랜을 업그레이드하거나 다음 달을 기다려주세요.",
        )

    # 의도 분석
    project_context: dict = {"floor_plan": body.floor_plan_data or {}}
    intent_result, intent_ai = await analyze_intent(body.message, project_context)
    intent = intent_result.get("intent", "general")
    params: dict = intent_result.get("params", {})
    reply: str = intent_result.get("reply_preview", "")

    actions: list[ChatAction] = []
    images: list[str] = []
    credits_used = 1

    await _log_ai_usage(db, current_user.id, body.project_id, 1, intent_ai)

    # 배치 에이전트
    if intent == "auto_furnish":
        credits_used = 2
        style: str = params.get("style", "모던")
        room_info: dict = body.floor_plan_data or {}
        variants_data = await generate_furnish_variants(style, room_info, [])
        variants = [FurnishVariant(**v) for v in variants_data]
        actions.append(ChatAction(type="auto_furnish", variants=variants))
        if not reply:
            reply = f"{style} 스타일로 3가지 배치안을 만들었습니다."

    # 이미지 에이전트
    elif intent == "restyle_photo":
        credits_used = 3
        attachments: list[dict] = body.attachments or []
        image_url: str = next(
            (a.get("url", "") for a in attachments if a.get("type") == "image"), ""
        )
        if image_url:
            analysis = await analyze_photo(image_url)
            images = await generate_style_images(analysis)
            reply = f"사진을 분석했습니다. {len(images)}가지 스타일 시안을 생성했어요."
        else:
            reply = "분석할 이미지를 첨부해주세요."

    elif not reply:
        reply = "무엇을 도와드릴까요? '모던하게 꾸며줘' 또는 사진을 올려주세요."

    # 대화 저장
    chat_session = await get_or_create_session(
        db, body.project_id, str(current_user.id)
    )
    await save_message(db, chat_session.id, MessageRole.user, body.message)
    await save_message(
        db,
        chat_session.id,
        MessageRole.assistant,
        reply,
        intent=intent,
        actions_data={"actions": [a.model_dump() for a in actions]},
        credits_used=credits_used,
    )
    await db.commit()

    remaining = max(0, monthly_limit - credits_this_month - credits_used)
    return MessageResponse(
        reply=reply,
        intent=intent,
        actions=actions,
        images=images,
        credits_used=credits_used,
        credits_remaining=remaining,
        message_id=str(uuid.uuid4()),
    )


@router.get("/history/{project_id}", response_model=list[ChatHistoryItem])
async def get_chat_history(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ChatHistoryItem]:
    messages = await get_history(db, project_id, str(current_user.id))
    return [
        ChatHistoryItem(
            id=str(m.id),
            role=m.role.value,
            content=m.content,
            intent=m.intent,
            actions_data=m.actions_data,
            created_at=m.created_at,
        )
        for m in messages
    ]
