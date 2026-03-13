# Sprint 5 계획: AI 챗봇 (주 12~14)

## 목표
AI와 대화하면 가구 자동 배치 + 사진 리모델링 동작

## 체크리스트

### Backend (packages/api)
- [ ] `app/models/chat_message.py` — ChatMessage, ChatSession 모델
- [ ] `app/schemas/chat.py` — 요청/응답 스키마 (MessageRequest, MessageResponse, IntentResult, FurnishVariant 등)
- [ ] `app/services/ai/conversation_agent.py` — Claude API 의도 분석 + 라우팅
- [ ] `app/services/ai/furnish_agent.py` — 배치 에이전트 (3가지 변형 생성)
- [ ] `app/services/ai/image_agent.py` — Claude Vision + Stability AI 이미지 생성
- [ ] `app/services/ai/placement_rules.py` — 배치 규칙 엔진 (동선/간격/위치)
- [ ] `app/repositories/chat_repo.py` — 대화 기록 저장/조회
- [ ] `app/api/v1/chat.py` — POST /message, GET /history/:projectId
- [ ] `app/main.py` 업데이트 — chat 라우터 등록
- [ ] `migrations/versions/003_chat_messages.py` — 마이그레이션
- [ ] Python import 검증 OK

### Frontend (packages/web)
- [ ] `components/editor/ChatPanel.tsx` 업데이트 — 실제 채팅 인터페이스 구현
  - [ ] 메시지 스크롤 리스트 (사용자/AI 버블)
  - [ ] 이미지 첨부 버튼 (파일 업로드)
  - [ ] 메시지 입력창 + 전송
  - [ ] 로딩 스피너 (AI 응답 대기)
- [ ] `components/editor/FurnishVariantCard.tsx` — 배치안 3종 선택 카드
  - [ ] 카드 이름/설명/예상비용 표시
  - [ ] "적용" 버튼 → 3D 씬에 즉시 반영
- [ ] `components/editor/ImagePreviewGrid.tsx` — 이미지 에이전트 결과 (4장 그리드)
- [ ] `lib/hooks/use-chat.ts` — TanStack Query + 채팅 상태 관리
- [ ] `lib/api/chat.ts` — chat API 클라이언트
- [ ] `types/chat.ts` — Chat 관련 타입 (FurnishVariant, ChatMessage, IntentResult 등)
- [ ] `lib/stores/editor-store.ts` 업데이트 — pendingVariants, applyVariant 액션
- [ ] tsc --noEmit 0 errors
- [ ] npm run build 성공

### 검증
- [ ] engine tsc 0 errors
- [ ] web tsc 0 errors
- [ ] npm run build success
- [ ] FastAPI import OK

## AI 스펙 (ai-chatbot-spec.md 요약)
- POST /api/v1/chat/message → { reply, intent, actions, images, estimate }
- GET /api/v1/chat/history/:projectId → 최근 50개
- intent 종류: auto_furnish, restyle_photo, modify_object, estimate, budget_optimize, share, general
- 배치안 3가지 변형 (FurnishVariant): name, description, objects[], materials[], estimated_cost
- Claude API: 의도분석 + 배치 생성 (anthropic python SDK)
- Stability AI: 이미지 생성 (httpx 직접 호출)
- 크레딧 소모: 텍스트=1, 배치=2, 이미지=3

## 환경 변수 (.env)
- ANTHROPIC_API_KEY
- STABILITY_API_KEY

## 파일 소유권
- Agent-FRONTEND: packages/web/**
- Agent-BACKEND: packages/api/**
