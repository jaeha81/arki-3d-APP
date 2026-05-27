import json
from app.services.ai import ai_router

FURNISH_SYSTEM = """당신은 인테리어 배치 전문가입니다.
주어진 방 정보와 가구 목록으로 3가지 배치안을 JSON으로만 생성하세요.

반드시 이 형식:
{"variants": [{"name": "A안", "description": "...", "objects": [{"assetId": "...", "position": {"x": mm, "y": 0, "z": mm}, "rotation": {"x": 0, "y": 0, "z": 0}}], "materials": [], "estimated_cost": 0}]}

배치 규칙:
1. 동선 최소 600mm 확보
2. 가구 간 최소 400mm 간격
3. 소파: 창문 반대편 벽면
4. 테이블: 소파 앞 중앙
5. 침대: 문에서 가장 먼 벽면"""


async def generate_furnish_variants(
    style: str,
    room_info: dict,
    available_assets: list[dict],
    budget: int | None = None,
) -> list[dict]:
    """3가지 배치안 생성 — ai_router를 통해 모델 선택·비용 추적·캐싱을 일원화한다."""
    prompt = f"""스타일: {style}
예산: {budget or '제한없음'}원
방 정보: {json.dumps(room_info, ensure_ascii=False)}
사용가능 가구(상위 20개): {json.dumps(available_assets[:20], ensure_ascii=False)}"""

    try:
        data, _ = await ai_router.call_json(
            request_type="auto_furnish",
            system=FURNISH_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=3000,
            user_message=style,
        )
        return data.get("variants", [])
    except Exception:
        return [
            {
                "name": f"{style} {suffix}안",
                "description": f"{style} 스타일 배치",
                "objects": [],
                "materials": [],
                "estimated_cost": 0,
            }
            for suffix in ["A", "B", "C"]
        ]
