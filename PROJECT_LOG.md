# SpacePlanner MVP — 작업 로그

> 마지막 업데이트: 2026-03-13  
> 상태: **Sprint 1~8 코드 완성 ✅ / 빌드 검증 완료 ✅ / 버그 수정 완료 ✅ / 문서화 완료 ✅ / 런타임 테스트 + 배포 필요 ⚠️**

---

## 프로젝트 개요

**경로**: `c:/ai프로젝트/3d제안용디자인/files/`  
**서비스명**: SpacePlanner — 인테리어 시공 수주용 3D 공간 설계 + AI 챗봇  
**구조**: Turborepo 모노레포

| 패키지            | 기술                                      | 역할            |
| ----------------- | ----------------------------------------- | --------------- |
| `packages/web`    | Next.js 16 + TypeScript + shadcn/ui + R3F | 프론트엔드      |
| `packages/api`    | FastAPI + Python + PostgreSQL + Redis     | 백엔드 API      |
| `packages/engine` | TypeScript (순수)                         | 2D/3D 도면 엔진 |

**AI 구독 모델**: Claude / Gemini / GPT 멀티 프로바이더, 요금제별 기능 제한

---

## 전체 완성도 (2026-03-13 기준)

| 영역             | 진행률 | 상태                              |
| ---------------- | ------ | --------------------------------- |
| 코드 작성        | 100%   | Sprint 1~8 전부 작성 완료         |
| TypeScript 빌드  | 100%   | engine + web 빌드 에러 0          |
| 코드 버그 수정   | 100%   | migration, import, 타입 전부 수정 |
| 문서화           | 100%   | README.md + .env.example 완료     |
| Git 저장소       | 0%     | git init 안 됨, GitHub 미연결     |
| 인프라 실행 검증 | 0%     | Docker 미실행                     |
| DB 마이그레이션  | 0%     | Alembic 미실행                    |
| 런타임 테스트    | 0%     | 서버 실행 후 API 호출 검증 안 함  |
| E2E 테스트       | 0%     | Playwright 미실행                 |
| 실제 배포        | 0%     | Vercel/Railway 미배포             |

---

## 스프린트 진행 현황

### ✅ Sprint 1 — 기반 인프라 + 인증 + 대시보드

- Turborepo 모노레포 초기화 (`turbo.json`, `package.json`)
- Docker Compose 설정 (`docker-compose.yml`, `docker-compose.prod.yml`)
- **Frontend**: Next.js + shadcn/ui + Light/Dark 테마
  - 로그인/회원가입 페이지 (`app/(auth)/login`, `register`)
  - 프로젝트 대시보드 (`app/(dashboard)/projects`)
  - 컴포넌트: `LoginForm`, `RegisterForm`, `DashboardHeader`, `ProjectCard`, `ProjectGrid`, `CreateProjectDialog`
  - 훅: `use-auth`, `use-projects`
  - 스토어: `auth-store`, `editor-store`
- **Backend**: FastAPI + PostgreSQL + SQLAlchemy + Alembic
  - 인증 API (`/api/v1/auth`)
  - 프로젝트 CRUD API (`/api/v1/projects`)
  - DB 모델: `user`, `project`, `subscription` 등
  - Railway 배포 설정 (`railway.json`)

### ✅ Sprint 2 — 에디터 레이아웃 + 에셋 API

- **Frontend**: 에디터 화면 레이아웃 완성
  - `EditorLayout`, `EditorToolbar`, `EditorTopbar`, `EditorStatusBar`
  - `AssetPanel`, `AssetCard` — 에셋 카탈로그 패널
  - `PropertiesPanel` — 선택된 요소 속성 패널
  - `ChatPanel` — AI 챗봇 패널 (UI)
  - `ViewToggle` — 2D/3D/Split 전환
  - `ThemeToggle`, `UserMenu`
- **Backend**: 에셋/마감재 API
  - `/api/v1/assets`, `/api/v1/asset_categories`, `/api/v1/materials`
  - DB 모델: `asset`, `material`

### ✅ Sprint 3 — 2D 도면 엔진 (핵심)

- **Engine 패키지** (`packages/engine/src/`):
  - `FloorPlanEngine.ts` — 핵심 도면 데이터 모델 + 이벤트 관리
  - `WallTool.ts` — 벽 그리기 도구 (클릭→드래그)
  - `SnapEngine.ts` — 그리드/각도/포인트 스냅
  - `RoomDetector.ts` — 닫힌 영역 자동 인식
  - `DimensionEngine.ts` — 자동 치수선
  - `UndoManager.ts` — Ctrl+Z/Y 히스토리
  - `types/` — floor-plan, geometry, scene 타입 정의
  - `utils/` — id 생성, math 유틸
- **Frontend**: `FloorPlanCanvas.tsx` — 캔버스 2D 렌더링 (그리드, Pan/Zoom)

