# @arki/plugin-core

SpacePlanner 플러그인 시스템 핵심 패키지

## 모듈

| 파일             | 역할                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| `types.ts`       | PluginManifest, PluginBase, PluginContext, SceneAPI, UiAPI 등 핵심 타입 |
| `registry.ts`    | PluginRegistry — Map 기반 플러그인 클래스 등록/조회                     |
| `loader.ts`      | 동적 import 기반 플러그인 로더 (외부 URL + 빌트인)                      |
| `store.ts`       | Zustand 플러그인 상태 관리 (설치/활성화/비활성화)                       |
| `manager-ui.tsx` | 플러그인 관리 React 컴포넌트                                            |

## 플러그인 개발 예시

```typescript
import { PluginBase, type PluginManifest, type PluginContext } from '@arki/plugin-core'

export default class MyPlugin extends PluginBase {
  readonly manifest: PluginManifest = {
    id: 'my-plugin',
    name: '내 플러그인',
    version: '1.0.0',
    description: '설명',
    capabilities: ['panel'],
    entry: 'src/index.ts',
    minAppVersion: '1.0.0',
    permissions: ['scene:read'],
  }

  async activate(ctx: PluginContext): Promise<void> {
    await super.activate(ctx)
    this.ctx.ui.registerPanel('my-panel', MyPanelComponent, { title: '내 패널' })
  }

  async deactivate(): Promise<void> {
    this.ctx.ui.unregisterPanel('my-panel')
  }
}
```
