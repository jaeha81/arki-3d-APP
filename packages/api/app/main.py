from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.config import settings
from app.api.v1.auth import router as auth_router
from app.api.v1.projects import router as projects_router
from app.api.v1.asset_categories import router as asset_categories_router
from app.api.v1.assets import router as assets_router
from app.api.v1.materials import router as materials_router
from app.api.v1.project_versions import router as project_versions_router
from app.api.v1.chat import router as chat_router
from app.api.v1.estimates import router as estimates_router
from app.api.v1.share import router as share_router
from app.api.v1.subscriptions import router as subscriptions_router
from app.api.v1.admin import router as admin_router
from app.api.v1.price_catalog import router as price_catalog_router
from app.api.v1.payments import router as payments_router
from app.middleware.error_handler import http_exception_handler, validation_exception_handler, internal_error_handler
from app.middleware.logging_middleware import RequestLoggingMiddleware

app = FastAPI(
    title="SpacePlanner API",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, internal_error_handler)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(asset_categories_router, prefix="/api/v1/asset-categories", tags=["asset-categories"])
app.include_router(assets_router, prefix="/api/v1/assets", tags=["assets"])
app.include_router(materials_router, prefix="/api/v1/materials", tags=["materials"])
app.include_router(project_versions_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(estimates_router, prefix="/api/v1")
app.include_router(share_router, prefix="/api/v1")
app.include_router(subscriptions_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(price_catalog_router, prefix="/api/v1")
app.include_router(payments_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}
