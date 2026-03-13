import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.chat_message import ChatSession, ChatMessage, MessageRole


async def get_or_create_session(
    db: AsyncSession, project_id: str, user_id: str
) -> ChatSession:
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.project_id == uuid.UUID(project_id),
            ChatSession.user_id == uuid.UUID(user_id),
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        session = ChatSession(
            project_id=uuid.UUID(project_id),
            user_id=uuid.UUID(user_id),
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
    return session


async def save_message(
    db: AsyncSession,
    session_id: uuid.UUID,
    role: MessageRole,
    content: str,
    intent: str | None = None,
    actions_data: dict | None = None,
    credits_used: int = 0,
) -> ChatMessage:
    msg = ChatMessage(
        session_id=session_id,
        role=role,
        content=content,
        intent=intent,
        actions_data=actions_data,
        credits_used=credits_used,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def get_history(
    db: AsyncSession, project_id: str, user_id: str, limit: int = 50
) -> list[ChatMessage]:
    session_result = await db.execute(
        select(ChatSession).where(
            ChatSession.project_id == uuid.UUID(project_id),
            ChatSession.user_id == uuid.UUID(user_id),
        )
    )
    chat_session = session_result.scalar_one_or_none()
    if not chat_session:
        return []
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.session_id == chat_session.id)
        .order_by(desc(ChatMessage.created_at))
        .limit(limit)
    )
    return list(reversed(result.scalars().all()))
