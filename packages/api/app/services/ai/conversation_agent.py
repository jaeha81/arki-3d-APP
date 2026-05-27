import json
from app.services.ai import ai_router

SYSTEM_PROMPT = """당신은 인테리어 디자인 AI 어시스턴트입니다.
사용자의 메시지를 분석하여 의도(intent)를 파악하세요.

가능한 intent:
- auto_furnish: 가구 자동 배치 요청
- restyle_photo: 사진 기반 리모델링
- modify_object: 개별 가구 수정
- concept_proposal: 디자인 컨셉/스타일 제안 요청 (예: "모던하게", "북유럽 스타일로", "컨셉 잡아줘")
- quick_estimate: 빠른 견적 초안 요청 (예: "얼마 들어?", "견적 뽑아줘", "예산이 얼마야")
- consultation_summary: 상담 내용 요약 요청 (예: "지금까지 얘기한 거 정리해줘", "요약해줘")
- estimate: 상세 견적 생성
- budget_optimize: 예산 맞춤
- share: 공유 요청
- general: 일반 대화/질문

params 필드에 포함:
- style: 스타일명 (concept_proposal/auto_furnish 시)
- room_type: 공간 유형 (거실/침실/주방 등)
- area_m2: 면적(숫자, 없으면 null)
- budget: 예산(숫자, 없으면 null)

JSON으로만 응답:
{"intent": "concept_proposal", "params": {"style": "모던", "room_type": "거실", "area_m2": null, "budget": null}, "reply_preview": "..."}"""


async def analyze_intent(message: str, project_context: dict) -> tuple[dict, "ai_router.AIResult | None"]:
    """사용자 메시지 의도 분석. (결과 dict, AIResult) 반환."""
    try:
        data, result = await ai_router.call_json(
            request_type="analyze_intent",
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"프로젝트: {json.dumps(project_context, ensure_ascii=False)}\n\n메시지: {message}",
                }
            ],
            max_tokens=500,
        )
        if data:
            return data, result
        return {"intent": "general", "params": {}, "reply_preview": "안녕하세요! 어떻게 도와드릴까요?"}, result
    except Exception:
        return {"intent": "general", "params": {}, "reply_preview": "안녕하세요! 어떻게 도와드릴까요?"}, None
