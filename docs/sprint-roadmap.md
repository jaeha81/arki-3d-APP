# SpacePlanner MVP 스프린트 로드맵

## 전체 구조: 8 스프린트 (24주)

각 스프린트 시작 시 해당 plan.md를 별도로 생성합니다.
아래는 전체 흐름 개요입니다.

---

## Sprint 1 (주 1~2): 기반 인프라 + 인증 + 대시보드
**목표:** 로그인 → 프로젝트 생성/목록/삭제가 동작
**핵심 작업:**
- 모노레포 초기화 (Turborepo)
- Next.js + shadcn/ui + Light/Dark 테마
- FastAPI + PostgreSQL + Redis + S3 (Docker)
- 인증: JWT + Google OAuth
- 프로젝트 CRUD API + 대시보드 UI
**산출물:** 로그인/가입 화면, 프로젝트 대시보드
**plan.md:** → docs/sprint-1-plan.md

---

## Sprint 2 (주 3~4): 에디터 레이아웃 + 디자인 시스템
**목표:** 에디터 화면 껍데기 완성 (아직 기능 없음, UI만)
**핵심 작업:**
- 에디터 레이아웃: 좌측 도구바 / 중앙 캔버스 / 우측 속성패널
- 상단 도구 모음 (뷰 전환: 2D/3D/Split)
- 에셋 패널 UI (카테고리, 검색, 썸네일 그리드)
- 속성 패널 UI (선택된 요소의 정보 표시)
- AI 챗봇 패널 UI (하단 또는 우측 슬라이드)
- 에셋 API + 마감재 API (Backend)
- 기본 에셋 시딩 스크립트 (무료 3D 모델 50개)
**산출물:** 에디터 화면 레이아웃 + 에셋 API
**plan.md:** → docs/sprint-2-plan.md

---

## Sprint 3 (주 5~8): 2D 도면 엔진 (핵심)
**목표:** 벽 그리기 → 방 인식 → 치수선 표시가 동작
**핵심 작업:**
- FloorPlanEngine 데이터 모델 (types.ts)
- Canvas 2D 렌더링 (그리드, 좌표계, Pan/Zoom)
- 벽 그리기 도구 (클릭→드래그, 시작/끝점)
- SnapEngine (그리드 스냅, 각도 스냅, 포인트 스냅)
- 벽 선택/이동/삭제
- 문/창문 배치 (벽 위에 드래그)
- RoomDetector (닫힌 영역 자동 인식)
- 자동 치수선 표시
- UndoManager (Ctrl+Z/Y)
- 2D에서 가구 배치 (탑뷰 아웃라인)
**산출물:** 2D 도면 편집 완전히 동작
**plan.md:** → docs/sprint-3-plan.md

---

## Sprint 4 (주 9~11): 3D 뷰어 엔진
**목표:** 2D 도면 → 3D 공간 자동 변환 + 카메라 컨트롤
**핵심 작업:**
- R3F Canvas 기본 셋업
- SceneBuilder: 벽 → 3D 메쉬 (BoxGeometry)
- 바닥/천장 자동 생성 (ShapeGeometry)
- 문/창문 개구부 (멀티메쉬 분할)
- 기본 조명 (Ambient + Directional + 그림자)
- OrbitControls 카메라 (3인칭 회전/줌)
- 2D↔3D 뷰 전환 (ViewToggle)
- 가구 GLTF/GLB 로딩 + 3D 배치
- Transform gizmo (이동/회전)
- 벽/바닥 텍스처 적용
**산출물:** 3D 공간에서 가구가 배치된 모습 확인 가능
**plan.md:** → docs/sprint-4-plan.md

---

## Sprint 5 (주 12~14): AI 챗봇 (핵심)
**목표:** AI와 대화하면 가구 자동 배치 + 사진 리모델링 동작
**핵심 작업:**
- AI Chat API (POST /api/v1/chat/message)
- 대화 에이전트: Claude API 연동, 의도 분석 + 라우팅
- 배치 에이전트: 스타일 분석 → 카탈로그 검색 → 배치 JSON 생성
- 배치 규칙 엔진: 동선 확보, 벽면 배치, 간격 유지
- 3가지 배치안 생성 → UI에서 선택
- 이미지 에이전트: Claude Vision (사진 분석) + Stability AI (시안 생성)
- AI 챗봇 UI: 채팅 인터페이스 + 이미지 미리보기 + 배치안 선택 카드
- chat_messages 테이블 + 대화 기록 저장
**산출물:** AI 챗봇으로 "모던하게 꾸며줘" → 가구 자동 배치
**plan.md:** → docs/sprint-5-plan.md

