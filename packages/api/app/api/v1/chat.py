import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.subscription import Subscription
from app.models.ai_usage import AIUsageLog
from app.models.chat_message import MessageRole
from app.schemas.chat import (
    MessageRequest,
    MessageResponse,
    ChatHistoryItem,
    ChatAction,
    FurnishVariant,
    ConsultationSummaryResponse,
)
from app.repositories.chat_repo import get_or_create_session, save_message, get_history
from app.services.ai.conversation_agent import analyze_intent
from app.services.ai.furnish_agent import generate_furnish_variants
from app.services.ai.image_agent import analyze_photo, generate_style_images
from app.services.ai.concept_agent import generate_concept
from app.services.ai.consultation_agent import (
    generate_consultation_summary,
    generate_quick_estimate,
)

router = APIRouter(prefix="/chat", tags=["chat"])

PLAN_CREDIT_LIMITS: dict[str, int] = {
    "free":       10,   # Phase 4: 월 10회 (이전 5 → 10으로 정상화)
    "starter":    50,
    "studio":     50,
    "pro":        300,
    "firm":       300,
    "enterprise": 9999,
}

PLAN_UPGRADE_LINKS: dict[str, str] = {
    "free":    "/pricing?from=free",
    "starter": "/pricing?from=starter",
    "studio":  "/pricing?from=studio",
}


async def _get_monthly_credits_used(db: AsyncSession, user_id: uuid.UUID) -> int:
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(func.coalesce(func.sum(AIUsageLog.credits_charged), 0))
        .where(AIUsageLog.user_id == user_id)
        .where(AIUsageLog.created_at >= month_start)
    )
    return int(result.scalar() or 0)


async def _log_ai_usage(db, user_id, project_id, credits, ai_result) -> None:
    if ai_result is None:
        return
    # 캐시 히트 시 크레딧 차감 없음
    actual_credits = 0 if getattr(ai_result, "cached", False) else credits
    log = AIUsageLog(
        user_id=user_id,
        request_type=ai_result.request_type,
        model=ai_result.model,
        input_tokens=ai_result.input_tokens,
        output_tokens=ai_result.output_tokens,
        estimated_cost_usd=ai_result.estimated_cost_usd,
        credits_charged=actual_credits,
        cached=getattr(ai_result, "cached", False),
        project_id=project_id,
    )
    db.add(log)
    await db.flush()
    return actual_credits


async def _check_and_get_limit(
    db: AsyncSession, user: User
) -> tuple[int, int]:
    """(monthly_limit, credits_this_month) 반환. 한도 초과 시 HTTPException."""
    sub_result = await db.execute(
        select(Subscription).where(Subscription.user_id == user.id)
    )
    subscription = sub_result.scalar_one_or_none()
    plan_name = subscription.plan if subscription else "free"
    monthly_limit = PLAN_CREDIT_LIMITS.get(str(plan_name), 5)
    credits_this_month = await _get_monthly_credits_used(db, user.id)
    if monthly_limit != 9999 and credits_this_month >= monthly_limit:
        upgrade_url = PLAN_UPGRADE_LINKS.get(str(plan_name), "/pricing")
        raise HTTPException(
            status_code=429,
            detail={
                "code": "CREDIT_EXHAUSTED",
                "message": f"월 AI 크레딧({monthly_limit}회)을 모두 사용했습니다.",
                "plan": str(plan_name),
                "monthly_limit": monthly_limit,
                "upgrade_url": upgrade_url,
                "hint": "Pro 플랜으로 업그레이드하면 월 300회 이용할 수 있습니다.",
            },
        )
    return monthly_limit, credits_this_month


