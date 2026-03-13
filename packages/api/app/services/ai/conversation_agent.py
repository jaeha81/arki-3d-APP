import json
import os
from anthropic import AsyncAnthropic

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))

SYSTEM_PROMPT = """당신은 인테리어 디자인 AI 어시스턴트입니다.
사용자의 메시지를 분석하여 의도(intent)를 파악하세요.

가능한 intent:
- auto_furnish: 가구 자동 배치 요청
- restyle_photo: 사진 기반 리모델링
- modify_object: 개별 가구 수정
- estimate: 견적 요청
- budget_optimize: 예산 맞춤
- share: 공유 요청
- general: 일반 대화/질문

JSON으로만 응답:
{"intent": "auto_furnish", "params": {"style": "모던", "room": "거실", "budget": null}, "reply_preview": "..."}"""


async def analyze_intent(message: str, project_context: dict) -> dict:
    """사용자 메시지 의도 분석"""
    try:
        response = await client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=500,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"프로젝트: {json.dumps(project_context, ensure_ascii=False)}\n\n메시지: {message}",
                }
            ],
        )
        text = response.content[0].text.strip()
        # JSON 파싱
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception:
        return {
            "intent": "general",
            "params": {},
            "reply_preview": "안녕하세요! 어떻게 도와드릴까요?",
        }
