# JH-3D 업그레이드 실행계획 (plan.md)

> 핸드오프 대상: Claude Code · 모드: 골모드(전체) · 페이로드: ①쇼룸 비주얼 + ②AI기능
> 상태: **승인 대기** — 보안/AI 포함이라 코드 미수정. 승인 후 FRONTEND/BACKEND/QA 웨이브 진행.

---

## 0. 범위 / 전제 (잠금)

- **JH-3D 앱 = 호스트(운영 셸).** 버키를 운영하는 시스템처럼, 에이전트를 운영할 수 있는 호스트로 업그레이드.
- **마운트 심(seam) = 이번에 넣는 유일한 아키텍처 추가.** 빈 소켓.
- **옵시디언 + 에이전트 OS = 별도 신설.** 이번 작업 아님. 나중에 소켓에 꽂힘.
- **페이로드(이번에 탑재) = ① 쇼룸 비주얼/UX + ② AI 기능(워크플로 03 디자인 제안, 04 자동견적).**
- 결제·인증·DB 스키마: 미접촉(순수 프론트 + 심 + 서버 프록시 인터페이스).

**이번에 함**: 심(계약+슬롯+결과 UI) · 페이로드 ①② · 상용화 품질 가드
**이번에 안 함**: 에이전트 OS·옵시디언·릴레이 실체 (별도 신설)

---

## 1. 아키텍처 — 마운트 심

```
JH-3D 호스트 (앱 본체 · 에디터 · UI · 결과표시)
   │  dispatch(instruction) → AIResult     ← 단일 계약 (프론트는 이것만 안다)
   ▼  [AI OS 디스패치 레이어]  (프로바이더 선택 · 라우팅 · 폴백 · Zod 검증)
   ├─ [로컬 슬롯]  ←─ 에이전트 OS 어댑터 (비워둠, 나중에 옵시디언+CLI OS 연결)
   └─ [클라우드 슬롯] ←─ 클라우드 API 어댑터 (BYO-key, 서버 프록시 경유)
```

- 프론트는 어느 백엔드인지 모름 → OS·옵시디언 신설/교체해도 본체 무변경.
- 프로바이더 추가 = 어댑터 1개 추가. 구조 변경 없음. (춘식이 폴백 패턴 동일 계열)
- **Phase 1 기본 어댑터**: 클라우드 BYO-key(데모 가능) + 로컬 슬롯은 스텁(미연결 시 명확한 안내). 에이전트 OS 완성 시 스텁만 교체.

---

## 2. 페이로드 ① 쇼룸 비주얼 / UX (상용화 품질)

목표: 텍스트 위주 랜딩 → 제품(3D 시각화)을 *보여주는* 쇼룸급. 단, B2B 스캔성 유지.

1. **히어로 = path-draw → reveal**: SVG 평면도 `stroke-dashoffset`로 그려짐 → 에디터 실작동(영상 or 경량 3D)로 cross-fade. `object-fit:cover` 풀블리드. *제품 핵심 메타포("그리면 3D")와 정합.*
2. **팔레트 토큰화**: 차콜 베이스 + 웜 베이지 + 단일 액센트. 하드코딩 색상 → 단일 출처 토큰.
3. **워크플로 5단계 = 룸형 섹션**: scroll-snap *부드럽게* 적용(스크롤 하이재킹 금지 — `proximity`, 강제 정지 아님). B2B 이탈 방지.
4. **기능 카드 패럴랙스**: tilt 경량/선택. 에디터는 진짜 3D라 불필요 → 랜딩 카드만.
5. **접근성·성능 가드(상용 필수)**: `prefers-reduced-motion` 폴백(정적 poster), IntersectionObserver in-view 재생, Three.js `dynamic import`(코드분할), LCP/CLS 측정.
6. **⚠️ 신뢰 리스크 — 후기 진위**: 현재 후기(김건축·이디자인·박시공)는 플레이스홀더로 보임. 결제(Toss) 붙은 상용 B2B에서 가짜 후기는 신뢰·법적 리스크. → 실명 동의분으로 교체 또는 섹션 비움. **결정 필요.**

---

## 3. 페이로드 ② AI 기능 (심 경유)

두 기능 모두 dispatch 단일 경로로 → 중복 엔드포인트 금지, OS 교체 무영향.

### 03 AI 디자인 제안 ("모던하게 꾸며줘")
```
에디터 입력 → dispatch({ task:"design.suggest", input:{ sceneState, prompt }})
            → AIResult{ furniturePlacements[], conceptNotes }
            → 에디터가 3D 씬에 적용
```
- 결과는 정규화 스키마 고정 → 어느 프로바이더든 동일하게 소비.

### 04 자동 견적 (한국 단가)
```
dispatch({ task:"estimate.generate", input:{ areas, materials, region:"KR" }})
            → AIResult{ lineItems[], totals } → 표시 + PDF
```
- **⚠️ 재사용 결정**: 자동견적은 기존 **JH-EstimateAI 파이프라인(SCANNER→ESTIMATOR→PRICER→VALIDATOR→REPORTER)**과 기능 중복. → 재구현 금지. `estimate.generate` 태스크를 심 통해 EstimateAI로 라우팅. (이것도 어댑터 1개로 흡수)

**Phase 1 효과**: 에이전트 OS가 아직 없어도, 클라우드 어댑터 or 스텁으로 두 기능을 **데모 가능**. 브레인 OS 완성되면 로컬 슬롯에 꽂기만.

---

## 4. 수정 / 생성 파일 (예상 — Claude Code가 실제 레포 대조 후 확정)

Next.js App Router + Tailwind 가정. 컨벤션: named export only / no any·unknown / 단일 책임.

