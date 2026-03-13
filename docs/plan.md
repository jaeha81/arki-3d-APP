# Plan: SpacePlanner MVP - Sprint 1 (주 1~2)

## 목표
프로젝트 기반 인프라 구축 + 인증 시스템 + 프로젝트 대시보드
이 스프린트가 끝나면: 로그인 → 프로젝트 생성/목록/삭제가 동작

## 1. 구현 접근 방식

### 모노레포 구조 (Turborepo)
packages/web, packages/api, packages/engine 3개 패키지.
engine은 순수 TypeScript로 프레임워크 의존 없이 구현.
web에서 engine을 import해서 사용.

### research.md 반영
- Archisketch: React + R3F + Pixi.js 확인 → 같은 조합 채택
- Archisketch API: RESTful, 도메인별 분리 → 같은 패턴 적용
- SSO/Enterprise: MVP에서 제외, 기본 JWT + Google OAuth만

## 2. 수정/추가될 파일

### packages/web (Frontend)
```
packages/web/
├── app/
│   ├── layout.tsx                # 루트 레이아웃 + 테마 프로바이더
│   ├── page.tsx                  # 랜딩 (→ /projects로 리다이렉트)
│   ├── globals.css               # Tailwind + 커스텀 CSS 변수
│   ├── (auth)/
│   │   ├── login/page.tsx        # 로그인 페이지
│   │   └── register/page.tsx     # 회원가입 페이지
│   ├── (dashboard)/
│   │   ├── layout.tsx            # 대시보드 레이아웃 (사이드바/헤더)
│   │   └── projects/page.tsx     # 프로젝트 목록 (메인 화면)
│   └── editor/
│       └── [projectId]/page.tsx  # 에디터 (Sprint 2~에서 구현)
├── components/
│   ├── ui/                       # shadcn/ui 설치 컴포넌트들
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── ProjectCard.tsx       # 프로젝트 카드 (썸네일+이름+날짜)
│   │   ├── ProjectGrid.tsx       # 프로젝트 그리드 뷰
│   │   ├── CreateProjectDialog.tsx
│   │   └── DashboardHeader.tsx
│   ├── layout/
│   │   ├── ThemeToggle.tsx       # 다크모드 전환 버튼
│   │   └── UserMenu.tsx          # 사용자 메뉴 (로그아웃 등)
│   └── providers/
│       ├── ThemeProvider.tsx
│       └── QueryProvider.tsx     # TanStack Query
├── lib/
│   ├── api/
│   │   └── client.ts            # axios 인스턴스 (baseURL, 인터셉터)
│   ├── stores/
│   │   └── auth-store.ts        # Zustand: 인증 상태
│   └── hooks/
│       ├── use-auth.ts           # 로그인/로그아웃/회원가입
│       └── use-projects.ts       # 프로젝트 CRUD (TanStack Query)
├── next.config.js
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

### packages/api (Backend)
```
packages/api/
├── app/
│   ├── main.py                   # FastAPI 앱 + CORS + 라우터 등록
│   ├── config.py                 # 환경변수 설정 (Pydantic Settings)
│   ├── database.py               # SQLAlchemy async engine + session
│   ├── api/
│   │   ├── deps.py               # 공통 의존성 (get_db, get_current_user)
│   │   └── v1/
│   │       ├── auth.py           # POST /register, /login, /refresh, /google
│   │       └── projects.py       # GET/POST/PATCH/DELETE /projects
│   ├── models/
│   │   ├── base.py               # SQLAlchemy Base + 공통 컬럼 mixin
│   │   ├── user.py               # User 모델
│   │   └── project.py            # Project 모델
│   ├── schemas/
│   │   ├── auth.py               # 요청/응답 Pydantic 스키마
│   │   └── project.py
│   ├── services/
│   │   ├── auth_service.py       # 비밀번호 해싱, JWT 생성, OAuth
│   │   └── project_service.py    # 프로젝트 비즈니스 로직
│   └── repositories/
│       ├── user_repo.py          # User DB 접근
│       └── project_repo.py       # Project DB 접근
├── migrations/
│   ├── env.py                    # Alembic 설정
│   └── versions/                 # 마이그레이션 파일들
├── requirements.txt
├── Dockerfile
└── .env.example
```

### 루트
```
spaceplanner/
├── CLAUDE.md
├── docker-compose.yml            # PostgreSQL + Redis + MinIO
├── turbo.json
├── package.json                  # 모노레포 루트
├── .gitignore
└── docs/
    ├── research.md
    └── plan.md
