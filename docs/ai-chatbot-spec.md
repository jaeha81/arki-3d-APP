# AI 챗봇 기술 명세서

## 1. 전체 구조

사용자에게는 하나의 채팅창으로 보이지만,
내부적으로 6개의 전문 에이전트가 협력합니다.

```
[사용자 메시지]
      ↓
[대화 에이전트] ← Claude API (의도 분석)
      ↓ (의도에 따라 분기)
      ├→ "꾸며줘/배치해줘" → [배치 에이전트]
      ├→ "사진 올림"       → [이미지 에이전트]
      ├→ "견적서 뽑아줘"   → [견적 에이전트]
      ├→ "공유해줘/보내줘" → [공유 에이전트]
      └→ 일반 질문         → [대화 에이전트가 직접 답변]
```

## 2. API 엔드포인트

### POST /api/v1/chat/message

#### 요청
```json
{
  "project_id": "uuid",
  "message": "모던 미니멀 스타일로 거실 꾸며줘",
  "attachments": [
    {
      "type": "image",
      "url": "https://s3.../uploaded-photo.jpg"
    }
  ]
}
```

#### 응답
```json
{
  "data": {
    "reply": "20평 거실에 모던 미니멀 스타일로 3가지 배치안을 만들었습니다.",
    "intent": "auto_furnish",
    "actions": [
      {
        "type": "auto_furnish",
        "variants": [
          {
            "name": "A안: 미니멀 화이트",
            "description": "화이트톤 소파 + 월넛 TV장 + 심플 조명",
            "objects": [
              {
                "assetId": "asset-sofa-modern-01",
                "name": "3인 패브릭 소파 (화이트)",
                "position": { "x": 2500, "y": 0, "z": 1800 },
                "rotation": { "x": 0, "y": 1.5708, "z": 0 },
                "scale": { "x": 1, "y": 1, "z": 1 }
              },
              {
                "assetId": "asset-table-coffee-01",
                "name": "원형 커피테이블",
                "position": { "x": 2500, "y": 0, "z": 2500 },
                "rotation": { "x": 0, "y": 0, "z": 0 },
                "scale": { "x": 1, "y": 1, "z": 1 }
              }
            ],
            "materials": [
              {
                "target": "room-1-floor",
                "materialId": "mat-white-oak"
              },
              {
                "target": "room-1-walls",
                "materialId": "mat-warm-white-paint"
              }
            ],
            "estimated_cost": 3200000
          }
        ]
      }
    ],
    "images": [],
    "estimate": null
  },
  "meta": {
    "credits_used": 1,
    "credits_remaining": 49
  }
}
```

### GET /api/v1/chat/history/:projectId
프로젝트별 대화 기록 조회 (최근 50개, 페이징)

## 3. 대화 에이전트 (라우터)

### 역할
사용자 메시지를 분석하여 적절한 전문 에이전트로 라우팅

### Claude API 호출 (System Prompt)
```
당신은 인테리어 디자인 AI 어시스턴트입니다.
사용자의 메시지를 분석하여 의도(intent)를 파악하세요.

가능한 intent:
- auto_furnish: 가구 자동 배치 요청 ("꾸며줘", "배치해줘", "모던하게")
- restyle_photo: 사진 기반 리모델링 ("이 사진으로", "리모델링", 이미지 첨부)
- modify_object: 개별 가구 수정 ("소파를 바꿔줘", "테이블 옮겨줘")
- estimate: 견적 요청 ("견적서", "비용", "얼마")
- budget_optimize: 예산 맞춤 ("예산 1500만원", "저렴하게")
- share: 공유 요청 ("보내줘", "공유", "링크")
- general: 일반 대화/질문

현재 프로젝트 정보:
- 방 목록: {rooms}
- 배치된 가구: {objects}
- 총 면적: {total_area}m²

JSON으로 응답:
{
  "intent": "auto_furnish",
  "params": {
    "style": "모던 미니멀",
    "room": "거실",
    "budget": null
  },
  "reply_preview": "모던 미니멀 스타일로 거실을 꾸며드릴게요."
}
```

## 4. 배치 에이전트

