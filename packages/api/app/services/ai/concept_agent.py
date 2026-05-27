import json
from app.services.ai import ai_router

SYSTEM_PROMPT = """당신은 인테리어 디자인 전문 컨설턴트입니다.
사용자 요청을 바탕으로 구체적인 디자인 컨셉을 제안하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "concept_name": "컨셉 이름 (예: 모던 미니멀리즘)",
  "mood": "분위기 설명 (2~3문장)",
  "color_palette": [
    {"name": "베이스 컬러", "hex": "#F5F0EB", "usage": "벽면·천장"},
    {"name": "포인트 컬러", "hex": "#2C3E50", "usage": "소파·러그"},
    {"name": "악센트 컬러", "hex": "#E74C3C", "usage": "쿠션·소품"}
  ],
  "key_furniture": ["소파", "사이드 테이블", "간접조명"],
  "style_keywords": ["미니멀", "자연소재", "따뜻한 중립 톤"],
  "budget_range": {"min": 3000000, "max": 8000000, "currency": "KRW"},
  "summary": "한 줄 요약"
}"""


async def generate_concept(
    message: str,
    room_type: str,
    area_m2: float | None,
    budget: int | None,
) -> tuple[dict, "ai_router.AIResult | None"]:
    """디자인 컨셉 제안 생성."""
    context = {
        "room_type": room_type or "거실",
        "area_m2": area_m2,
        "budget": budget,
    }
    try:
        data, result = await ai_router.call_json(
            request_type="concept_proposal",
            system=SYSTEM_PROMPT,
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
