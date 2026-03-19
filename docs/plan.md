# Arki-3D — 전면 재설계 계획 v4.0

> **핵심 전환**: 무거운 웹앱 → 경량 APK + 플러그인 확장팩 시스템
> **원칙**: 가볍고 빠르게, 핵심 기능만, 플러그인으로 확장
> **날짜**: 2026-03-19

---

## 1. 설계 철학

### 5대 성능 원칙

| # | 원칙 | 적용 |
|---|------|------|
| 1 | 불필요한 이미지/애니메이션 배제 | Lottie/Framer 제거, CSS transition만 150ms, 장식용 이미지 없음 |
| 2 | 필수 데이터만 비동기 + 캐시 | TanStack Query staleTime 5분, gcTime 30분, cursor 페이지네이션 |
| 3 | 스켈레톤 UI + 프리패칭 | Suspense fallback, 호버 시 prefetch, 에디터 진입 시 에셋 prefetch |
| 4 | 전송/DOM 최소화 | patch 방식 업데이트, 가상 리스트, 비필수 라이브러리 배제 |
| 5 | 비동기 핵심 분리 | Canvas 동기, AI/3D 비동기, 플러그인 동적 import + Suspense |

### 핵심 설계 결정

- **APK 우선**: Capacitor로 정적 빌드 → APK 배포
- **경량 코어**: 코어 앱은 2D/3D 에디터 + 인증 + 프로젝트 관리만
- **플러그인 확장**: AI, 견적, PDF, 가구 등은 모두 플러그인
- **설치 후 확장**: 사용자가 필요한 기능만 플러그인으로 추가
- **GitHub 동시 저장**: 플러그인 코드도 같은 리포에 packages/plugins/에 저장

---

## 2. 아키텍처

```
arki-3d/
├── packages/
│   ├── web/                  # Next.js static export → APK (Capacitor)
│   │   ├── app/              # 경량 라우트 (auth, dashboard, editor)
│   │   ├── components/       # 최소 UI 컴포넌트
│   │   └── lib/              # fetch API 클라이언트 + Zustand + TanStack Query
│   ├── api/                  # FastAPI 백엔드 (클라우드) ← 유지
│   ├── engine/               # 순수 TS 2D/3D 엔진 ← 유지
│   └── plugins/              # 플러그인 시스템 (GitHub에 같이 저장)
│       ├── core/             # 플러그인 프레임워크
│       │   ├── types.ts      # PluginBase, PluginManifest, PluginContext
│       │   ├── registry.ts   # 전역 플러그인 레지스트리
│       │   ├── loader.ts     # 동적 import 로더 + 샌드박스
│       │   ├── store.ts      # Zustand 플러그인 상태 + Capacitor Preferences 영속화
│       │   ├── lifecycle.ts  # 플러그인 라이프사이클 관리자 (신규)
│       │   └── manager-ui.tsx # 플러그인 매니저 UI
│       ├── ai-design/        # AI 디자인 어시스턴트 플러그인
│       ├── estimation/       # 자동 견적 플러그인
│       ├── pdf-export/       # PDF 내보내기 플러그인
│       └── furniture-lib/    # 가구 라이브러리 플러그인
├── capacitor.config.ts       # APK 설정
└── android/                  # Android 네이티브 프로젝트
```

---

## 3. 플러그인 시스템 설계

### 3-1. 라이프사이클

```
Registry에 등록 → 사용자 설치 → activate() → 사용 중 → deactivate() → 제거
                                    ↓
                            PluginContext 주입
                            (scene, api, ui)
```

### 3-2. 플러그인 매니페스트 (plugin.json)

```json
{
  "id": "ai-design",
  "name": "AI 디자인 어시스턴트",
  "version": "1.0.0",
  "description": "Claude AI로 공간 디자인 자동 제안",
  "capabilities": ["panel", "ai-agent"],
  "entry": "./src/index.ts",
  "minAppVersion": "1.0.0",
  "icon": "sparkles",
  "permissions": ["api:chat", "scene:write"]
}
```

### 3-3. PluginContext API

| API | 메서드 | 설명 |
|-----|--------|------|
| `scene` | `getFloorPlan()`, `updateFloorPlan(patch)`, `getFurniture()`, `addFurniture()` | 씬 읽기/쓰기 |
| `api` | `get(path)`, `post(path, body)` | FastAPI 클라이언트 |
| `ui` | `registerPanel()`, `unregisterPanel()`, `showToast()` | UI 등록/알림 |

### 3-4. 제공 플러그인 (GitHub에 함께 저장)

