import json
import os
import httpx
from anthropic import AsyncAnthropic

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
STABILITY_API_KEY = os.getenv("STABILITY_API_KEY", "")


async def analyze_photo(image_url: str) -> dict:
    """Claude Vision으로 사진 분석"""
    try:
        response = await client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=500,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {"type": "url", "url": image_url},
                        },
                        {
                            "type": "text",
                            "text": '이 인테리어 사진을 분석해주세요. JSON으로만 응답: {"room_type":"거실","current_style":"미니멀","furniture":[],"wall_color":"화이트","floor_type":"원목","suggestions":""}',
                        },
                    ],
                }
            ],
        )
        text = response.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception:
        return {
            "room_type": "거실",
            "current_style": "미니멀",
            "furniture": [],
            "suggestions": "",
        }


async def generate_style_images(
    analysis: dict, styles: list[str] | None = None
) -> list[str]:
    """Stability AI로 스타일 이미지 생성 (URL 반환)"""
    if not STABILITY_API_KEY:
        return []  # API 키 없으면 빈 목록

    if styles is None:
        styles = ["modern minimalist", "Scandinavian", "classic", "natural warm"]

    image_urls: list[str] = []
    room = analysis.get("room_type", "living room")

    async with httpx.AsyncClient(timeout=30.0) as http:
        for style in styles[:4]:
            prompt = (
                f"Interior design of a {room}, {style} style, "
                "professional interior photography, 4K quality, bright natural light"
            )
            try:
                resp = await http.post(
                    "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
                    headers={
                        "Authorization": f"Bearer {STABILITY_API_KEY}",
                        "Accept": "application/json",
                    },
                    json={
                        "text_prompts": [{"text": prompt, "weight": 1}],
                        "width": 1024,
                        "height": 1024,
                        "steps": 30,
                        "samples": 1,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    b64 = data["artifacts"][0]["base64"]
                    image_urls.append(f"data:image/png;base64,{b64}")
            except Exception:
                pass

    return image_urls
