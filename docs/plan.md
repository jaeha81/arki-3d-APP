# Arki-3D — 전면 재설계 계획 v4.0

> **피벗**: Web SaaS → **데스크탑 설치형 앱 (Tauri v2)** + Plugin 확장 시스템
> **원칙**: 가볍고 빠르게, 기능 중심, 플러그인으로 확장
> **이전 피벗**: Web SaaS → Android APK (Capacitor) → **데스크탑 (Tauri)** 로 최종 변경
> **날짜**: 2026-03-19
> **이유**: 사용자가 다운로드 받아 설치하는 데스크탑 앱, Tauri = 경량(~10MB), 크로스플랫폼 (.msi/.dmg/.AppImage)

---

## 1. 아키텍처 개요

```
arki-3d/
├── packages/
│   ├── web/              # React + Vite or Next.js static export → APK (Capacitor)
│   ├── api/              # FastAPI 백엔드 (클라우드) ← 유지
│   ├── engine/           # 순수 TS 2D/3D 엔진 ← 유지
│   └── plugins/          # 플러그인 패키지 모음 ← 신규
│       ├── core/         # 플러그인 베이스 타입 + 레지스트리 + 로더
│       ├── ai-design/    # AI 디자인 어시스턴트 플러그인
│       ├── estimation/   # 자동 견적 플러그인
│       ├── furniture-lib/# 가구 라이브러리 플러그인
│       └── pdf-export/   # PDF 내보내기 플러그인
├── capacitor.config.ts   # Capacitor APK 설정 ← 신규
├── android/              # Android 네이티브 프로젝트 ← 신규
└── docs/
    └── plugin-api.md     # 플러그인 개발 가이드
```

---

## 2. 기술 스택 (변경 사항)

| 레이어             | 이전     | 변경 후                                 | 이유              |
| ------------------ | -------- | --------------------------------------- | ----------------- |
| **배포 형태**      | Web SaaS | Android APK                             | 사용자 설치형 앱  |
| **패키징**         | Vercel   | Capacitor + Android Studio              | APK 빌드          |
| **Next.js 설정**   | SSR      | static export (`output: 'export'`)      | APK는 서버 불필요 |
| **플러그인**       | 없음     | packages/plugins/ + 동적 import         | 기능 확장성       |
| **캐싱**           | 없음     | TanStack Query staleTime + localStorage | 반복 로딩 최소화  |
| **로딩**           | 없음     | Skeleton UI + Suspense                  | 즉각 반응         |
| **API 클라이언트** | axios    | fetch + AbortController                 | 경량화            |

**유지:**

- FastAPI 백엔드 (클라우드 API)
- packages/engine (순수 TypeScript)
- Zustand 상태 관리
- TanStack Query (캐싱 전략 추가)

---

## 3. 5가지 성능 원칙 적용

### 3-1. 불필요한 이미지/애니메이션 배제

- Lottie, Framer Motion 등 애니메이션 라이브러리 미사용
- CSS transition만 사용 (150ms ease-out)
- 장식용 이미지 제거, 아이콘은 Lucide (SVG) 유지

### 3-2. 필수 데이터만 비동기 + 캐시

- TanStack Query `staleTime: 5 * 60 * 1000` (5분)
- `gcTime: 30 * 60 * 1000` (30분)
- 프로젝트 목록: 페이지네이션 + cursor 기반
- 에셋 카탈로그: 무한 스크롤 + 카테고리별 분리 캐시

### 3-3. 스켈레톤 UI + 프리패칭

- React Suspense + fallback skeleton 컴포넌트
- 프로젝트 카드 호버 시 에디터 데이터 prefetch
- 에디터 진입 시 에셋 카탈로그 prefetch

### 3-4. 전송 데이터 최소화 + DOM 조작 최소화

- scene_data JSONB: 변경된 요소만 patch (full replace 금지)
- API 응답: 필요 필드만 select (GraphQL-like fields 파라미터)
- Virtual list for asset catalog (react-window 또는 자체 구현)
- DOM 조작: React 배치 업데이트 활용, useTransition

### 3-5. 비동기 핵심 기능 분리

- 에디터 Canvas: 동기 (즉각 반응)
- AI 챗봇: 비동기 (SSE 스트리밍)
- 3D 씬 업데이트: `requestAnimationFrame` 배치
- 플러그인 로딩: 동적 import + Suspense

