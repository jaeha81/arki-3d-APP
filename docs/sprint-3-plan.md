# Plan: SpacePlanner MVP - Sprint 3 (주 5~8)

## 목표
2D 도면 편집 완전 동작: 벽 그리기 → 방 인식 → 치수선 표시

## 1. 아키텍처

### packages/engine (순수 TypeScript)
FloorPlanEngine 핵심 로직. React 의존 없음.
```
packages/engine/src/
├── floor-plan/
│   ├── FloorPlanEngine.ts     # 메인 엔진 (상태 관리 + 커맨드 패턴)
│   ├── WallTool.ts            # 벽 그리기 도구 로직
│   ├── SnapEngine.ts          # 스냅 (그리드/각도/포인트)
│   ├── RoomDetector.ts        # 닫힌 영역 인식 알고리즘
│   ├── DimensionEngine.ts     # 치수선 계산
│   └── UndoManager.ts         # Command 패턴 Undo/Redo
└── types/
    └── floor-plan.ts          # (기존 - 이미 생성됨)
```

### packages/web (React Canvas)
```
packages/web/components/editor/
├── FloorPlanCanvas.tsx        # Canvas 2D 렌더링 (기존 EditorCanvas 교체)
├── canvas/
│   ├── Renderer2D.ts          # Canvas 렌더링 로직
│   └── CanvasController.tsx   # 마우스/키보드 이벤트 → 엔진 커맨드
```

## 2. 핵심 구현

### FloorPlanEngine
- addWall(start, end): Wall 추가
- removeWall(id): Wall 삭제
- selectElement(id): 선택
- moveElement(id, dx, dy): 이동
- addDoor/addWindow: 문/창문 배치
- undo/redo: Ctrl+Z/Y
- subscribe(listener): 상태 변화 구독 → React re-render

### SnapEngine
- snapToGrid(point, gridSize): 100mm 그리드
- snapToAngle(start, current, angles=[0,45,90,135,180]): 각도 스냅
- snapToPoint(point, walls, threshold=10): 기존 벽 끝점에 스냅

### RoomDetector
- detectRooms(walls): 닫힌 다각형 영역 인식
  - 벽들의 교차점 그래프 구성
  - DFS/BFS로 닫힌 사이클 탐지
  - 폴리곤 면적 계산

### Renderer2D
- drawGrid(): CSS 변수 색상, 100mm 간격
- drawWalls(): 두께 있는 벽 (두 선분)
- drawDoors(): 호 그리기 (문 열림 방향)
- drawWindows(): 이중선 창문
- drawRooms(): 방 영역 반투명 채우기
- drawDimensions(): 치수선 (화살표 + 숫자)
- drawSelection(): 선택 핸들 (파란색 사각형)
- drawFurniture(): 가구 탑뷰 아웃라인

## 3. 구현 체크리스트

### packages/engine
- [ ] UndoManager.ts (Command 패턴)
- [ ] SnapEngine.ts
- [ ] RoomDetector.ts
- [ ] DimensionEngine.ts
- [ ] FloorPlanEngine.ts (메인 엔진)
- [ ] WallTool.ts
- [ ] index.ts 업데이트 (새 export 추가)

### packages/web
- [ ] canvas/Renderer2D.ts
- [ ] canvas/CanvasController.tsx
- [ ] FloorPlanCanvas.tsx (EditorCanvas.tsx 교체)
- [ ] editor-store.ts 업데이트 (floorPlan 상태 추가)
- [ ] EditorCanvas.tsx → FloorPlanCanvas 연결

---
구현 시작.
