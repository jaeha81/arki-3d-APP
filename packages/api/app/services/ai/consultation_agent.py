import json
from app.services.ai import ai_router

SUMMARY_SYSTEM = """당신은 인테리어 상담 전문가입니다.
지금까지 나눈 대화를 분석하여 상담 요약 보고서를 작성하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "상담 요약 제목",
  "agreed_style": "합의된 스타일 (예: 스칸디나비안 모던)",
  "key_points": ["핵심 요점 1", "핵심 요점 2", "핵심 요점 3"],
  "client_preferences": {
    "style": "선호 스타일",
    "colors": ["색상 1", "색상 2"],
    "budget": "예산 범위",
    "special_requests": ["특이사항 1"]
  },
  "estimate_draft": {
    "room_type": "공간 유형",
    "area_m2": null,
    "breakdown": [
      {"category": "바닥재", "unit_price": 150000, "estimated_qty": "30㎡", "total": 4500000},
      {"category": "도배", "unit_price": 20000, "estimated_qty": "60㎡", "total": 1200000},
      {"category": "가구", "unit_price": null, "estimated_qty": null, "total": 3000000}
    ],
    "subtotal": 8700000,
    "margin_rate": 0.15,
    "total": 10005000
  },
  "next_actions": ["현장 방문 일정 조율", "자재 샘플 확인"],
  "summary_text": "전체 요약 2~3문장"
}"""

QUICK_ESTIMATE_SYSTEM = """당신은 인테리어 견적 전문가입니다.
공간 정보를 바탕으로 빠른 견적 초안을 작성하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "room_type": "공간 유형",
  "area_m2": 25.0,
  "breakdown": [
    {"category": "바닥재", "unit_price": 150000, "estimated_qty": "25㎡", "total": 3750000},
    {"category": "도배·페인트", "unit_price": 18000, "estimated_qty": "50㎡", "total": 900000},
    {"category": "조명", "unit_price": null, "estimated_qty": null, "total": 500000},
    {"category": "가구·소품", "unit_price": null, "estimated_qty": null, "total": 2000000}
  ],
  "subtotal": 7150000,
  "margin_rate": 0.12,
  "total": 8008000,
  "notes": "실제 견적은 현장 실측 후 확정됩니다."
}"""


async def generate_consultation_summary(
    chat_history: list[dict],
) -> tuple[dict, "ai_router.AIResult | None"]:
    """대화 내역 → 상담 요약 생성."""
    history_text = "\n".join(
        f"[{m['role']}] {m['content']}" for m in chat_history[-20:]
    )
    try:
        data, result = await ai_router.call_json(
            request_type="consultation_summary",
            system=SUMMARY_SYSTEM,
            messages=[
                {
                    "role": "user",
                    "content": f"대화 내역:\n{history_text}",
                }
            ],
            max_tokens=1200,
        )
        return data or {}, result
    except Exception:
        return {}, None


async def generate_quick_estimate(
    message: str,
    room_type: str,
    area_m2: float | None,
    budget: int | None,
) -> tuple[dict, "ai_router.AIResult | None"]:
    """공간 정보 기반 빠른 견적 초안 생성."""
    context = {
        "room_type": room_type or "거실",
        "area_m2": area_m2,
        "budget_hint": budget,
    }
    try:
        data, result = await ai_router.call_json(
            request_type="quick_estimate",
            system=QUICK_ESTIMATE_SYSTEM,
            messages=[
                {
                    "role": "user",
                    "content": f"공간 정보: {json.dumps(context, ensure_ascii=False)}\n\n요청: {message}",
                }
            ],
            max_tokens=800,
        )
        return data or {}, result
    except Exception:
        return {}, None
