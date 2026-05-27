"""AI Router — 요청 유형·메시지 복잡도에 따라 모델·비용을 최적 선택한다.

Phase 4 추가:
- 스마트 모델 선택: 메시지 복잡도 기반 자동 업그레이드
- 캐싱 레이어: in-memory dict (TTL 1시간), Redis 없어도 동작
- Prompt Caching: Anthropic cache_control으로 시스템 프롬프트 비용 절감
- Streaming: call_stream()으로 실시간 토큰 스트리밍 지원
"""
from __future__ import annotations

import hashlib
import json
import os
import time
from collections.abc import AsyncGenerator
from dataclasses import dataclass, field
from typing import Any

from anthropic import AsyncAnthropic

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

# ── 모델 정의 ──────────────────────────────────────────────────────────────
MODELS = {
    "haiku":  "claude-haiku-4-5-20251001",
    "sonnet": "claude-sonnet-4-6",
    "opus":   "claude-opus-4-7",
}

# 토큰당 USD 단가 (input / output)
COST_PER_TOKEN: dict[str, tuple[float, float]] = {
    MODELS["haiku"]:  (0.00000025, 0.00000125),
    MODELS["sonnet"]: (0.000003,   0.000015),
    MODELS["opus"]:   (0.000015,   0.000075),
}

# ── 요청 유형 → 기본 모델 라우팅 ───────────────────────────────────────────
ROUTING: dict[str, str] = {
    "analyze_intent":       MODELS["haiku"],
    "estimate_draft":       MODELS["haiku"],
    "checklist_generate":   MODELS["haiku"],
    "consultation_summary": MODELS["haiku"],
    "concept_suggest":      MODELS["sonnet"],
    "style_recommend":      MODELS["sonnet"],
    "placement_optimize":   MODELS["sonnet"],
    "complex_analysis":     MODELS["opus"],
}
DEFAULT_MODEL = MODELS["haiku"]

# ── 복잡도 키워드 (메시지 기반 스마트 업그레이드) ─────────────────────────
_OPUS_KEYWORDS = frozenset([
    "전체 리모델링", "전체리모델링", "전체 설계", "상세 설계", "리모델링 플랜",
    "전면 개조", "종합 계획", "인테리어 전체",
])
_SONNET_KEYWORDS = frozenset([
    "도면", "평면도", "3d", "3D", "자재 견적", "자재견적", "견적 분석",
    "도면 분석", "평면 분석", "시공", "공사", "배치 계획",
])


def _detect_complexity_model(message: str) -> str | None:
    """메시지 내용으로 복잡도를 판단해 권장 모델을 반환한다. 판단 불가 시 None."""
    msg_lower = message.lower()
    for kw in _OPUS_KEYWORDS:
        if kw in msg_lower:
            return MODELS["opus"]
    for kw in _SONNET_KEYWORDS:
        if kw in msg_lower:
            return MODELS["sonnet"]
    # 짧은 질문(≤50자)는 haiku 강제
    if len(message.strip()) <= 50:
        return MODELS["haiku"]
    return None


def select_model(request_type: str, user_message: str | None = None) -> str:
    """요청 유형 + 메시지 복잡도를 결합해 최적 모델을 결정한다."""
    base_model = ROUTING.get(request_type, DEFAULT_MODEL)
    if not user_message:
        return base_model
    complexity_model = _detect_complexity_model(user_message)
    if complexity_model is None:
        return base_model
    # 모델 우선순위: opus > sonnet > haiku
    _rank = {MODELS["haiku"]: 0, MODELS["sonnet"]: 1, MODELS["opus"]: 2}
    return complexity_model if _rank.get(complexity_model, 0) > _rank.get(base_model, 0) else base_model


# ── 캐싱 레이어 (in-memory, TTL 1시간) ────────────────────────────────────
_CACHE_TTL = 3600  # seconds

@dataclass
class _CacheEntry:
    content: str
    model: str
    input_tokens: int
    output_tokens: int
    estimated_cost_usd: float
    request_type: str
    expires_at: float = field(default_factory=lambda: time.monotonic() + _CACHE_TTL)


