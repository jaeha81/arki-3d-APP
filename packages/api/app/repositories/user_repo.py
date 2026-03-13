import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def create(self, **kwargs) -> User:
        user = User(**kwargs)
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def get_or_create_oauth(
        self,
        email: str,
        provider: str,
        provider_id: str,
        name: str | None,
        avatar_url: str | None,
    ) -> tuple[User, bool]:
        user = await self.get_by_email(email)
        if user:
            return user, False
        user = await self.create(
            email=email,
            provider=provider,
            provider_id=provider_id,
            name=name,
            avatar_url=avatar_url,
        )
        return user, True