```

## 3. 상세 구현 단계

### Step 1.1: 모노레포 초기화
```bash
# 루트
npm init -y
npm install -D turbo

# turbo.json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "test": {}
  }
}
```
- [x] turbo.json 생성
- [x] 루트 package.json workspaces 설정

### Step 1.2: Next.js 앱 생성
```bash
cd packages
npx create-next-app@latest web --typescript --tailwind --app --src-dir=false --import-alias="@/*"
```
- [x] Next.js 14 App Router 설치 (Next.js 16 + React 19)
- [x] TypeScript + Tailwind CSS 설정 확인
- [x] next.config.ts: transpilePackages에 @spaceplanner/engine 추가

### Step 1.3: shadcn/ui + 디자인 토큰
```bash
cd packages/web
npx shadcn@latest init
npx shadcn@latest add button card dialog input label dropdown-menu avatar toast
```

CSS 변수 (globals.css):
```css
:root {
  --background: 0 0% 100%;        /* #FFFFFF */
  --foreground: 222 47% 11%;      /* #111827 */
  --primary: 221 83% 53%;         /* #2563EB */
  --muted: 220 9% 46%;            /* #6B7280 */
  --accent: 210 40% 96%;          /* #F1F5F9 */
  --border: 220 13% 91%;          /* #E5E7EB */
  --editor-bg: 0 0% 98%;          /* #FAFAFA 에디터 배경 */
  --grid-color: 220 13% 91%;      /* #E5E7EB 그리드 색상 */
}

.dark {
  --background: 222 47% 11%;      /* #1E293B */
  --foreground: 210 40% 96%;      /* #F1F5F9 */
  --primary: 221 83% 53%;
  --muted: 215 14% 34%;
  --accent: 217 33% 17%;
  --border: 217 19% 27%;
  --editor-bg: 222 47% 11%;
  --grid-color: 217 19% 27%;
}
```

폰트: Pretendard (한국어 최적화)
```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
```

- [x] shadcn/ui 초기화 (수동 구현)
- [x] 기본 컴포넌트 설치 (button, card, dialog, input, label, dropdown-menu, avatar, toast)
- [x] CSS 변수 설정 (Light/Dark)
- [x] 폰트 설정 (Pretendard Variable)

### Step 1.4: Light/Dark 테마
- [x] ThemeProvider.tsx (next-themes 사용)
- [x] ThemeToggle.tsx (해/달 아이콘 전환)
- [x] layout.tsx에 ThemeProvider 적용

### Step 1.5: FastAPI + SQLAlchemy + Alembic
```bash
cd packages/api
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn[standard] sqlalchemy[asyncio] asyncpg alembic
pip install pydantic-settings python-jose[cryptography] passlib[bcrypt]
pip install python-multipart httpx
```

main.py 핵심:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SpacePlanner API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], ...)
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(projects_router, prefix="/api/v1/projects", tags=["projects"])
```

- [x] FastAPI 앱 생성 (main.py)
- [x] config.py (환경변수: DB_URL, JWT_SECRET 등)
- [x] database.py (async engine + sessionmaker)
- [x] Alembic 초기화 (migrations/env.py + alembic.ini)

### Step 1.6: Docker Compose
```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: spaceplanner
      POSTGRES_USER: sp_user
      POSTGRES_PASSWORD: sp_pass
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports: ["9000:9000", "9001:9001"]
    volumes: [minio_data:/data]

volumes:
  postgres_data:
  minio_data:
```

- [x] docker-compose.yml 생성 (PostgreSQL 16 + Redis 7 + MinIO)
- [ ] docker compose up -d 확인 (Docker Desktop WSL2 연동 필요)
- [ ] DB 연결 테스트

