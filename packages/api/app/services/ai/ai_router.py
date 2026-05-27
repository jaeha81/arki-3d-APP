"""AI Router — 요청 유형에 따라 모델·비용을 최적 선택한다."""
from __future__ import annotations

import json
import os
from dataclasses import dataclass
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

# ── 요청 유형 → 모델 라우팅 규칙 ───────────────────────────────────────────
ROUTING: dict[str, str] = {
    "analyze_intent":      MODELS["haiku"],
    "estimate_draft":      MODELS["haiku"],
    "checklist_generate":  MODELS["haiku"],
    "consultation_summary": MODELS["haiku"],
    "concept_suggest":     MODELS["sonnet"],
    "style_recommend":     MODELS["sonnet"],
    "placement_optimize":  MODELS["sonnet"],
    "complex_analysis":    MODELS["opus"],
}
DEFAULT_MODEL = MODELS["haiku"]


@dataclass
class AIResult:
    content: str
    model: str
    input_tokens: int
    output_tokens: int
    estimated_cost_usd: float
    request_type: str


async def call(
    request_type: str,
    system: str,
    messages: list[dict[str, Any]],
    max_tokens: int = 1000,
) -> AIResult:
    """모델을 자동 선택해 Anthropic API 를 호출하고 AIResult 를 반환한다."""
    model = ROUTING.get(request_type, DEFAULT_MODEL)

    response = await client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system,
        messages=messages,
    )

    in_tok = response.usage.input_tokens
    out_tok = response.usage.output_tokens
    in_rate, out_rate = COST_PER_TOKEN.get(model, (0.000003, 0.000015))
    cost = in_tok * in_rate + out_tok * out_rate

    return AIResult(
        content=response.content[0].text.strip(),
        model=model,
        input_tokens=in_tok,
        output_tokens=out_tok,
        estimated_cost_usd=cost,
        request_type=request_type,
    )


async def call_json(
    request_type: str,
    system: str,
    messages: list[dict[str, Any]],
    max_tokens: int = 500,
) -> tuple[dict, AIResult]:
    """JSON 응답을 파싱해 (dict, AIResult) 를 반환한다."""
    result = await call(request_type, system, messages, max_tokens)
    text = result.content
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text), result
    except Exception:
        return {}, result
