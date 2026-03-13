import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, StarletteHTTPException)
    logger.warning(f"HTTP {exc.status_code}: {exc.detail} — {request.method} {request.url}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"errors": [{"message": exc.detail, "code": str(exc.status_code)}], "data": None, "meta": {}},
    )

async def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RequestValidationError)
    errors = [{"message": f"{'.'.join(str(x) for x in e['loc'])}: {e['msg']}", "code": "validation_error"} for e in exc.errors()]
    logger.warning(f"Validation error: {errors} — {request.method} {request.url}")
    return JSONResponse(
        status_code=422,
        content={"errors": errors, "data": None, "meta": {}},
    )

async def internal_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled error: {exc} — {request.method} {request.url}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"errors": [{"message": "내부 서버 오류가 발생했습니다.", "code": "internal_error"}], "data": None, "meta": {}},
    )