### 역할
도면 분석 → 카탈로그 검색 → 가구 배치 규칙 적용 → 3가지 안 생성

### 처리 흐름
```
1. 도면 데이터 수신 (방 크기, 창문 위치, 동선)
2. 스타일 해석 (Claude API: "모던 미니멀" → 가구 태그 목록)
3. 카탈로그 DB 검색 (태그 + 예산 범위 + 크기 제약)
4. 배치 규칙 적용:
   - 소파: 벽면 배치, 창문 쪽 피함, TV 맞은편
   - 테이블: 소파 앞 중앙, 간격 400~600mm
   - TV장: 벽면 배치, 소파 맞은편
   - 조명: 천장 중앙 또는 코너
   - 동선: 최소 600mm 통로 확보
5. 3가지 변형 생성 (색상톤/가구 조합/배치 패턴 변경)
6. 예상 비용 계산 (카탈로그 가격 합산)
```

### Claude API 호출 (배치 규칙 생성)
```
당신은 인테리어 배치 전문가입니다.

방 정보:
- 크기: {width}mm x {depth}mm
- 높이: {height}mm
- 창문: {windows} (위치와 크기)
- 문: {doors} (위치)
- 용도: {room_name}

스타일: {style}
예산: {budget}원 (null이면 제한 없음)

사용 가능한 가구 목록:
{available_assets_json}

아래 JSON 형식으로 3가지 배치안을 생성하세요:
{
  "variants": [
    {
      "name": "안 이름",
      "description": "간단한 설명",
      "objects": [
        {
          "assetId": "카탈로그 ID",
          "position": { "x": mm, "y": 0, "z": mm },
          "rotation": { "x": 0, "y": 라디안, "z": 0 }
        }
      ],
      "materials": [
        { "target": "방ID-floor", "materialId": "마감재ID" }
      ]
    }
  ]
}

배치 규칙:
1. 동선 최소 600mm 확보
2. 가구 간 간격 최소 400mm
3. 소파는 창문 반대편 벽면
4. 식탁은 주방 가까이
5. 침대는 문에서 가장 먼 벽면
```

## 5. 이미지 에이전트

### 역할
고객 사진 → 공간 분석 → 리모델링 시안 이미지 생성

### 처리 흐름
```
1. 사진 수신
2. Claude Vision API: 사진 분석
   - 공간 유형 (거실/침실/주방 등)
   - 현재 스타일 판단
   - 가구/구조물 인식
   - 공간 크기 추정
3. 스타일 프롬프트 생성 (4가지: 북유럽/모던/클래식/내추럴)
4. Stability AI API 호출: 각 스타일로 이미지 생성
5. 결과 이미지 4장 반환
```

### Claude Vision 프롬프트
```
이 인테리어 사진을 분석해주세요.

JSON으로 응답:
{
  "room_type": "거실",
  "current_style": "미니멀",
  "dimensions_estimate": { "width_m": 5, "depth_m": 4 },
  "furniture": ["소파", "TV장", "커피테이블"],
  "wall_color": "화이트",
  "floor_type": "원목",
  "natural_light": "좋음",
  "suggestions": "남향 창이 크므로 밝은 톤이 적합"
}
```

### Stability AI 프롬프트 (예시)
```
Interior design of a {room_type}, {style} style,
{width}m x {depth}m room, {floor_type} flooring,
{wall_color} walls, natural daylight from large window,
professional interior photography, 4K quality
```

## 6. 견적 에이전트

### 역할
3D 씬 데이터 → 자재 목록(BOM) 추출 → 단가 적용 → 견적서 PDF

