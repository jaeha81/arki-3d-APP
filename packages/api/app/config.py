from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://sp_user:sp_pass@localhost:5432/spaceplanner"
    REDIS_URL: str = "redis://localhost:6379/0"
    JWT_SECRET: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin123"
    MINIO_BUCKET: str = "spaceplanner"
    FRONTEND_URL: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"
    TOSS_CLIENT_KEY: str = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"
    TOSS_SECRET_KEY: str = "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"


settings = Settings()