### ✅ Sprint 4 — 3D 뷰어 엔진

- **Engine 패키지**:
  - `three/SceneBuilder.ts` — 2D 도면 → 3D 메쉬 변환 (BoxGeometry)
  - `three/index.ts`
- **Frontend**: React Three Fiber (R3F) 기반 3D 뷰어
  - `ThreeViewer3D.tsx` — R3F Canvas 기본 셋업 (OrbitControls, 조명)
  - `scene/WallMesh.tsx`, `FloorMesh.tsx`, `FurnitureMesh.tsx` — 3D 메쉬
  - `scene/SceneGrid.tsx`, `TransformGizmo.tsx` — 그리드 + 이동/회전 기즈모
  - `EditorCanvas.tsx` — 2D/3D 통합 캔버스
  - 훅: `use-floor-plan-scene` — 씬 상태 관리

### ✅ Sprint 5 — AI 챗봇 (핵심)

- **Backend**: AI Chat API
  - `/api/v1/chat` — 대화 API (Claude API 연동)
  - `chat_message` 모델 + `chat_repo`
  - AI 배치 규칙 엔진 (의도 분석 → 가구 배치 JSON 생성)
  - AI 서비스: `conversation_agent`, `furnish_agent`, `image_agent`, `placement_rules`
- **Frontend**:
  - `ChatPanel.tsx` — 채팅 UI + 이미지 미리보기 + 배치안 선택
  - `FurnishVariantCard.tsx` — AI 생성 배치안 카드
  - `ImagePreviewGrid.tsx` — 시안 이미지 그리드
  - 훅: `use-chat`
  - API 클라이언트: `lib/api/chat.ts`

### ✅ Sprint 6 — 견적 시스템 + 저장/공유

- **Backend**:
  - `/api/v1/estimates` — 견적 CRUD
  - `/api/v1/price_catalog` — 단가표 관리
  - `/api/v1/share` — 공유 링크 생성 (읽기 전용)
  - `/api/v1/project_versions` — 버전 저장
  - 서비스: `estimate_engine`, `pdf_generator`
  - 모델: `estimate`, `project_version`
- **Frontend**:
  - `EstimatePanel.tsx` — 견적 패널
  - `ShareDialog.tsx` — 공유 링크 다이얼로그
  - `app/share/[token]/page.tsx` — 공유 읽기 전용 뷰어
  - 훅: `use-estimate`, `use-autosave`, `use-materials`
  - API 클라이언트: `lib/api/estimate.ts`

### ✅ Sprint 7 — 구독 시스템 + 관리자

- **Backend**: `/api/v1/subscriptions` — 요금제 관리
- **Frontend**:
  - `app/(dashboard)/settings/billing/page.tsx` — 결제/구독 설정
  - `settings/PlanCard.tsx`, `UsageBar.tsx`
  - `app/admin/page.tsx`, `admin/users/page.tsx` — 관리자 대시보드
  - `admin/StatsCards.tsx`, `admin/UserTable.tsx`
  - `app/admin/layout.tsx`
  - 훅: `use-subscription`
  - API 클라이언트: `lib/api/subscription.ts`

### ✅ Sprint 8 — 최적화 + 에러 처리 + 배포 설정

- **Frontend**:
  - `components/ui/error-boundary.tsx` — React Error Boundary
  - `components/ui/loading-skeleton.tsx` — 스켈레톤 로딩
  - `components/ui/empty-state.tsx` — 빈 상태 컴포넌트
  - `app/error.tsx` — Next.js 글로벌 에러 페이지
  - `app/not-found.tsx` — 404 페이지
  - `app/loading.tsx` — 글로벌 로딩
  - `lib/utils/error-handler.ts` — 에러 처리 유틸
  - `playwright.config.ts` — Playwright 설정
  - `e2e/` — E2E 테스트 파일들
  - `vercel.json` — Vercel 배포 설정
- **Backend**:
  - `app/middleware/error_handler.py` — FastAPI 글로벌 에러 핸들러
  - `app/middleware/logging_middleware.py` — 요청/응답 로깅
  - `Dockerfile` — 멀티스테이지 빌드
- **인프라**:
  - `docker-compose.prod.yml` — 프로덕션 Docker Compose
  - `railway.json` — Railway 배포 설정

---

## ✅ 2026-03-13 최종 개발 완료 작업

### 빌드 검증

- **Engine** (`tsc`) — 성공, 타입 에러 0
- **Web** (`next build`) — 성공, 11개 라우트 생성 (정적 9 + 동적 2)
- **API** — 12개 라우터, 8개 모델, 7개 레포, 6개 서비스 구조 확인

### 버그 수정