@router.post("/message", response_model=MessageResponse)
async def send_message(
    body: MessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    monthly_limit, credits_this_month = await _check_and_get_limit(db, current_user)

    project_context: dict = {"floor_plan": body.floor_plan_data or {}}
    recent_messages = await get_history(db, str(body.project_id), str(current_user.id), limit=6)
    chat_history = [{"role": m.role.value, "content": m.content} for m in recent_messages]
    intent_result, intent_ai = await analyze_intent(body.message, project_context, chat_history)
    intent = intent_result.get("intent", "general")
    params: dict = intent_result.get("params", {})
    reply: str = intent_result.get("reply_preview", "")

    actions: list[ChatAction] = []
    images: list[str] = []

    # 캐시 히트 여부 추적
    is_cached = getattr(intent_ai, "cached", False)

    # 캐시 히트 시 크레딧 0, 미스 시 1
    credits_used = 0 if is_cached else 1

    await _log_ai_usage(db, current_user.id, body.project_id, 1, intent_ai)

    if intent == "auto_furnish":
        credits_used = 2
        style = params.get("style", "모던")
        variants_data = await generate_furnish_variants(style, body.floor_plan_data or {}, [])
        variants = [FurnishVariant(**v) for v in variants_data]
        actions.append(ChatAction(type="auto_furnish", variants=variants))
        if not reply:
            reply = f"{style} 스타일로 3가지 배치안을 만들었습니다."

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

    elif intent == "concept_proposal":
        credits_used = 2
        concept_data, concept_ai = await generate_concept(
            message=body.message,
            room_type=params.get("room_type", "거실"),
            area_m2=params.get("area_m2"),
            budget=params.get("budget"),
        )
        await _log_ai_usage(db, current_user.id, body.project_id, 1, concept_ai)
        if concept_data:
            from app.schemas.chat import ConceptProposal, ColorSwatch
            try:
                palette = [ColorSwatch(**c) for c in concept_data.get("color_palette", [])]
                concept = ConceptProposal(
                    concept_name=concept_data.get("concept_name", "컨셉"),
                    mood=concept_data.get("mood", ""),
                    color_palette=palette,
                    key_furniture=concept_data.get("key_furniture", []),
                    style_keywords=concept_data.get("style_keywords", []),
                    budget_range=concept_data.get("budget_range"),
                    summary=concept_data.get("summary", ""),
                )
                actions.append(ChatAction(type="concept_proposal", concept=concept))
                reply = reply or f"'{concept.concept_name}' 컨셉을 제안합니다."
            except Exception:
                reply = reply or "컨셉 제안을 생성했습니다."
        else:
            reply = reply or "컨셉 제안을 준비하지 못했습니다."

    elif intent == "quick_estimate":
        credits_used = 2
        est_data, est_ai = await generate_quick_estimate(
            message=body.message,
            room_type=params.get("room_type", "거실"),
            area_m2=params.get("area_m2"),
            budget=params.get("budget"),
        )
        await _log_ai_usage(db, current_user.id, body.project_id, 1, est_ai)
        if est_data:
            from app.schemas.chat import EstimateDraft, EstimateLineItem
            try:
                items = [EstimateLineItem(**i) for i in est_data.get("breakdown", [])]
                draft = EstimateDraft(
                    room_type=est_data.get("room_type", "거실"),
                    area_m2=est_data.get("area_m2"),
                    breakdown=items,
                    subtotal=est_data.get("subtotal", 0),
                    margin_rate=est_data.get("margin_rate", 0.12),
                    total=est_data.get("total", 0),
                    notes=est_data.get("notes"),
                )
                actions.append(ChatAction(type="quick_estimate", estimate_draft=draft))
                total_str = f"{draft.total:,}원"
                reply = reply or f"빠른 견적 초안: 총 {total_str}으로 예상됩니다."
            except Exception:
                reply = reply or "견적 초안을 생성했습니다."
        else:
            reply = reply or "견적 초안을 준비하지 못했습니다."

    elif intent == "budget_optimize":
        credits_used = 2
        est_data, est_ai = await generate_quick_estimate(
            message=body.message,
            room_type=params.get("room_type", "거실"),
            area_m2=params.get("area_m2"),
            budget=params.get("budget"),
        )
        await _log_ai_usage(db, current_user.id, body.project_id, 1, est_ai)
        if est_data:
            from app.schemas.chat import EstimateDraft, EstimateLineItem
            try:
                items = [EstimateLineItem(**i) for i in est_data.get("breakdown", [])]
                draft = EstimateDraft(
                    room_type=est_data.get("room_type", "거실"),
                    area_m2=est_data.get("area_m2"),
                    breakdown=items,
                    subtotal=est_data.get("subtotal", 0),
                    margin_rate=est_data.get("margin_rate", 0.12),
                    total=est_data.get("total", 0),
                    notes=est_data.get("notes"),
                )
                actions.append(ChatAction(type="quick_estimate", estimate_draft=draft))
                total_str = f"{draft.total:,}원"
                reply = reply or f"예산에 맞게 최적화한 견적: 총 {total_str}입니다."
            except Exception:
                reply = reply or "예산 최적화 견적을 준비하지 못했습니다."
        else:
            reply = reply or "예산 최적화 견적을 준비하지 못했습니다."

    elif intent == "share":
        credits_used = 0
        from app.models.estimate import ShareLink
        from sqlalchemy import select as sa_select
        project_uuid_share = uuid.UUID(body.project_id)
        share_result = await db.execute(
            sa_select(ShareLink).where(
                ShareLink.project_id == project_uuid_share,
                ShareLink.is_active == True,  # noqa: E712
            )
        )
        existing_link = share_result.scalar_one_or_none()
        if existing_link:
            share_url = f"/share/{existing_link.token}"
        else:
            import secrets
            token = secrets.token_urlsafe(24)[:32]
            new_link = ShareLink(project_id=project_uuid_share, token=token)
            db.add(new_link)
            await db.flush()
            share_url = f"/share/{token}"
        actions.append(ChatAction(type="share_link", share_url=share_url))
        reply = reply or f"공유 링크가 생성되었습니다: {share_url}"

    elif intent == "modify_object":
        credits_used = 1
        reply = reply or (
            params.get("reply_preview")
            or "수정하려는 가구를 3D 화면에서 직접 선택해 속성 패널에서 변경하거나, "
               "더 구체적으로 설명해 주세요. (예: '소파를 파란색으로 바꿔줘')"
        )

    elif not reply:
        reply = "무엇을 도와드릴까요? '모던하게 꾸며줘', '견적 뽑아줘', 또는 사진을 올려주세요."

    chat_session = await get_or_create_session(db, body.project_id, str(current_user.id))
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
        cached=is_cached,
    )


