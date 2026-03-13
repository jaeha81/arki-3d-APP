import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
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


@router.post("/message", response_model=MessageResponse)
async def send_message(
    body: MessageRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    # 의도 분석
    project_context: dict = {"floor_plan": body.floor_plan_data or {}}
    intent_result = await analyze_intent(body.message, project_context)
    intent = intent_result.get("intent", "general")
    params: dict = intent_result.get("params", {})
    reply: str = intent_result.get("reply_preview", "")

    actions: list[ChatAction] = []
    images: list[str] = []
    credits_used = 1

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

    return MessageResponse(
        reply=reply,
        intent=intent,
        actions=actions,
        images=images,
        credits_used=credits_used,
        credits_remaining=max(0, 50 - credits_used),
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