| 파일                                 | 수정 내용                                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------------------------- |
| `packages/api/=0.34.0`               | pip 아티팩트 정크 파일 삭제                                                               |
| `app/models/__init__.py`             | chat_message, estimate, project_version, subscription 임포트 추가                         |
| `migrations/env.py`                  | 전체 8개 모델 임포트 추가 (Alembic 전체 테이블 감지)                                      |
| `migrations/versions/001_initial.py` | 누락된 초기 마이그레이션 신규 생성 (users, projects, asset_categories, assets, materials) |
| `app/models/project.py`              | TYPE_CHECKING + `from __future__ import annotations` (순환 참조 해결)                     |
| `app/models/project_version.py`      | TYPE_CHECKING + `from __future__ import annotations` (순환 참조 해결)                     |
| `app/database.py`                    | 반환 타입 `AsyncGenerator[AsyncSession, None]` 수정                                       |
| `app/middleware/error_handler.py`    | 핸들러 시그니처 `Exception` 기반 변경 (Pyright 호환)                                      |

### 신규 파일

| 파일                              | 용도                                                            |
| --------------------------------- | --------------------------------------------------------------- |
| `packages/web/.env.local.example` | 프론트엔드 환경변수 템플릿                                      |
| `README.md`                       | 종합 사용 가이드 (설치 → 실행 → 사용법 → API → 배포 → 문제해결) |

---

## ✅ 2026-03-18 추가 완료 작업

### 런타임 검증 완료

- Docker (PG/Redis/MinIO) healthy
- 14개 DB 테이블 생성 (Alembic 마이그레이션)
- 회원가입/로그인/프로젝트/에셋 API 정상 동작
- 프론트엔드 (localhost:3000) 전 페이지 200 OK

### 가구 GLB 3D 모델 50종 생성

- `packages/web/public/models/*.glb` — 50개 프로시저럴 박스 GLB (카테고리별 색상)
- `packages/web/public/thumbnails/*.png` — 300x300 아이소메트릭 썸네일
- DB `model_url` / `thumbnail_url` 업데이트 완료
- 생성 스크립트: `packages/api/scripts/generate_glb_models.py`

### 토스페이먼츠 결제 연동

- **DB**: `payments` 테이블 추가, `subscriptions`에 `toss_customer_key/billing_key` 필드
- **백엔드**: `POST /api/v1/payments/prepare`, `POST /api/v1/payments/confirm`, `GET /api/v1/payments/history`
- **프론트엔드**:
  - `/settings/billing` — 구독 플랜 카드 + 토스페이먼츠 SDK 결제 + 결제 내역 테이블
  - `/payment/success` — 결제 확인 후 구독 업그레이드
  - `/payment/fail` — 실패 안내
- 테스트 키: `TOSS_CLIENT_KEY=test_ck_...` / `TOSS_SECRET_KEY=test_sk_...`

### 배포 설정 완료

- `railway.json` — Dockerfile 경로 `packages/api/Dockerfile`로 수정
- `packages/api/Dockerfile` — 모노레포 루트 컨텍스트 기준 COPY 수정
- `packages/web/vercel.json` — 모노레포 빌드 커맨드 + GLB/썸네일 캐시 헤더
- `packages/api/.env.production.example` — Toss 결제 키 추가 (Stripe 제거)
- `packages/web/.env.production.example` — 프론트 프로덕션 env 신규 생성
- **빌드 검증**: `next build` 성공 — 13개 라우트 (정적 11 + 동적 2)

## ⚠️ 남은 작업

### 배포 (수동 진행 필요)

```bash
# Vercel (packages/web 루트 디렉토리로 설정)
cd packages/web && npx vercel --prod

# Railway (환경변수 설정 후)
# DATABASE_URL, REDIS_URL, JWT_SECRET, TOSS_SECRET_KEY, ANTHROPIC_API_KEY 설정
railway up
```

### 배포 후 작업

- Sentry + PostHog 모니터링 연동
- 실제 도메인 SSL 설정
- 베타 테스트

---

## 참고 문서

| 문서                 | 경로                                         |
| -------------------- | -------------------------------------------- |
| 종합 사용 가이드     | `README.md`                                  |
| 전체 스프린트 로드맵 | `docs/sprint-roadmap.md`                     |
| DB 스키마            | `docs/db-schema.md`                          |
| AI 챗봇 명세         | `docs/ai-chatbot-spec.md`                    |
| Sprint 1~8 상세 계획 | `docs/sprint-1-plan.md` ~ `sprint-8-plan.md` |
| Claude Code 지침     | `CLAUDE.md`                                  |

---

## Claude Code에서 작업 재개하는 방법

```
이 프로젝트의 PROJECT_LOG.md를 읽었습니다.
SpacePlanner MVP — 코드 완성 + 빌드 검증 + 버그 수정 + 문서화 완료 상태.
[원하는 작업]을 진행해주세요.
```