_response_cache: dict[str, _CacheEntry] = {}


def _cache_key(request_type: str, system: str, messages: list[dict]) -> str:
    # 앞 100자만 해싱해 캐시 키 생성
    payload = request_type + system[:50] + json.dumps(messages)[:100]
    return hashlib.sha256(payload.encode()).hexdigest()


def _get_cached(key: str) -> _CacheEntry | None:
    entry = _response_cache.get(key)
    if entry and time.monotonic() < entry.expires_at:
        return entry
    if entry:
        del _response_cache[key]  # 만료 항목 제거
    return None


def _set_cache(key: str, entry: _CacheEntry) -> None:
    # 캐시 크기 상한 1000개
    if len(_response_cache) >= 1000:
        oldest_key = next(iter(_response_cache))
        del _response_cache[oldest_key]
    _response_cache[key] = entry


# ── AIResult ───────────────────────────────────────────────────────────────
@dataclass
class AIResult:
    content: str
    model: str
    input_tokens: int
    output_tokens: int
    estimated_cost_usd: float
    request_type: str
    cached: bool = False


async def call(
    request_type: str,
    system: str,
    messages: list[dict[str, Any]],
    max_tokens: int = 1000,
    user_message: str | None = None,
    use_cache: bool = True,
) -> AIResult:
    """모델을 자동 선택해 Anthropic API를 호출하고 AIResult를 반환한다.

    Args:
        user_message: 복잡도 기반 모델 업그레이드에 사용할 원본 사용자 메시지.
        use_cache: False이면 캐시를 건너뜀 (스트리밍 등 특수 케이스용).
    """
    model = select_model(request_type, user_message)

    if use_cache:
        cache_key = _cache_key(request_type, system, messages)
        cached = _get_cached(cache_key)
        if cached:
            return AIResult(
                content=cached.content,
                model=cached.model,
                input_tokens=cached.input_tokens,
                output_tokens=cached.output_tokens,
                estimated_cost_usd=cached.estimated_cost_usd,
                request_type=cached.request_type,
                cached=True,
            )

    response = await client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
        messages=messages,
    )

    in_tok = response.usage.input_tokens
    out_tok = response.usage.output_tokens
    in_rate, out_rate = COST_PER_TOKEN.get(model, (0.000003, 0.000015))
    cost = in_tok * in_rate + out_tok * out_rate

    result = AIResult(
        content=response.content[0].text.strip(),
        model=model,
        input_tokens=in_tok,
        output_tokens=out_tok,
        estimated_cost_usd=cost,
        request_type=request_type,
        cached=False,
    )

    if use_cache:
        _set_cache(
            cache_key,
            _CacheEntry(
                content=result.content,
                model=result.model,
                input_tokens=result.input_tokens,
                output_tokens=result.output_tokens,
                estimated_cost_usd=result.estimated_cost_usd,
                request_type=result.request_type,
            ),
        )

    return result


async def call_json(
    request_type: str,
    system: str,
    messages: list[dict[str, Any]],
    max_tokens: int = 500,
    user_message: str | None = None,
    use_cache: bool = True,
) -> tuple[dict, AIResult]:
    """JSON 응답을 파싱해 (dict, AIResult)를 반환한다."""
    result = await call(request_type, system, messages, max_tokens, user_message, use_cache)
    text = result.content
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text), result
    except Exception:
        return {}, result


async def call_stream(
    request_type: str,
    system: str,
    messages: list[dict[str, Any]],
    max_tokens: int = 1000,
    user_message: str | None = None,
) -> AsyncGenerator[str, None]:
    """스트리밍 모드로 모델을 호출해 텍스트 청크를 순서대로 yield한다.

    캐싱 불가 (스트리밍은 캐시 키 사용 안 함). Prompt Caching은 적용.
    Usage:
        async for chunk in call_stream(...):
            yield f"data: {chunk}\n\n"
    """
    model = select_model(request_type, user_message)
    async with client.messages.stream(
        model=model,
        max_tokens=max_tokens,
        system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text