### BOM 추출 로직
```python
def extract_bom(scene_data):
    items = []
    
    # 1. 바닥재: 각 방의 면적 × 마감재
    for room in scene_data.rooms:
        area_m2 = polygon_area_m2(room.polygon)
        items.append({
            "category": "flooring",
            "name": materials[room.floor_material].name,
            "quantity": area_m2 * 1.1,  # 10% 여유
            "unit": "m²"
        })
    
    # 2. 벽지/페인트: 벽 면적 합산
    for wall in scene_data.walls:
        area_m2 = wall_length(wall) * wall.height / 1_000_000
        items.append({
            "category": "paint",
            "name": materials[wall.material_inner].name,
            "quantity": area_m2,
            "unit": "m²"
        })
    
    # 3. 가구: 배치된 오브젝트 목록
    for obj in scene_data.objects:
        asset = assets[obj.asset_id]
        items.append({
            "category": "furniture",
            "name": asset.name,
            "quantity": 1,
            "unit": "개",
            "unit_price": asset.price
        })
    
    # 4. 시공비: 면적 기반
    total_area = sum(polygon_area_m2(r.polygon) for r in scene_data.rooms)
    items.append({
        "category": "labor",
        "name": "시공 인건비",
        "quantity": total_area,
        "unit": "m²"
    })
    
    return items
```

### 견적 계산
```python
def calculate_estimate(bom_items, price_catalog, margin_rate=0.15):
    material_cost = 0
    labor_cost = 0
    
    for item in bom_items:
        price = price_catalog.get_price(item.category, item.name)
        cost = item.quantity * price.unit_price
        
        if item.category == "labor":
            labor_cost += cost
        else:
            material_cost += cost
    
    subtotal = material_cost + labor_cost
    margin = subtotal * margin_rate
    total = subtotal + margin
    
    return {
        "material_cost": material_cost,
        "labor_cost": labor_cost,
        "margin": margin,
        "total": total,
        "items": bom_items  # 상세 내역
    }
```

### PDF 견적서 구조
```
┌─────────────────────────────────────────┐
│  [로고] SpacePlanner 견적서              │
│  프로젝트: {project_name}               │
│  고객: {client_name}                    │
│  날짜: {date}                           │
├─────────────────────────────────────────┤
│  [3D 렌더링 이미지]                      │
│                                         │
├─────────────────────────────────────────┤
│  ■ 자재비 내역                           │
│  바닥재 - 오크원목 - 22m² - @35,000 ...  │
│  벽지 - 화이트 - 45m² - @12,000 ...     │
│  소파 - 3인 패브릭 - 1개 - 890,000 ...  │
│  ...                                    │
│  소계: 12,000,000원                     │
├─────────────────────────────────────────┤
│  ■ 시공비 내역                           │
│  인건비 - 22m² - @150,000 = 3,300,000   │
│  철거비 - 1식 - 500,000                 │
│  소계: 3,800,000원                      │
├─────────────────────────────────────────┤
│  자재비: 12,000,000원                   │
│  시공비: 3,800,000원                    │
│  관리비(15%): 2,370,000원               │
│  ─────────────────                      │
│  합계: 18,170,000원                     │
├─────────────────────────────────────────┤
│  ※ 본 견적은 참고용이며 현장 실측 후     │
│    변경될 수 있습니다.                   │
│  담당: {company_name} / {contact}        │
└─────────────────────────────────────────┘
```

## 7. 공유 에이전트

### 역할
공유 링크 생성, 읽기 전용 3D 뷰어 제공

### 공유 링크 구조
```
https://app.spaceplanner.kr/share/{share_token}
```
- share_token: 32자 랜덤 문자열
- 로그인 불필요
- 3D 뷰만 가능 (편집 불가)
- 카메라 컨트롤만 가능 (OrbitControls)
- 견적서 PDF 다운로드 버튼 (선택적)

## 8. AI 사용량 관리

### 요금제별 한도
| 요금제 | AI 크레딧/월 | 이미지 생성/월 |
|-------|------------|-------------|
| Free | 5회 | 2장 |
| Starter | 50회 | 20장 |
| Pro | 무제한 | 100장 |
| Enterprise | 무제한 | 무제한 |

### 크레딧 계산
- 텍스트 대화 1회 = 1크레딧
- 자동 배치 1회 = 2크레딧 (Claude API 2번 호출)
- 이미지 생성 1회 = 3크레딧 (Vision + 생성 API)
- 견적서 생성 = 1크레딧

### 비용 추정 (서버 측)
- Claude API: ~$0.01/대화 (input+output 평균)
- Stability AI: ~$0.03/이미지
- 월 1,000명 Pro 사용자 기준: ~$3,000/월 API 비용
- SaaS 매출 대비 충분히 감당 가능