```
[심·AI]
 생성  lib/ai/types.ts              # AIProvider, AIInstruction, AIResult + Zod 스키마
 생성  lib/ai/dispatch.ts           # 선택·라우팅·폴백
 생성  lib/ai/adapters/agentOs.ts   # 로컬 슬롯 (Phase1: 스텁, 미연결 안내)
 생성  lib/ai/adapters/cloudApi.ts  # 클라우드 BYO-key (서버 프록시 호출)
 생성  lib/ai/adapters/estimateAi.ts# estimate.generate → EstimateAI 라우팅
 생성  app/api/ai/dispatch/route.ts # 서버 프록시 (키 서버측, 클라 미노출)
 생성  components/settings/ProviderPicker.tsx
 수정  (기존 AI 호출부)             # dispatch() 단일 경로로 통합, 중복 제거

[쇼룸 ①]
 수정  app/page.tsx                 # 히어로 교체 + 워크플로 섹션
 수정  tailwind.config.ts/globals   # 팔레트 토큰
 생성  components/landing/HeroFloorplan.tsx
 생성  hooks/useInView.ts
 생성  hooks/usePrefersReducedMotion.ts
 생성  public/hero/{floorplan.svg, editor-demo.mp4+webm, poster.jpg}
 수정  (후기 섹션)                  # 진위 처리

[AI 기능 ②]
 수정  app/editor/*                 # 03 디자인 제안 입력→dispatch→씬적용
 수정  (견적 모듈)                  # 04 estimate.generate→dispatch→표시/PDF
```

---

## 5. Before · After (개념 스니펫 — 최종 코드 아님)

```ts
// 계약 (의사코드)
export interface AIProvider {
  readonly id: "agent-os" | "cloud-anthropic" | "cloud-openai" | "cloud-gemini" | "estimate-ai"
  dispatch(instruction: AIInstruction): Promise<AIResult>   // in/out 양쪽 동일
}
```
```ts
// BEFORE — 호출부가 프로바이더 직접 분기 + 키 노출 (결합·중복·위험)
const r = await fetch("https://api.anthropic.com/...", { headers:{ "x-api-key": KEY }})

// AFTER — 프론트는 OS만 부른다. 프로바이더/키 존재를 모름
const result = await dispatch({ task:"design.suggest", input })
```
```tsx
// 히어로 (의사코드)
// 1) reduced-motion → poster만, 종료
// 2) mount → SVG path stroke-dashoffset 0 애니 (평면도 그려짐)
// 3) onAnimationEnd → <video muted playsInline loop preload="none" object-cover> opacity 0→1
// 4) useInView 화면밖이면 pause / 카피·CTA는 z-layer 위
```

---

## 6. 보안 (⚠️ plan→승인 게이트)

- **로컬 슬롯(에이전트 OS)**: 키가 앱에 없음 — 자격증명 OS/머신에 잔류. 가장 안전.
- **클라우드 슬롯(BYO-key)**: 키 **절대 클라이언트/Vercel 번들 금지**. 서버 프록시(`/api/ai/dispatch`) 경유, 키는 서버 env. 멀티유저 상용이면 유저별 **암호화 시크릿 스토어**(이번 범위 아님, 인터페이스만 — DB 미접촉 원칙).
- **ToS**: 본인 구독 CLI로 타 유료 고객 서빙 금지. 고객은 자기 BYO-key 또는 자기 OS. 어댑터 선택으로 분기.

---

## 7. 트레이드오프

- **심-지금 / OS-나중**: 본체 안정, 데모 가능 ↔ Phase1은 스텁/클라우드라 "진짜 로컬 에이전트" 체감은 OS 완성 후.
- **scroll-snap(룸)**: 쇼룸 몰입 ↔ B2B 스캔성 저하 위험 → proximity 약하게로 절충.
- **히어로 영상 에셋 = 진짜 병목**(코드 아님). 없으면 SVG-only 폴백으로 Phase1 출시.
- **견적 EstimateAI 재사용**: 재구현 0 ↔ 두 시스템 결합점 계약 관리 필요.
- **tilt/snap 전면 도입 보류**: 화려함↓ ↔ 번들↓·전환 안전·상용 안정성↑ (의도).

---

## 8. Todo — Claude Code 핸드오프 (웨이브)

**선행(RESEARCH)**
1. 실제 레포 구조 확인 → §4 경로 대조·확정 (App Router/Tailwind/에디터·견적 모듈 위치)
2. 기존 AI 호출부 전수 → dispatch 통합 대상 식별

**FRONTEND**
3. 팔레트 토큰 + 하드코딩 색상 치환
4. `usePrefersReducedMotion`, `useInView`
5. `HeroFloorplan` (path-draw→reveal, 모션가드) → `app/page.tsx` 히어로 교체
6. 워크플로 룸 섹션(soft snap) / 카드 tilt(경량)
7. `ProviderPicker` 설정 UI

**BACKEND/심**
8. `lib/ai/types.ts` 계약+Zod
9. `lib/ai/dispatch.ts` + 어댑터 3종(agentOs 스텁 / cloudApi / estimateAi)
10. `app/api/ai/dispatch/route.ts` 서버 프록시 (키 서버측)
11. 03 디자인 제안 / 04 견적 → dispatch 배선

**QA**
12. LCP·CLS·번들, reduced-motion, 모바일 fold 3종 검증
13. 컨벤션: named export, no any/unknown, 단일 책임, 중복 엔드포인트 0
14. 미연결 슬롯·키 미설정 시 안내 동작 확인

**결정 대기(2건)**: ① 후기 진위 처리(교체/삭제) ② 히어로 영상 에셋 유무(없으면 SVG-only)

---

계획이 완료되었습니다. 검토 후 승인해주세요. 아직 코드를 수정하지 않았습니다.
