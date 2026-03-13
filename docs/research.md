# Research: SpacePlanner MVP

## 1. 분석 대상 및 작동 원리

### 1.1 프로젝트 목적
인테리어 시공업체가 고객 상담 시 3D 시뮬레이션으로 완성 모습을 보여주고,
AI 챗봇이 디자인 제안 + 리모델링 시안 + 견적서까지 자동으로 처리하여
시공 수주율을 2~3배 향상시키는 구독형 SaaS 플랫폼.

### 1.2 벤치마크: Archisketch 분석 결과

#### 회사 정보
- 2014년 설립 (주식회사 아키드로우 → 2024년 아키스케치로 변경)
- 직원 약 27명, B2BC SaaS
- 고객: 오늘의집, 퍼시스, 신세계까사, 일룸, 롯데하이마트 등

#### 확인된 기술 스택 (채용공고/LinkedIn 기반)
- Frontend: React (Vite), React-Three-Fiber, Pixi.js
- Backend: Node.js (KoaJS), Java (Spring), TypeScript
- Database: MySQL, MongoDB
- Infrastructure: AWS (S3, CloudFront, Lambda)
- 3D: Three.js, Blender 파이프라인, SKP→OBJ/MTL 변환
- AI: Diffusion 기반 생성형 AI, 세그멘테이션

#### API 구조 (공개 문서 docs.archisketch.com)
- Product 3계층: Modeling → Component → Sale
- Modeling 상태: WAITING → PROCESSING → COMPLETE
- Parametric Component: 크기/색상 파라미터 가구
- Project: CRUD + 렌더링 목록 + 상세(도면+배치)
- Enterprise User: SSO, 조직 관리
- Floor Plan Data: 아파트 도면 검색 API
- Webhook: 견적서 전송

### 1.3 참고 오픈소스 프로젝트

| 프로젝트 | 기술 | 참고할 점 |
|---------|------|----------|
| blueprint3d (furnishup) | Three.js | 2D/3D 구조(core/floorplanner/items/model/three) |
| open3dFloorplan | SvelteKit+Three.js | 140+ 에셋, 마감재 편집기, 버전 히스토리 |
| arcada | React+Pixi.js+Zustand | 커스텀 2D 엔진, Express+MongoDB |
| architect3d | Three.js | blueprint3d 포크, 2D/3D 동기화 |
| threejs-3d-room-designer | React+Three.js | 가구 배치 UI |

### 1.4 핵심 기술 도전과 해법

#### 2D 도면 엔진 (가장 어려움)
- 벽 그리기: Canvas API로 시작점/끝점 지정, 두께 200mm 직사각형으로 표현
- 스냅 시스템: 그리드(100mm), 각도(45°/90°), 포인트(벽 끝점)
- 방 자동 인식: 벽 교차점 그래프 → 최소 사이클 탐색 → 닫힌 영역 = 방
- 참고: blueprint3d의 floorplanner 모듈, arcada의 Pixi.js 엔진

#### 2D → 3D 변환
- 벽: 2D 라인 → BoxGeometry (길이×두께×높이)
- 바닥/천장: 방 polygon → ShapeGeometry
- 문/창문: 벽 메쉬를 여러 조각으로 분할 (CSG 대신 멀티메쉬 방식)
- 참고: blueprint3d의 three 모듈

#### AI 챗봇
- 의도 분석: Claude API에 system prompt로 역할 지정
- 배치 규칙: Claude가 JSON 형태로 가구 배치 데이터 생성
- 이미지 생성: Claude Vision으로 사진 분석 → Stability AI로 시안 생성
- 견적 계산: 3D 씬 데이터에서 BOM 추출 → 단가표 매칭

## 2. 기존 레이어 및 아키텍처 구조

### 우리 프로젝트 아키텍처
```
[Browser] ←HTTPS→ [Next.js Frontend] ←REST→ [FastAPI Backend]
                   │                           │
                   ├─ 2D Canvas (도면)          ├─ PostgreSQL (데이터)
                   ├─ Three.js (3D 뷰)         ├─ Redis (캐시/큐)
                   ├─ AI Chat UI               ├─ S3 (파일)
                   └─ Zustand (상태)            ├─ Claude API (AI)
                                               ├─ Stability AI (이미지)
                                               └─ Celery (비동기)
```

### Backend 계층 구조
```
API Layer (라우터)     → api/v1/auth.py, projects.py, chat.py ...
Service Layer (비즈니스) → services/project_service.py, chat_service.py ...
Repository Layer (DB)  → repositories/project_repo.py ...
Model Layer (ORM)      → models/user.py, project.py ...
Schema Layer (검증)    → schemas/project.py (Pydantic)
```

## 3. 데이터베이스 설계

### 핵심 테이블
- users: 회원 정보 + OAuth
- organizations: 업체/팀
- projects: 프로젝트 (scene_data JSONB에 전체 도면+배치)
- project_versions: 히스토리 (되돌리기용)
- assets: 3D 가구 모델 (GLTF/GLB URL)
- asset_categories: 카테고리 트리 (가구타입별 + 공간별)
- materials: 마감재 (PBR 텍스처)
- chat_messages: AI 대화 기록
- estimates: 견적서
- price_catalog: 단가표 (업체별)
- subscriptions: 구독 관리
- renders: 렌더링 결과 이미지

### ORM: SQLAlchemy 2.0
- async 지원 (asyncpg)
- 마이그레이션: Alembic (auto-generate)
- JSONB 컬럼: scene_data, actions, items 등

## 4. 중복/재사용 체크
- 이 프로젝트는 신규 개발이므로 기존 코드 없음
- packages/engine은 프레임워크 무관 순수 TypeScript → 재사용성 최대화
- shadcn/ui 컴포넌트 → UI 중복 개발 방지

## 결론
MVP 핵심은 3가지: (1) 2D 도면 엔진 (2) 3D 뷰어 (3) AI 챗봇
가장 어려운 것은 2D 도면 엔진이며, 오픈소스 참고가 필수.
AI 챗봇은 Claude API 기반으로 상대적으로 빠르게 구현 가능.