---

## Sprint 6 (주 15~17): 견적 시스템 + 저장/공유
**목표:** 견적서 자동 생성 + PDF + 프로젝트 공유 링크
**핵심 작업:**
- 견적 에이전트: BOM 추출 (3D 씬에서 자재 목록)
- 단가표 관리 API (price_catalog CRUD)
- 견적 계산 엔진: 면적×단가, 자재비+시공비+마진
- 견적서 PDF 생성 (시안 이미지 포함)
- AI 챗봇에서 "견적서 뽑아줘" 동작
- "예산 맞춰줘" → AI가 자동 최적화
- 프로젝트 저장/로드 (자동저장 debounce 2초)
- 공유 링크 생성 (읽기 전용 3D 뷰어)
- 스크린샷 내보내기 (WebGL → PNG)
**산출물:** 견적서 PDF + 공유 링크 + 자동저장
**plan.md:** → docs/sprint-6-plan.md

---

## Sprint 7 (주 18~20): 구독 시스템 + 관리자
**목표:** 요금제별 기능 제한 + 결제 연동
**핵심 작업:**
- 구독 요금제 시스템 (Free/Starter/Pro/Enterprise)
- AI 사용량 제한 (요금제별 월간 크레딧)
- 결제 연동 (Toss Payments 또는 Stripe)
- 관리자 대시보드 (사용자 관리, 에셋 관리, 통계)
- 단가표 관리 UI (시공업체가 자기 단가 입력)
- 반응형 최적화 (태블릿 상담용)
**산출물:** 구독 결제 + 관리자 페이지
**plan.md:** → docs/sprint-7-plan.md

---

## Sprint 8 (주 21~24): 최적화 + 베타 + 출시
**목표:** 성능 최적화, 버그 수정, 베타 테스트, 배포
**핵심 작업:**
- 3D 성능 최적화 (LOD, 인스턴싱, lazy loading)
- 에러 처리 + 로딩 상태 개선
- E2E 테스트 (Playwright: 핵심 워크플로우 3~5개)
- 배포: Vercel (Frontend) + Railway/Fly.io (Backend)
- Sentry 에러 모니터링
- PostHog 사용자 분석
- 도메인 연결 (spaceplanner.kr)
- 베타 테스터 모집 (인테리어 업계)
- 버그 수정 반복
- 공식 출시
**산출물:** 프로덕션 배포 완료
**plan.md:** → docs/sprint-8-plan.md

---

## 스프린트 간 의존성

```
Sprint 1 (인증+대시보드)
    ↓
Sprint 2 (에디터 레이아웃+에셋 API)
    ↓
Sprint 3 (2D 도면 엔진) ←── 가장 어려움, 4주 배정
    ↓
Sprint 4 (3D 뷰어) ←── Sprint 3 데이터 모델 필요
    ↓
Sprint 5 (AI 챗봇) ←── Sprint 4의 3D 씬 업데이트 기능 필요
    ↓
Sprint 6 (견적+저장+공유) ←── Sprint 5의 BOM 추출 필요
    ↓
Sprint 7 (구독+관리자) ←── Sprint 6까지 핵심 기능 완성 후
    ↓
Sprint 8 (최적화+출시)
```

## Claude Code 에이전트 병렬화 가이드

### Sprint 1~2: 순차 진행 (기반이므로)
- Agent 3 (FRONTEND): Next.js + UI
- Agent 4 (BACKEND): FastAPI + DB
- Agent 5 (QA): 설정 검증

### Sprint 3~4: 부분 병렬
- Agent 3: 2D Canvas UI (Sprint 3) → 3D R3F UI (Sprint 4)
- Agent 4: 에셋/마감재 API 고도화 + AI API 준비
- 별도 Agent: engine 패키지 (순수 TypeScript)

### Sprint 5: AI 집중
- Agent 3: AI 챗봇 UI
- Agent 4: Claude API 연동 + 배치 규칙 엔진 + 이미지 API

### Sprint 6~8: 전원 투입
- 모든 Agent 기능 완성 + 최적화 + 테스트
