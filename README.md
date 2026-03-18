# SpacePlanner

인테리어 시공업체를 위한 3D 공간 설계 + AI 챗봇 SaaS 플랫폼

고객에게 "당신의 집이 이렇게 바뀝니다"를 3D로 보여주고, AI가 디자인 제안부터 견적까지 자동 처리합니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **2D 도면 편집** | 벽 그리기, 문/창문 배치, 방 자동 인식, 치수선, Undo/Redo |
| **3D 실시간 뷰어** | 도면 → 3D 자동 변환, 가구 배치, 카메라 컨트롤 |
| **AI 챗봇** | "모던하게 꾸며줘" → 가구 자동 배치, 스타일 제안 |
| **AI 이미지 생성** | 고객 사진 분석 + 리모델링 시안 이미지 |
| **자동 견적** | 자재+시공비 산출, PDF 견적서 생성 |
| **공유 링크** | 읽기 전용 3D 뷰어 링크 생성 |
| **구독 시스템** | Free / Starter / Pro / Enterprise 요금제 |
| **관리자 대시보드** | 사용자 관리, 통계, 에셋 관리 |

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| **3D 엔진** | Three.js + React Three Fiber + Drei |
| **상태 관리** | Zustand (클라이언트), TanStack Query (서버) |
| **Backend** | FastAPI (Python 3.12+), SQLAlchemy 2.0, Alembic |
| **Database** | PostgreSQL 16, Redis 7 |
| **AI** | Claude API (대화/배치), Stability AI (이미지) |
| **Storage** | MinIO (개발) / AWS S3 (프로덕션) |
| **빌드** | Turborepo 모노레포 |

---

## 프로젝트 구조

```
files/
├── packages/
│   ├── web/          # Next.js 프론트엔드
│   ├── api/          # FastAPI 백엔드
│   └── engine/       # 순수 TypeScript 2D/3D 엔진
├── docs/             # 설계 문서
├── docker-compose.yml
├── docker-compose.prod.yml
├── turbo.json
└── README.md
```

---

## 시작하기

### 사전 요구사항

- **Node.js** 20 이상 + **npm** 10 이상
- **Python** 3.11 이상
- **Docker Desktop** (PostgreSQL, Redis, MinIO 실행용)

### 1. 의존성 설치

```bash
cd files

# Node 패키지 설치 (Frontend + Engine)
npm install

# Python 가상환경 + 패키지 설치 (Backend)
cd packages/api
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..
```

### 2. 환경 변수 설정

```bash
# Backend 환경 변수
cp packages/api/.env.example packages/api/.env

# Frontend 환경 변수
cp packages/web/.env.local.example packages/web/.env.local
```

`packages/api/.env` 주요 항목:

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `DATABASE_URL` | `postgresql+asyncpg://sp_user:sp_pass@localhost:5432/spaceplanner` | PostgreSQL 접속 |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis 접속 |
| `JWT_SECRET` | (변경 필수) | JWT 서명 키 |
| `FRONTEND_URL` | `http://localhost:3000` | CORS 허용 URL |

AI 기능을 사용하려면 `ANTHROPIC_API_KEY`를 `.env`에 추가하세요:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. 인프라 실행 (Docker)

```bash
docker-compose up -d
```

실행되는 서비스:

| 서비스 | 포트 | 용도 |
|--------|------|------|
| PostgreSQL | 5432 | 메인 데이터베이스 |
| Redis | 6379 | 캐시 + 비동기 작업 브로커 |
| MinIO | 9000 (API) / 9001 (콘솔) | S3 호환 파일 스토리지 |

상태 확인:

```bash
docker-compose ps
```

### 4. 데이터베이스 마이그레이션

```bash
cd packages/api
source venv/bin/activate
alembic upgrade head
```

### 5. 기본 데이터 시딩 (선택)

가구 에셋 50개 + 마감재 25개를 DB에 등록합니다:

```bash
cd packages/api
python scripts/seed_assets.py
```

### 6. 개발 서버 실행

**방법 A — Turborepo로 한번에** (Frontend만):

```bash
cd files
npm run dev
```

**방법 B — 개별 실행** (Frontend + Backend):

```bash
# 터미널 1: Backend
cd packages/api
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# 터미널 2: Frontend
cd packages/web
npm run dev
```

### 7. 접속

| 서비스 | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API 문서 (Swagger) | http://localhost:8000/api/docs |
| Backend API 문서 (ReDoc) | http://localhost:8000/api/redoc |
| MinIO 콘솔 | http://localhost:9001 (minioadmin / minioadmin123) |

---

## 사용 방법

### 회원가입 / 로그인