### Step 1.7: 인증 API

#### User 모델 (models/user.py)
```python
class User(Base):
    __tablename__ = "users"
    id = Column(UUID, primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # OAuth는 null
    name = Column(String(100))
    avatar_url = Column(Text)
    provider = Column(String(20), default="email")  # email/google
    provider_id = Column(String(255))
    role = Column(String(20), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

#### API 엔드포인트
| Method | URL | 설명 |
|--------|-----|------|
| POST | /api/v1/auth/register | 이메일 회원가입 |
| POST | /api/v1/auth/login | 로그인 → JWT 발급 |
| POST | /api/v1/auth/refresh | 토큰 갱신 |
| POST | /api/v1/auth/google | Google OAuth 콜백 |
| GET | /api/v1/auth/me | 현재 사용자 정보 |

- [x] User 모델 + 마이그레이션 (alembic 준비)
- [x] auth_service.py (bcrypt 해싱, JWT 생성/검증)
- [x] auth.py 라우터 (register, login, refresh, me, google)
- [x] deps.py: get_current_user 의존성

### Step 1.8: 인증 UI
- [x] LoginForm.tsx (이메일+비밀번호 + Google 로그인 버튼)
- [x] RegisterForm.tsx (이름+이메일+비밀번호)
- [x] login/page.tsx, register/page.tsx
- [x] auth-store.ts (Zustand: user, token, login/logout 함수)
- [x] api/client.ts (axios: baseURL + JWT 인터셉터)

### Step 1.9: 프로젝트 CRUD API

#### Project 모델 (models/project.py)
```python
class Project(Base):
    __tablename__ = "projects"
    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    thumbnail_url = Column(Text)
    scene_data = Column(JSONB, nullable=False, default={})
    settings = Column(JSONB, default={})
    is_public = Column(Boolean, default=False)
    share_token = Column(String(32), unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

#### API 엔드포인트
| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/v1/projects | 내 프로젝트 목록 |
| POST | /api/v1/projects | 프로젝트 생성 |
| GET | /api/v1/projects/:id | 프로젝트 상세 |
| PATCH | /api/v1/projects/:id | 프로젝트 수정 (이름, 자동저장) |
| DELETE | /api/v1/projects/:id | 프로젝트 삭제 |

- [x] Project 모델 + 마이그레이션 (alembic 준비)
- [x] project_repo.py, project_service.py
- [x] projects.py 라우터 (GET/POST/GET:id/PATCH/DELETE)

### Step 1.10: 프로젝트 대시보드 UI
- [x] DashboardHeader.tsx (로고 + 사용자 메뉴 + 테마 전환)
- [x] ProjectCard.tsx (썸네일 + 이름 + 날짜 + 메뉴)
- [x] ProjectGrid.tsx (카드 그리드, 빈 상태, 로딩 스켈레톤)
- [x] CreateProjectDialog.tsx (이름 입력 → 생성 → /editor/:id로 이동)
- [x] use-projects.ts (TanStack Query: 목록/생성/삭제)
- [x] projects/page.tsx (대시보드 메인 페이지)

## 4. 디자인 방향

### 전체 톤
- 깨끗한 화이트 베이스 (Light), 딥 다크 (Dark)
- 장식적 효과 최소화, 생산성 도구답게 간결
- 그림자 최소, 테두리선 연하게
- 둥근 모서리: 8px (카드), 6px (버튼), 4px (입력)
- 모션: 150ms ease-out (패널 전환만)

### 대시보드 UI 참고
- 아키스케치 대시보드 스타일: 카드 그리드, 큰 + 버튼
- Figma/Notion 대시보드 참고: 깔끔한 레이아웃

## 5. 의존성
- 이 Sprint는 다른 Sprint에 의존하지 않음 (첫 번째)
- Sprint 2(에디터 레이아웃)는 이 Sprint 완료 후 시작

---

계획이 완료되었습니다. 검토 후 메모를 남겨주시거나 구현 승인을 해주세요.
아직 코드를 수정하지는 않았습니다.