@router.post("/summary/{project_id}", response_model=ConsultationSummaryResponse)
async def get_consultation_summary(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ConsultationSummaryResponse:
    """대화 내역 전체를 분석해 상담 요약 + 견적 초안을 반환한다."""
    monthly_limit, credits_this_month = await _check_and_get_limit(db, current_user)

    messages = await get_history(db, project_id, str(current_user.id))
    if not messages:
        raise HTTPException(status_code=404, detail="대화 내역이 없습니다.")

    history = [{"role": m.role.value, "content": m.content} for m in messages]
    summary_data, summary_ai = await generate_consultation_summary(history)
    await _log_ai_usage(db, current_user.id, project_id, 3, summary_ai)
    await db.commit()

    if not summary_data:
        raise HTTPException(status_code=502, detail="요약 생성에 실패했습니다.")

    from app.schemas.chat import (
        ConsultationSummary,
        EstimateDraft,
        EstimateLineItem,
    )

    est_raw = summary_data.get("estimate_draft")
    estimate_draft = None
    if est_raw:
        try:
            items = [EstimateLineItem(**i) for i in est_raw.get("breakdown", [])]
            estimate_draft = EstimateDraft(
                room_type=est_raw.get("room_type", "거실"),
                area_m2=est_raw.get("area_m2"),
                breakdown=items,
                subtotal=est_raw.get("subtotal", 0),
                margin_rate=est_raw.get("margin_rate", 0.12),
                total=est_raw.get("total", 0),
                notes=est_raw.get("notes"),
            )
        except Exception:
            pass

    summary = ConsultationSummary(
        title=summary_data.get("title", "상담 요약"),
        agreed_style=summary_data.get("agreed_style"),
        key_points=summary_data.get("key_points", []),
        client_preferences=summary_data.get("client_preferences"),
        estimate_draft=estimate_draft,
        next_actions=summary_data.get("next_actions", []),
        summary_text=summary_data.get("summary_text", ""),
    )

    remaining = max(0, monthly_limit - credits_this_month - 3)
    return ConsultationSummaryResponse(
        summary=summary,
        credits_used=3,
        credits_remaining=remaining,
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