| 플러그인 | 기능 | 타입 | 기본 번들 |
|----------|------|------|-----------|
| `ai-design` | Claude AI 디자인 제안 + 스트리밍 채팅 | panel, ai-agent | O |
| `estimation` | 자재+시공비 자동 견적, 비용 요약 | panel | O |
| `pdf-export` | 견적서+도면 PDF 내보내기 | export | O |
| `furniture-lib` | 3D 가구 카탈로그 검색/배치 | asset-provider, panel | O |

### 3-5. 플러그인 영속화 전략

- **설치 상태**: Capacitor Preferences (네이티브) / localStorage (웹)
- **활성화 상태**: 앱 시작 시 자동 복원
- **레지스트리**: packages/plugins/registry.json (GitHub 저장)

---

## 4. 성능 최적화 전략

### 4-1. TanStack Query 캐싱

```typescript
// QueryProvider 기본 설정
staleTime: 5 * 60 * 1000    // 5분간 fresh → 재요청 안 함
gcTime: 30 * 60 * 1000      // 30분 가비지 컬렉션
retry: 1                     // 실패 시 1회만 재시도
refetchOnWindowFocus: false  // APK에서는 불필요
```

### 4-2. 스켈레톤 UI

- `SkeletonProjectCard` — 대시보드 프로젝트 목록
- `SkeletonEditorPanel` — 에디터 사이드패널
- `SkeletonAssetCard` — 가구 에셋 카드
- `PluginCardSkeleton` — 플러그인 카드 (이미 구현됨)

### 4-3. 프리패칭

- 프로젝트 카드 호버 → 에디터 데이터 prefetchQuery
- 에디터 로드 시 → 에셋/자재 카탈로그 prefetch
- 플러그인 목록 로드 시 → 설치된 플러그인 사전 로딩

### 4-4. 코드 스플리팅

- 에디터 → `dynamic(() => import('./EditorLayout'))`, `ssr: false`
- 3D 뷰어 → `dynamic(() => import('./ThreeViewer3D'))`, `ssr: false`
- 플러그인 → 각각 `loadBuiltinPlugin()` 동적 import

### 4-5. 라이브러리 경량화

- ~~axios~~ → fetch API (이미 적용됨)
- ~~Framer Motion~~ → CSS transition only
- ~~Lottie~~ → 미사용
- 아이콘: Lucide (tree-shakeable SVG) 유지

---

## 5. 구현 체크리스트

### Phase 1 — 플러그인 코어 강화 [x]

- [x] `lifecycle.ts` — 플러그인 라이프사이클 매니저 (init → activate → deactivate)
- [x] `store.ts` — Capacitor Preferences 영속화 추가
- [x] `loader.ts` — 에러 핸들링 + 타임아웃 강화
- [x] `manager-ui.tsx` — 설치/제거 버튼 + 스토어 연동 강화

### Phase 2 — 4개 플러그인 구현 (병렬) [x]

- [x] `ai-design` — index.ts 진입점 + AiDesignPanel.tsx
- [x] `estimation` — index.ts + EstimationPanel.tsx + 비용 계산
- [x] `pdf-export` — index.ts + PDF 생성 트리거
- [x] `furniture-lib` — index.ts + FurniturePanel.tsx + 에셋 검색

### Phase 3 — 성능 최적화 [x]

- [x] QueryProvider 캐싱 전략 강화 (staleTime 5분, gcTime 30분)
- [x] 스켈레톤 UI 컴포넌트 추가 (SkeletonProjectCard, SkeletonEditorPanel)
- [x] 에디터 prefetch 훅 추가
- [x] 플러그인 동적 로딩 Suspense 래퍼

### Phase 4 — 앱 통합 [x]

- [x] 에디터 페이지에 플러그인 시스템 연결
- [x] 설정 페이지에 플러그인 매니저 추가
- [x] 플러그인 설치 상태 앱 시작 시 자동 복원

---

## 6. 기술 스택 (최종)

| 레이어 | 기술 | 비고 |
|--------|------|------|
| 배포 형태 | APK (Capacitor) | 다운로드+설치 |
| 프론트엔드 | Next.js 14+ static export | `output: 'export'` |
| UI | Tailwind CSS + shadcn/ui | CSS transition only |
| 상태 | Zustand + TanStack Query | 캐시 5분/30분 |
| 3D | Three.js + R3F | 동적 로딩 |
| 플러그인 | @arki/plugin-core | PluginBase 상속 |
| 백엔드 | FastAPI (클라우드) | 유지 |
| DB | PostgreSQL + Redis | 유지 |

---

계획 수립 완료. 병렬 구현 착수.
