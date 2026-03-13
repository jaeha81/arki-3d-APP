# SpacePlanner 데이터베이스 스키마

## 전체 테이블 목록

| 테이블 | 용도 | Sprint |
|-------|------|--------|
| users | 사용자 계정 | 1 |
| projects | 디자인 프로젝트 | 1 |
| project_versions | 프로젝트 히스토리 | 3 |
| assets | 3D 가구/소품 모델 | 2 |
| asset_categories | 에셋 카테고리 트리 | 2 |
| materials | 마감재 (텍스처) | 2 |
| chat_messages | AI 대화 기록 | 5 |
| estimates | 견적서 | 6 |
| price_catalog | 단가표 | 6 |
| subscriptions | 구독 관리 | 7 |
| organizations | 업체/팀 | 7 |

---

## 상세 스키마

### users
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255),          -- OAuth 사용자는 NULL
  name            VARCHAR(100),
  avatar_url      TEXT,
  provider        VARCHAR(20) DEFAULT 'email',  -- email / google / kakao
  provider_id     VARCHAR(255),                 -- OAuth 제공자의 사용자 ID
  role            VARCHAR(20) DEFAULT 'user',   -- user / admin
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### projects
```sql
CREATE TABLE projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  thumbnail_url   TEXT,
  scene_data      JSONB NOT NULL DEFAULT '{}',  -- 전체 도면+배치+조명+카메라
  settings        JSONB DEFAULT '{}',           -- 그리드, 단위 등 프로젝트 설정
  is_public       BOOLEAN DEFAULT FALSE,
  share_token     VARCHAR(32) UNIQUE,           -- 공유 링크용 토큰
  version         INTEGER DEFAULT 1,            -- 낙관적 잠금용
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_share_token ON projects(share_token);
```

#### scene_data JSONB 구조
```json
{
  "version": "1.0",
  "metadata": {
    "name": "고객명 거실",
    "unit": "mm",
    "gridSize": 100
  },
  "walls": [
    {
      "id": "wall-xxx",
      "start": { "x": 0, "y": 0 },
      "end": { "x": 5000, "y": 0 },
      "thickness": 200,
      "height": 2700,
      "materialInner": "mat-white-paint",
      "materialOuter": "mat-white-paint"
    }
  ],
  "openings": [
    {
      "id": "door-xxx",
      "type": "door",
      "wallId": "wall-xxx",
      "position": 1500,
      "width": 900,
      "height": 2100,
      "sillHeight": 0
    }
  ],
  "rooms": [
    {
      "id": "room-xxx",
      "name": "거실",
      "wallIds": ["wall-1", "wall-2", "wall-3", "wall-4"],
      "polygon": [{"x":0,"y":0}, {"x":5000,"y":0}, ...],
      "floorMaterial": "mat-oak-wood",
      "ceilingMaterial": "mat-white-paint",
      "ceilingHeight": 2700,
      "color": "#E8F5E9"
    }
  ],
  "objects": [
    {
      "id": "obj-xxx",
      "assetId": "asset-sofa-001",
      "name": "3인 소파",
      "position": { "x": 2500, "y": 0, "z": 1500 },
      "rotation": { "x": 0, "y": 1.5708, "z": 0 },
      "scale": { "x": 1, "y": 1, "z": 1 },
      "visible": true,
      "locked": false
    }
  ],
  "lighting": {
    "ambientIntensity": 0.4,
    "ambientColor": "#FFFFFF",
    "sunIntensity": 0.8,
    "sunAzimuth": 180,
    "sunElevation": 45,
    "preset": "afternoon"
  },
  "cameraPresets": [
    {
      "name": "기본 뷰",
      "position": { "x": 5000, "y": 8000, "z": 5000 },
      "target": { "x": 2500, "y": 0, "z": 2500 },
      "fov": 60
    }
  ]
}
```

### project_versions
```sql
CREATE TABLE project_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version         INTEGER NOT NULL,
  scene_data      JSONB NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      UUID REFERENCES users(id)
);

CREATE INDEX idx_project_versions_project ON project_versions(project_id, version);
```

### assets
```sql
CREATE TABLE assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(255),
  category_id     UUID REFERENCES asset_categories(id),
  type            VARCHAR(20) NOT NULL,  -- furniture / fixture / decoration / appliance
  model_url       TEXT NOT NULL,          -- S3 URL (GLTF/GLB)
  thumbnail_url   TEXT,
  dimensions      JSONB,                 -- {"width": 2000, "height": 850, "depth": 900} mm
  tags            TEXT[],                -- {"modern", "minimal", "sofa", "white"}
  brand           VARCHAR(100),
  price           INTEGER DEFAULT 0,     -- 가격 (원), 0이면 가격 미정
  metadata        JSONB DEFAULT '{}',
  is_public       BOOLEAN DEFAULT TRUE,
  org_id          UUID,                  -- NULL=공용, 있으면 기업전용
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_tags ON assets USING GIN(tags);
CREATE INDEX idx_assets_type ON assets(type);
```