1. http://localhost:3000/register 에서 회원가입
2. http://localhost:3000/login 에서 로그인
3. 대시보드 (http://localhost:3000/projects) 로 이동

### 프로젝트 생성

1. 대시보드에서 **"새 프로젝트"** 클릭
2. 프로젝트 이름 입력 후 생성
3. 에디터 화면으로 자동 이동

### 2D 도면 편집

1. 좌측 도구바에서 **벽 도구** 선택
2. 캔버스에서 클릭 → 드래그로 벽 그리기
3. 벽 위에 **문/창문** 배치
4. 닫힌 영역은 자동으로 **방**으로 인식
5. **치수선**이 자동 표시됨
6. `Ctrl+Z` / `Ctrl+Y` 로 Undo/Redo

### 3D 뷰어

1. 상단의 **뷰 전환** 버튼으로 2D / 3D / Split 모드 전환
2. 3D 모드에서 마우스 드래그로 카메라 회전
3. 스크롤로 줌 인/아웃
4. 가구 선택 후 기즈모로 이동/회전

### AI 챗봇

1. 우측 **채팅 패널** 에서 대화 시작
2. 예시 명령어:
   - "거실을 모던하게 꾸며줘"
   - "침대 옆에 사이드테이블 놓아줘"
   - "이 사진처럼 리모델링해줘" (이미지 첨부)
   - "견적서 뽑아줘"
3. AI가 제안한 배치안 중 마음에 드는 것 선택

### 견적서

1. 우측 **견적 패널** 에서 자재+시공비 확인
2. PDF 다운로드 가능

### 프로젝트 공유

1. 상단 **공유** 버튼 클릭
2. 생성된 링크를 고객에게 전달
3. 고객은 읽기 전용 3D 뷰어로 확인

---

## API 엔드포인트 요약

| 경로 | 설명 |
|------|------|
| `POST /api/v1/auth/register` | 회원가입 |
| `POST /api/v1/auth/login` | 로그인 (JWT 발급) |
| `GET /api/v1/projects` | 프로젝트 목록 |
| `POST /api/v1/projects` | 프로젝트 생성 |
| `GET /api/v1/assets` | 에셋(가구) 카탈로그 |
| `GET /api/v1/materials` | 마감재 목록 |
| `POST /api/v1/chat/message` | AI 챗봇 메시지 |
| `GET /api/v1/estimates/{id}` | 견적 조회 |
| `POST /api/v1/share/{project_id}` | 공유 링크 생성 |
| `GET /api/v1/subscriptions` | 구독 정보 |
| `GET /health` | 서버 상태 확인 |

전체 API 문서는 http://localhost:8000/api/docs 에서 확인하세요.

---

## 구독 요금제

| 요금제 | 월 가격 | AI 크레딧 | 이미지 생성 | 최대 프로젝트 |
|--------|---------|-----------|-------------|---------------|
| Free | 무료 | 5회/월 | 2장/월 | 3개 |
| Starter | 29,000원 | 50회/월 | 20장/월 | 10개 |
| Pro | 79,000원 | 무제한 | 100장/월 | 무제한 |
| Enterprise | 협의 | 무제한 | 무제한 | 무제한 |

---

## 빌드 및 검증

```bash
# 전체 타입 체크
npm run type-check

# 전체 빌드
npm run build

# 전체 린트
npm run lint

# E2E 테스트 (Playwright)
cd packages/web
npx playwright install
npm run e2e
```

---

## 배포

### Frontend → Vercel

`packages/web/vercel.json`이 이미 설정되어 있습니다.

```bash
cd packages/web
npx vercel
```

### Backend → Railway

`railway.json`이 이미 설정되어 있습니다.

```bash
cd packages/api
railway up
```

### Docker (셀프 호스팅)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 개발 규칙

| 항목 | 규칙 |
|------|------|
| TypeScript | strict mode, `any` 사용 금지 |
| 파일명 | kebab-case (`floor-plan-engine.ts`) |
| 컴포넌트명 | PascalCase (`FloorPlanCanvas.tsx`) |
| API 응답 | `{ data, meta, errors }` envelope |
| API URL | `/api/v1/` prefix |
| 커밋 | conventional commits (`feat:`, `fix:`, `refactor:`) |
| 단위 | mm (밀리미터), 1 Three.js unit = 1mm |

---

## 좌표 / 단위 기준

| 항목 | 기본값 |
|------|--------|
| 좌표계 | Y-up (Three.js 기본) |
| 단위 | mm (밀리미터) |
| 벽 두께 | 200mm |
| 벽 높이 | 2,700mm |
| 문 | 900mm x 2,100mm |
| 창문 | 1,200mm x 1,200mm (하부 900mm) |

---

## 문제 해결

### Docker가 시작되지 않을 때

```bash
docker-compose down -v
docker-compose up -d
```

### Alembic 마이그레이션 오류

```bash
cd packages/api
alembic downgrade base
alembic upgrade head
```

### Python 패키지 import 오류

```bash
cd packages/api
source venv/bin/activate
pip install -r requirements.txt
```

### Node 패키지 오류

```bash
cd files
rm -rf node_modules packages/web/node_modules
npm install
```

---

## 📊 개발 현황 <!-- jh-progress -->

| 항목 | 내용 |
|------|------|
| **진행률** | `██████████░░░░░░░░░░` **50%** |
| **레포** | [arki-3d](https://github.com/jaeha81/arki-3d) |

> 진행률: 50%
