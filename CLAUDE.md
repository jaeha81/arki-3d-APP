# SpacePlanner - 인테리어 시공 수주용 3D + AI 챗봇 플랫폼

## 프로젝트 한줄 요약
시공업체가 고객에게 "당신의 집이 이렇게 바뀝니다"를 3D로 보여주고, AI 챗봇이 디자인 제안 + 견적까지 자동으로 처리하는 구독형 SaaS

## 기술 스택

### Frontend
- Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- Three.js + React Three Fiber (@react-three/fiber) + Drei (@react-three/drei)
- 2D 도면 편집: Canvas API
- 상태관리: Zustand (클라이언트) + TanStack Query (서버 데이터)
- UI 컴포넌트: shadcn/ui + Radix Primitives
- 폰트: Pretendard (한국어) + JetBrains Mono (치수/코드)

### Backend
- FastAPI (Python 3.12+)
- SQLAlchemy 2.0 + Alembic (ORM + 마이그레이션)
- PostgreSQL 16+
- Redis (캐시 + Celery 브로커)
- Celery (비동기 작업: 이미지 생성, PDF 생성, 모델 변환)

### AI
- Claude API (대화 분석, 스타일 제안, 배치 규칙 생성, 견적 로직)
- Claude Vision API (고객 사진 공간 구조 분석)
- Stability AI API (리모델링 시안 이미지 생성)

### 인프라
- Storage: S3 호환 (MinIO 로컬 / AWS S3 프로덕션) + CloudFront CDN
- Auth: NextAuth.js (JWT Access 15min + Refresh 7d, HttpOnly Cookie)
- 소셜 로그인: Google OAuth 2.0 (추후 Kakao, Naver)

## 프로젝트 구조
```
spaceplanner/
├── CLAUDE.md                    ← 이 파일
├── packages/
│   ├── web/                     # Next.js Frontend
│   ├── api/                     # FastAPI Backend  
│   └── engine/                  # 순수 TypeScript 2D/3D 엔진
├── docs/                        # 개발 문서
│   ├── research.md
│   └── plan.md
├── docker-compose.yml
└── turbo.json
```

## 좌표/단위 규칙
- 단위: mm (밀리미터). 1 Three.js unit = 1mm
- 좌표계: Y-up (Three.js 기본)
- 벽 기본 두께: 200mm, 높이: 2700mm
- 문 기본: 폭 900mm, 높이 2100mm
- 창문 기본: 폭 1200mm, 높이 1200mm, 하부 900mm

## 코딩 규칙
- TypeScript strict mode, any 사용 금지
- 파일명: kebab-case (예: floor-plan-engine.ts)
- 컴포넌트: PascalCase (예: FloorPlanCanvas.tsx)
- API 응답 형식: { data, meta, errors } envelope
- API URL: /api/v1/ prefix
- 커밋: conventional commits (feat:, fix:, refactor: 등)

## 워크플로우 (필수)
1. 모든 작업은 research.md 리서치부터 시작
2. plan.md 계획 수립 후 승인 대기
3. 승인 후 구현, 완료 시 plan.md에 [x] 표시
4. 하나의 파일은 하나의 에이전트만 수정

## AI 챗봇 아키텍처
```
사용자 메시지 → FastAPI /api/v1/chat/message
                    ↓
              대화 에이전트 (Claude API: 의도 분석)
                    ↓ (라우팅)
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
배치 에이전트   이미지 에이전트   견적 에이전트
(가구 자동배치)  (시안 이미지)    (자재+시공비)
    ↓               ↓               ↓
 3D 씬 업데이트   이미지 URL     PDF 생성
```

## 에이전트별 파일 소유권
- Agent 1 (RESEARCH): docs/research.md 전담
- Agent 2 (PLAN): docs/plan.md 전담
- Agent 3 (FRONTEND): packages/web/**, packages/engine/**
- Agent 4 (BACKEND): packages/api/**
- Agent 5 (QA): 테스트 파일, 타입 체크, 빌드 검증