---

## 4. Capacitor APK 구성

### 4-1. 설치

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npx cap add android
```

### 4-2. capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.arki.spaceplanner',
  appName: 'Arki-3D',
  webDir: 'packages/web/out', // Next.js static export 출력
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: 'android/keystore.jks',
      releaseType: 'APK',
    },
  },
  plugins: {
    SplashScreen: { launchShowDuration: 0 }, // 스플래시 없애기 (경량화)
  },
}

export default config
```

### 4-3. Next.js static export

```typescript
// next.config.ts
const config: NextConfig = {
  output: 'export', // 정적 HTML/JS 출력
  trailingSlash: true,
  images: { unoptimized: true },
}
```

### 4-4. APK 빌드 흐름

```bash
# 1. 웹앱 빌드
cd packages/web && npm run build   # → out/ 생성

# 2. Capacitor 동기화
npx cap copy android
npx cap sync android

# 3. APK 빌드 (Android Studio 또는 CLI)
npx cap build android --prod       # → APK 파일 생성
```

---

## 5. 플러그인 시스템 설계

### 5-1. 플러그인 구조

```
packages/plugins/
├── core/
│   ├── package.json
│   ├── src/
│   │   ├── types.ts          # PluginManifest, PluginBase 인터페이스
│   │   ├── registry.ts       # PluginRegistry (등록/조회)
│   │   ├── loader.ts         # PluginLoader (동적 import)
│   │   ├── store.ts          # Zustand plugin store
│   │   └── index.ts
│   └── tsconfig.json
├── ai-design/
│   ├── plugin.json           # 플러그인 매니페스트
│   ├── package.json
│   └── src/
│       ├── index.ts          # 플러그인 진입점
│       ├── AiDesignPanel.tsx # UI 패널
│       └── ai-service.ts     # Claude API 호출
├── estimation/
├── furniture-lib/
└── pdf-export/
```

### 5-2. 플러그인 매니페스트 (plugin.json)

```json
{
  "id": "ai-design",
  "name": "AI 디자인 어시스턴트",
  "version": "1.0.0",
  "description": "Claude AI로 공간 디자인 자동 제안",
  "author": "Arki Team",
  "capabilities": ["panel", "ai-agent", "tool"],
  "entry": "./src/index.ts",
  "minAppVersion": "1.0.0",
  "icon": "sparkles",
  "permissions": ["api:chat", "scene:write"]
}
```

### 5-3. 플러그인 베이스 인터페이스 (packages/plugins/core/src/types.ts)

```typescript
export interface PluginManifest {
  id: string
  name: string
  version: string
  description: string
  capabilities: PluginCapability[]
  entry: string
  minAppVersion: string
  icon?: string
  permissions: string[]
}

export type PluginCapability = 'panel' | 'tool' | 'ai-agent' | 'export' | 'asset-provider'

export interface PluginContext {
  scene: SceneAPI // 씬 읽기/쓰기
  api: ApiClient // FastAPI 클라이언트
  ui: UiAPI // 패널/다이얼로그 등록
  store: StoreAPI // Zustand 스토어 접근
}

export abstract class PluginBase {
  abstract manifest: PluginManifest
  abstract activate(ctx: PluginContext): Promise<void>
  abstract deactivate(): Promise<void>
}
```

### 5-4. 플러그인 레지스트리 (GitHub)

- `packages/plugins/registry.json`: 사용 가능한 플러그인 목록
- 앱 내 Plugin Manager에서 목록 조회/설치
- 설치된 플러그인: localStorage + Capacitor Preferences 저장
- 플러그인 코드: CDN (jsDelivr via GitHub) 또는 번들 내 포함

### 5-5. 초기 제공 플러그인 (번들 포함)

| 플러그인        | 기능                    | 기본 활성화 |
| --------------- | ----------------------- | ----------- |
| `ai-design`     | Claude AI 디자인 제안   | ✅          |
| `estimation`    | 자재+시공비 자동 견적   | ✅          |
| `pdf-export`    | 견적서 PDF 생성         | ✅          |
| `furniture-lib` | 3D 가구 라이브러리 확장 | ✅          |

---

## 6. 구현 우선순위

### Phase 1 — 데스크탑 앱 기반 구축 ✅ 완료

