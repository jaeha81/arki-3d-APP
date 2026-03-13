# Plan: SpacePlanner MVP - Sprint 2 (주 3~4)

## 목표
에디터 화면 껍데기 완성 (기능 없음, UI만) + 에셋/마감재 백엔드 API

## 1. 구현 파일 구조

### packages/web (Frontend - 에디터 UI)
```
packages/web/
├── app/
│   └── editor/
│       └── [projectId]/
│           └── page.tsx          # 에디터 메인 (레이아웃 조립)
├── components/
│   └── editor/
│       ├── EditorLayout.tsx      # 전체 에디터 레이아웃 (CSS Grid)
│       ├── EditorTopbar.tsx      # 상단: 프로젝트명 + 도구 + ViewToggle + 저장
│       ├── EditorToolbar.tsx     # 좌측: 도구 버튼 (벽/문/창/가구/선택)
│       ├── EditorCanvas.tsx      # 중앙: 캔버스 placeholder (Sprint 3에서 구현)
│       ├── AssetPanel.tsx        # 좌측 하단 or 분리 패널: 에셋 브라우저
│       ├── AssetCard.tsx         # 에셋 카드 (썸네일 + 이름)
│       ├── PropertiesPanel.tsx   # 우측: 선택 요소 속성
│       ├── ChatPanel.tsx         # 우측 하단: AI 챗봇 슬라이드
│       ├── ViewToggle.tsx        # 2D / 3D / Split 전환 버튼 그룹
│       └── EditorStatusBar.tsx   # 하단: 좌표, 줌 레벨, 단위
├── lib/
│   ├── stores/
│   │   └── editor-store.ts       # Zustand: 에디터 상태 (view, tool, selection)
│   └── hooks/
│       ├── use-assets.ts         # TanStack Query: 에셋 목록
│       └── use-materials.ts      # TanStack Query: 마감재 목록
└── types/
    └── editor.ts                 # 에디터 관련 타입
```

### packages/api (Backend - 에셋 API)
```
packages/api/
├── app/
│   ├── api/v1/
│   │   ├── assets.py             # GET /assets, GET /assets/:id
│   │   ├── asset_categories.py   # GET /asset-categories (트리)
│   │   └── materials.py          # GET /materials, GET /materials/:id
│   ├── models/
│   │   ├── asset.py              # Asset, AssetCategory 모델
│   │   └── material.py           # Material 모델
│   ├── schemas/
│   │   ├── asset.py              # Asset 스키마
│   │   └── material.py           # Material 스키마
│   └── repositories/
│       ├── asset_repo.py
│       └── material_repo.py
└── scripts/
    └── seed_assets.py            # 기본 에셋 + 마감재 시딩
```

## 2. 에디터 레이아웃 설계

```
┌─────────────────────────────────────────────────────────┐
│  EditorTopbar (h-12): 로고|프로젝트명 | 도구들 | 저장    │
├──────┬──────────────────────────────────────┬────────────┤
│      │                                      │            │
│ Tool │         EditorCanvas                 │ Properties │
│ bar  │    (2D/3D/Split 뷰)                  │  Panel     │
│(w-12)│                                      │  (w-72)    │
│      │                                      │            │
│      ├──────────────────────────────────────┤            │
│      │  AssetPanel (접이식, h-64)           │            │
├──────┴──────────────────────────────────────┴────────────┤
│  StatusBar (h-6): X:0 Y:0 | 1:100 | mm                  │
└─────────────────────────────────────────────────────────┘
```

## 3. 에디터 상태 (Zustand)

```ts
interface EditorState {
  viewMode: '2d' | '3d' | 'split'
  activeTool: 'select' | 'wall' | 'door' | 'window' | 'furniture' | 'measure'
  selectedIds: string[]
  zoom: number
  panX: number
  panY: number
  isChatOpen: boolean
  isAssetPanelOpen: boolean
  activeAssetCategory: string | null
}
```

## 4. DB 스키마 (Sprint 2 신규)

### asset_categories
```sql
CREATE TABLE asset_categories (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES asset_categories(id),
  name     VARCHAR(100) NOT NULL,
  slug     VARCHAR(100) UNIQUE NOT NULL,
  icon     VARCHAR(50),
  sort_order INTEGER DEFAULT 0
);
```

### assets
```sql
CREATE TABLE assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID REFERENCES asset_categories(id),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) UNIQUE NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  model_url     TEXT,          -- GLB/GLTF URL
  width_mm      INTEGER,       -- 실제 치수
  depth_mm      INTEGER,
  height_mm     INTEGER,
  tags          TEXT[],
  style         VARCHAR(50),   -- modern / classic / minimal / industrial
  is_free       BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### materials
```sql
CREATE TABLE materials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  category      VARCHAR(50) NOT NULL,  -- wall / floor / ceiling
  thumbnail_url TEXT,
  texture_url   TEXT,
  color_hex     VARCHAR(7),
  is_free       BOOLEAN DEFAULT TRUE,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

## 5. API 엔드포인트

| Method | URL | 설명 |
|--------|-----|------|
| GET | /api/v1/asset-categories | 카테고리 트리 |
| GET | /api/v1/assets | 에셋 목록 (category, style, search 필터) |
| GET | /api/v1/assets/:id | 에셋 상세 |
| GET | /api/v1/materials | 마감재 목록 (category 필터) |
| GET | /api/v1/materials/:id | 마감재 상세 |

## 6. 구현 체크리스트

### Frontend
- [x] editor-store.ts (Zustand 에디터 상태)
- [x] types/editor.ts (Tool, ViewMode 타입)
- [x] EditorLayout.tsx (CSS Grid 레이아웃)
- [x] EditorTopbar.tsx (프로젝트명 + ViewToggle + 저장버튼)
- [x] ViewToggle.tsx (2D/3D/Split 탭 버튼)
- [x] EditorToolbar.tsx (좌측 도구 아이콘 버튼들)
- [x] EditorCanvas.tsx (캔버스 placeholder - 회색 배경 + 그리드 CSS)
- [x] AssetPanel.tsx (카테고리 탭 + 검색 + 그리드)
- [x] AssetCard.tsx (썸네일 카드)
- [x] PropertiesPanel.tsx (빈 상태 + 선택 시 속성 표시 placeholder)
- [x] ChatPanel.tsx (슬라이드 AI 챗봇 UI - 입력창 + 메시지 영역)
- [x] EditorStatusBar.tsx (좌표 + 줌 표시)
- [x] use-assets.ts (TanStack Query)
- [x] use-materials.ts (TanStack Query)
- [x] editor/[projectId]/page.tsx 완전 구현

### Backend
- [x] Asset, AssetCategory 모델
- [x] Material 모델
- [x] asset_repo.py, material_repo.py
- [x] asset_categories.py 라우터
- [x] assets.py 라우터
- [x] materials.py 라우터
- [x] main.py에 라우터 등록
- [x] scripts/seed_assets.py (카테고리 10개 + 에셋 50개 + 마감재 25개)

---
계획 완료. 구현 시작.