### asset_categories
```sql
CREATE TABLE asset_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,  -- "소파", "침대", "조명"
  parent_id       UUID REFERENCES asset_categories(id),
  icon            VARCHAR(50),            -- lucide 아이콘 이름
  sort_order      INTEGER DEFAULT 0,
  group_type      VARCHAR(20)             -- furniture_type / room_type
);
```

### materials
```sql
CREATE TABLE materials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(50) NOT NULL,   -- paint / wood / tile / concrete / wallpaper / carpet
  albedo_url      TEXT NOT NULL,           -- 기본 색상/텍스처
  normal_url      TEXT,                    -- 입체감 표현
  roughness_url   TEXT,                    -- 표면 거칠기
  metalness_url   TEXT,                    -- 금속 느낌
  repeat_x        FLOAT DEFAULT 1.0,      -- 텍스처 반복 X
  repeat_y        FLOAT DEFAULT 1.0,      -- 텍스처 반복 Y
  color           VARCHAR(7) DEFAULT '#FFFFFF',
  tags            TEXT[],
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### chat_messages
```sql
CREATE TABLE chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  role            VARCHAR(20) NOT NULL,   -- user / assistant
  content         TEXT NOT NULL,
  attachments     JSONB DEFAULT '[]',     -- [{"type":"image","url":"..."}]
  actions         JSONB DEFAULT '[]',     -- AI가 실행한 작업 데이터
  intent          VARCHAR(50),            -- auto_furnish / restyle_photo / estimate 등
  credits_used    INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_project ON chat_messages(project_id, created_at);
```

### estimates
```sql
CREATE TABLE estimates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  client_name     VARCHAR(100),
  items           JSONB NOT NULL,          -- 자재 목록 [{category,name,qty,unit,unit_price,total}]
  material_cost   INTEGER DEFAULT 0,       -- 자재비 (원)
  labor_cost      INTEGER DEFAULT 0,       -- 시공비 (원)
  margin_rate     FLOAT DEFAULT 0.15,      -- 마진율
  margin          INTEGER DEFAULT 0,       -- 마진 (원)
  total           INTEGER DEFAULT 0,       -- 합계 (원)
  notes           TEXT,                    -- 비고
  pdf_url         TEXT,                    -- 생성된 PDF URL
  status          VARCHAR(20) DEFAULT 'draft',  -- draft / sent / accepted / rejected
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_estimates_project ON estimates(project_id);
```

### price_catalog
```sql
CREATE TABLE price_catalog (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,                   -- NULL=기본단가, 있으면 업체별
  category        VARCHAR(50) NOT NULL,   -- flooring / paint / wallpaper / tile / labor / demolition
  name            VARCHAR(255) NOT NULL,  -- "오크 원목 마루", "수성 페인트 (백색)"
  unit            VARCHAR(20) NOT NULL,   -- m² / 개 / 롤 / 일 / 식
  unit_price      INTEGER NOT NULL,       -- 단가 (원)
  brand           VARCHAR(100),
  notes           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_catalog_category ON price_catalog(category);
```

### subscriptions
```sql
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  plan            VARCHAR(20) NOT NULL DEFAULT 'free',  -- free/starter/pro/enterprise
  status          VARCHAR(20) DEFAULT 'active',         -- active/canceled/past_due
  payment_provider VARCHAR(20),                          -- toss/stripe
  payment_id      VARCHAR(255),
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  ai_credits_used      INTEGER DEFAULT 0,
  ai_credits_limit     INTEGER DEFAULT 5,  -- 요금제별: free=5, starter=50, pro=9999
  image_gen_used       INTEGER DEFAULT 0,
  image_gen_limit      INTEGER DEFAULT 2,  -- free=2, starter=20, pro=100
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscriptions_user ON subscriptions(user_id);
```

### organizations
```sql
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(100) UNIQUE,
  logo_url        TEXT,
  plan            VARCHAR(20) DEFAULT 'starter',
  owner_id        UUID NOT NULL REFERENCES users(id),
  settings        JSONB DEFAULT '{}',  -- 기업 설정 (로고, 견적서 양식 등)
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
  org_id          UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  role            VARCHAR(20) DEFAULT 'member',  -- owner / admin / member
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (org_id, user_id)
);
```
