# Sprint 6 계획: 견적 시스템 + 저장/공유 (주 15~17)

## 목표
견적서 자동 생성 + PDF + 프로젝트 자동저장 + 공유 링크

## 체크리스트

### Backend (packages/api)
- [ ] `app/models/estimate.py` — Estimate, EstimateItem, PriceCatalog 모델
- [ ] `app/schemas/estimate.py` — 견적 관련 Pydantic 스키마
- [ ] `app/services/estimate_engine.py` — BOM 추출 + 견적 계산
- [ ] `app/services/pdf_generator.py` — 견적서 PDF 생성 (reportlab)
- [ ] `app/repositories/estimate_repo.py` — 견적 CRUD
- [ ] `app/api/v1/estimates.py` — 견적 API (생성/조회/PDF 다운로드)
- [ ] `app/api/v1/share.py` — 공유 링크 생성/조회 API
- [ ] `app/main.py` 업데이트
- [ ] `migrations/versions/004_estimates.py` — 마이그레이션
- [ ] AI 챗봇 estimate intent 처리 (chat.py 업데이트)
- [ ] Python import 검증 OK

### Frontend (packages/web)
- [ ] `types/estimate.ts` — 견적 관련 타입
- [ ] `lib/api/estimate.ts` — 견적 API 클라이언트
- [ ] `lib/hooks/use-estimate.ts` — 견적 데이터 훅
- [ ] `lib/hooks/use-autosave.ts` — debounce 2초 자동저장 훅
- [ ] `components/editor/EstimatePanel.tsx` — 견적 패널 (BOM 리스트 + 합계)
- [ ] `components/editor/ShareDialog.tsx` — 공유 링크 다이얼로그
- [ ] `app/share/[token]/page.tsx` — 읽기전용 공유 뷰어 페이지
- [ ] `app/editor/[projectId]/page.tsx` 업데이트 — 자동저장 훅 연결
- [ ] `components/editor/EditorTopbar.tsx` 업데이트 — 저장/공유/내보내기 버튼 실제 연결
- [ ] tsc --noEmit 0 errors
- [ ] npm run build 성공

### 검증
- [ ] engine tsc 0 errors
- [ ] web tsc 0 errors
- [ ] npm run build success
- [ ] FastAPI import OK

## 기술 스택
- PDF 생성: reportlab (Python)
- 자동저장: debounce 2초, FloorPlan JSON을 POST /projects/{id}/versions
- 공유 토큰: 32자 랜덤 문자열, 로그인 불필요
- 스크린샷: html2canvas 또는 ThreeJS WebGLRenderer.domElement.toDataURL

## 파일 소유권
- Agent-FRONTEND: packages/web/**
- Agent-BACKEND: packages/api/**
