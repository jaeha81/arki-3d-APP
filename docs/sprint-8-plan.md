# Sprint 8 계획: 최적화 + 베타 + 출시 (주 21~24)

## 목표
성능 최적화, 에러 처리 강화, E2E 테스트, 배포 환경 설정

## 체크리스트

### Frontend (packages/web)
- [ ] `components/ui/error-boundary.tsx` — React Error Boundary
- [ ] `components/ui/loading-skeleton.tsx` — 스켈레톤 로딩
- [ ] `components/ui/empty-state.tsx` — 빈 상태 컴포넌트
- [ ] `app/error.tsx` — Next.js 글로벌 에러 페이지
- [ ] `app/not-found.tsx` — 404 페이지
- [ ] `app/loading.tsx` — 글로벌 로딩
- [ ] `lib/utils/error-handler.ts` — 에러 처리 유틸
- [ ] `playwright.config.ts` — Playwright 설정
- [ ] `e2e/auth.spec.ts` — 인증 E2E 테스트
- [ ] `e2e/editor.spec.ts` — 에디터 워크플로우 E2E
- [ ] `e2e/dashboard.spec.ts` — 대시보드 E2E
- [ ] `next.config.ts` 최적화 — 번들 분석, 이미지 최적화
- [ ] tsc --noEmit 0 errors
- [ ] npm run build 성공

### Backend (packages/api)
- [ ] `app/middleware/error_handler.py` — FastAPI 글로벌 에러 핸들러
- [ ] `app/middleware/logging.py` — 요청/응답 로깅
- [ ] `.env.production.example` — 프로덕션 환경 변수 예시
- [ ] `Dockerfile` 최적화 — 멀티스테이지 빌드
- [ ] `railway.json` — Railway 배포 설정
- [ ] Python import 검증 OK

### 인프라/배포
- [ ] `vercel.json` — Vercel 배포 설정
- [ ] `docker-compose.prod.yml` — 프로덕션 Docker Compose
- [ ] `docs/deployment.md` — 배포 가이드

### 검증
- [ ] engine tsc 0 errors
- [ ] web tsc 0 errors
- [ ] npm run build success (전체 페이지)
- [ ] FastAPI import OK

## 최적화 목표
- 3D 씬: dynamic import로 SSR 분리 (이미 완료)
- 에러 경계: R3F + 일반 컴포넌트 분리
- 이미지: next/image 활용
- 번들: code splitting 확인

## 파일 소유권
- Agent-FRONTEND: packages/web/**
- Agent-BACKEND: packages/api/**, 인프라 파일
