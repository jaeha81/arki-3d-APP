# Sprint 7 계획: 구독 시스템 + 관리자 (주 18~20)

## 목표
요금제별 기능 제한 + 결제 연동 + 관리자 대시보드

## 체크리스트

### Backend (packages/api)
- [ ] `app/models/subscription.py` — Subscription, Plan 모델
- [ ] `app/schemas/subscription.py` — Pydantic 스키마
- [ ] `app/services/subscription_service.py` — 구독 로직 + 크레딧 관리
- [ ] `app/api/v1/subscriptions.py` — 구독 API
- [ ] `app/api/v1/admin.py` — 관리자 API (사용자/에셋/통계)
- [ ] `app/api/v1/price_catalog.py` — 단가표 CRUD API
- [ ] `app/main.py` 업데이트
- [ ] `migrations/versions/005_subscriptions.py` — 마이그레이션
- [ ] Python import 검증 OK

### Frontend (packages/web)
- [ ] `app/(dashboard)/settings/page.tsx` — 구독/요금제 설정 페이지
- [ ] `app/(dashboard)/settings/billing/page.tsx` — 결제 내역
- [ ] `app/admin/page.tsx` — 관리자 대시보드
- [ ] `app/admin/users/page.tsx` — 사용자 관리
- [ ] `app/admin/assets/page.tsx` — 에셋 관리
- [ ] `components/settings/PlanCard.tsx` — 요금제 카드
- [ ] `components/settings/UsageBar.tsx` — AI 크레딧 사용량 바
- [ ] `components/admin/UserTable.tsx` — 사용자 목록 테이블
- [ ] `components/admin/StatsCards.tsx` — 통계 카드
- [ ] `lib/hooks/use-subscription.ts` — 구독 상태 훅
- [ ] tsc --noEmit 0 errors
- [ ] npm run build 성공

### 검증
- [ ] web tsc 0 errors
- [ ] npm run build success
- [ ] FastAPI import OK

## 요금제
| 플랜 | 가격 | AI 크레딧/월 | 이미지/월 | 프로젝트 수 |
|------|------|------------|---------|----------|
| Free | 무료 | 5 | 2 | 3 |
| Starter | 29,000원/월 | 50 | 20 | 10 |
| Pro | 79,000원/월 | 무제한 | 100 | 무제한 |
| Enterprise | 협의 | 무제한 | 무제한 | 무제한 |

## 파일 소유권
- Agent-FRONTEND: packages/web/**
- Agent-BACKEND: packages/api/**