- [x] 기존 코드 현황 파악
- [x] Next.js static export 설정 (`output: 'export'`, `reactStrictMode: false`)
- [x] **Tauri v2** 설치 + `src-tauri/tauri.conf.json` (Capacitor 대체)
- [x] `src-tauri/src/lib.rs` — SQLite 마이그레이션 + WebGL GPU 플래그
- [x] `src-tauri/Cargo.toml` — 8개 Tauri 플러그인 (sql, fs, store, dialog, notification, updater, process, shell)
- [x] `src-tauri/capabilities/default.json` — 권한 설정
- [x] root `package.json` — Tauri 스크립트, Capacitor 제거
- [x] `packages/web/package.json` — Tauri API 패키지 추가, axios/Capacitor 제거

### Phase 2 — 플러그인 시스템 ✅ 완료

- [x] `packages/plugins/core` 베이스 타입 + 레지스트리 구현
- [x] `PluginManager` UI 컴포넌트 (manager-ui.tsx)
- [x] `packages/plugins/ai-design` 완전 구현 (AiDesignPanel + 스트리밍 채팅)
- [x] `packages/plugins/estimation` 완전 구현 (한국 단가표 + 자동 견적)
- [x] `packages/plugins/pdf-export` 완전 구현 (HTML→PDF 인쇄)
- [x] `packages/plugins/furniture-lib` 완전 구현 (18종 가구 카탈로그)
- [x] `packages/plugins/registry.json` 완성

### Phase 3 — 성능 최적화 ✅ 완료

- [x] Skeleton UI 컴포넌트 (`SkeletonProjectCard`, `SkeletonEditorPanel`, `SkeletonDashboard`)
- [x] TanStack Query 캐싱 전략 적용 (`staleTime: 5분`, `gcTime: 30분`, `refetchOnWindowFocus: false`)
- [x] `lib/tauri-bridge.ts` — Tauri/브라우저 통합 스토리지/파일/알림 API
- [x] `lib/capacitor.ts` — Tauri 브릿지로 마이그레이션 (하위 호환 유지)
- [x] axios 제거 완료 (fetch API 사용)
- [x] Capacitor 완전 제거
- [x] 불필요 이미지/애니메이션 없음 확인 (Framer Motion, Lottie 미사용)

### Phase 4 — 완성 ✅ 완료

- [x] `docs/desktop-build-guide.md` — Rust 설치 + 빌드 가이드
- [x] `src-tauri/tauri.conf.json` — NSIS 한국어/영어 설치파일 + 자동 업데이터
- [x] `.github/workflows/build-desktop.yml` — GitHub Actions CI/CD (Windows/macOS/Linux 병렬 빌드)
- [x] GitHub Releases → 자동 업데이터 `latest.json` 생성

---

## 7. API 클라이언트 경량화

### 기존 (axios, 100KB+)

```typescript
import axios from 'axios'
const client = axios.create({ baseURL: API_URL })
```

### 변경 (fetch, 0KB)

```typescript
// lib/api/client.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().token
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })
  if (!res.ok) throw new ApiError(res.status, await res.json())
  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
}
```

---

## 8. 스켈레톤 UI 전략

```tsx
// components/ui/skeleton.tsx (이미 존재 → 활용)
// components/dashboard/SkeletonProjectCard.tsx
export function SkeletonProjectCard() {
  return (
    <div className="rounded-lg border p-4 space-y-3 animate-pulse">
      <div className="h-32 bg-muted rounded-md" />
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/2" />
    </div>
  )
}

// components/editor/SkeletonEditorPanel.tsx
// components/editor/SkeletonAssetCard.tsx
```

React Suspense 적용:

```tsx
<Suspense fallback={<SkeletonProjectCard />}>
  <ProjectGrid />
</Suspense>
```

---

## 9. 개발 규칙 (변경/추가)

| 항목                | 규칙                               |
| ------------------- | ---------------------------------- |
| 배포 형태           | APK (Capacitor)                    |
| 애니메이션          | CSS transition만 (150ms ease-out)  |
| HTTP 클라이언트     | fetch API (axios 제거)             |
| 이미지              | 기능 관련만 (장식용 제거)          |
| 플러그인            | PluginBase 상속 필수               |
| 플러그인 매니페스트 | plugin.json 필수                   |
| 코드 분할           | 에디터/플러그인 → 동적 import      |
| 캐싱                | TanStack Query staleTime 명시 필수 |

---

계획 수립 완료. 병렬 구현 착수.
