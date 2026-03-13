# Sprint 4 계획: 3D 뷰어 엔진 (주 9~11)

## 목표
2D 도면 → 3D 공간 자동 변환 + 카메라 컨트롤 + 가구 GLTF 배치

## 체크리스트

### Engine 패키지 (packages/engine)
- [ ] `src/three/SceneBuilder.ts` — FloorPlan → Three.js 메쉬 변환
  - [ ] 벽 → BoxGeometry (두께 200mm, 높이 2700mm)
  - [ ] 바닥 → ShapeGeometry (rooms 기반 또는 bounding box)
  - [ ] 천장 → ShapeGeometry
  - [ ] 문 개구부 처리 (벽을 3분할: 하단+개구부+상단)
  - [ ] 창문 개구부 처리 (벽을 5분할: 하단+좌+창+우+상단)
  - [ ] 가구 배치 메타데이터 (position/rotation 3D 변환)
- [ ] `src/three/index.ts` — SceneBuilder export

### Frontend 패키지 (packages/web)
- [ ] R3F 설치: `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three`
- [ ] `components/editor/ThreeViewer3D.tsx` — R3F Canvas 루트
  - [ ] Canvas + PerspectiveCamera
  - [ ] OrbitControls (drei)
  - [ ] Ambient + Directional 조명 (그림자 포함)
  - [ ] SceneBuilder 연동 → Mesh 렌더링
  - [ ] 벽 기본 머티리얼 (흰색)
  - [ ] 바닥 머티리얼 (옅은 회색)
  - [ ] 천장 머티리얼 (흰색, 반투명)
- [ ] `components/editor/scene/WallMesh.tsx` — 벽 메쉬 컴포넌트
- [ ] `components/editor/scene/FloorMesh.tsx` — 바닥/천장 컴포넌트
- [ ] `components/editor/scene/FurnitureMesh.tsx` — GLTF 가구 로더 (drei useGLTF)
- [ ] `components/editor/scene/SceneGrid.tsx` — 3D 그리드 헬퍼
- [ ] `components/editor/scene/TransformGizmo.tsx` — 선택된 가구 이동/회전 (drei TransformControls)
- [ ] `components/editor/EditorCanvas.tsx` 업데이트
  - [ ] Canvas3DPlaceholder → ThreeViewer3D 교체
  - [ ] 2D/3D/Split 뷰 전환 완전 연동
- [ ] `lib/hooks/use-floor-plan-scene.ts` — FloorPlanEngine → SceneData 변환 훅
- [ ] `lib/hooks/use-gltf-assets.ts` — 에셋 GLTF URL 캐싱 훅

### Backend 패키지 (packages/api)
- [ ] `app/models/project_version.py` — project_versions 테이블
- [ ] `app/schemas/project_version.py`
- [ ] `app/repositories/project_version_repo.py`
- [ ] `app/api/v1/project_versions.py` — 자동저장 API
  - [ ] POST `/api/v1/projects/{id}/versions` — 버전 저장
  - [ ] GET `/api/v1/projects/{id}/versions` — 버전 목록
  - [ ] GET `/api/v1/projects/{id}/versions/{versionId}` — 특정 버전 로드
- [ ] `alembic/versions/002_project_versions.py` — 마이그레이션

### 검증
- [ ] `packages/engine` tsc --noEmit 0 errors
- [ ] `packages/web` tsc --noEmit 0 errors
- [ ] `npm run build` 7/7 pages ✅
- [ ] FastAPI python import OK

## 기술 스택
- React Three Fiber (R3F) v8
- @react-three/drei v9
- three.js v0.160+
- 좌표계: 1 Three.js unit = 1mm, Y-up
- 벽 두께: 200mm, 높이: 2700mm

## 파일 소유권 (에이전트별)
- Agent-FRONTEND: packages/web/**, packages/engine/src/three/**
- Agent-BACKEND: packages/api/**
