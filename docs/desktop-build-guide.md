# Arki-3D 데스크탑 앱 빌드 가이드

> **플랫폼**: Windows / macOS / Linux  
> **기술**: Tauri v2 (Rust + Next.js Static Export)  
> **출력물**: `.msi` / `.exe` (Windows), `.dmg` (macOS), `.AppImage` (Linux)

---

## 1. 사전 요구사항

### Node.js (필수)

```bash
# Node.js 20+ 확인
node --version   # v20.x.x 이상
npm --version    # 10.x.x 이상
```

### Rust 설치 (필수 — 최초 1회)

**Windows:**

```powershell
# PowerShell에서 실행
winget install Rustlang.Rustup
# 또는 브라우저에서 https://rustup.rs 접속 후 설치

# 설치 후 새 터미널에서 확인
rustc --version
cargo --version
```

**macOS:**

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Linux (Ubuntu/Debian):**

```bash
# 시스템 의존성 먼저 설치
sudo apt-get update
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev libappindicator3-dev \
  librsvg2-dev patchelf build-essential

# Rust 설치
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### WebView2 런타임 (Windows 10 이하)

Windows 11, Windows 10 (2021년 이후)에는 기본 설치됨.  
구버전 Windows는 https://developer.microsoft.com/en-us/microsoft-edge/webview2/ 에서 설치.

---

## 2. 프로젝트 설치

```bash
# 저장소 클론
git clone https://github.com/jaeha81/arki-3d-APP.git
cd arki-3d-APP

# npm 의존성 설치 (Node.js 패키지)
npm install
```

---

## 3. 개발 서버 실행 (핫 리로드)

```bash
# Tauri 개발 모드 (Next.js dev + Tauri 창)
npm run tauri:dev
```

> Next.js dev server (port 3000) + Tauri 네이티브 창이 함께 실행됩니다.  
> 코드 수정 시 자동 새로고침됩니다.

---

## 4. 프로덕션 빌드

### 아이콘 생성 (최초 1회)

```bash
# 1024x1024 PNG 아이콘 준비 후:
npx tauri icon src-tauri/icons/app-icon.png
# → src-tauri/icons/ 에 모든 크기 자동 생성
```

### 빌드 실행

```bash
# 릴리즈 빌드 (최적화, 서명 없음)
npm run tauri:build

# 디버그 빌드 (빠른 빌드, 콘솔 창 표시)
npm run tauri:build:debug
```

### 출력 파일 위치

| 플랫폼            | 파일                           | 경로                                        |
| ----------------- | ------------------------------ | ------------------------------------------- |
| Windows (.msi)    | `Arki-3D_0.1.0_x64_en-US.msi`  | `src-tauri/target/release/bundle/msi/`      |
| Windows (.exe)    | `Arki-3D_0.1.0_x64-setup.exe`  | `src-tauri/target/release/bundle/nsis/`     |
| macOS (.dmg)      | `Arki-3D_0.1.0_x64.dmg`        | `src-tauri/target/release/bundle/dmg/`      |
| Linux (.AppImage) | `arki-3d_0.1.0_amd64.AppImage` | `src-tauri/target/release/bundle/appimage/` |

---

## 5. 자동 업데이트 서명 설정

### 키 생성 (최초 1회, 안전하게 보관)

```bash
npm run tauri signer generate -- -w ~/.tauri/arki3d.key
# 생성된 공개키를 tauri.conf.json의 pubkey 필드에 복사
```

### 서명 빌드

```bash
# Windows PowerShell
$env:TAURI_SIGNING_PRIVATE_KEY = Get-Content "$HOME\.tauri\arki3d.key" -Raw
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""
npm run tauri:build
```

---

## 6. GitHub Actions 자동 빌드

태그를 푸시하면 Windows/macOS/Linux 빌드가 자동으로 실행됩니다.

```bash
# 버전 태그 푸시
git tag v0.2.0
git push origin v0.2.0
```

**GitHub Secrets 설정** (저장소 Settings → Secrets):
| Secret | 값 |
|--------|-----|
| `TAURI_SIGNING_PRIVATE_KEY` | `~/.tauri/arki3d.key` 파일 내용 |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 키 비밀번호 (없으면 빈 문자열) |

---

## 7. 플러그인 시스템

### 기본 번들 플러그인 (설치 즉시 사용 가능)

| 플러그인        | 기능                           |
| --------------- | ------------------------------ |
| `ai-design`     | Claude AI 인테리어 디자인 제안 |
| `estimation`    | 자재+시공비 자동 견적 산출     |
| `pdf-export`    | 견적서 PDF 생성                |
| `furniture-lib` | 3D 가구 라이브러리 카탈로그    |

### 플러그인 개발

```typescript
// packages/plugins/my-plugin/src/index.ts
import { PluginBase, type PluginManifest, type PluginContext } from '@arki/plugin-core'

export default class MyPlugin extends PluginBase {
  readonly manifest: PluginManifest = {
    id: 'my-plugin',
    name: '내 플러그인',
    version: '1.0.0',
    description: '설명',
    capabilities: ['panel'],
    entry: 'src/index.ts',
    minAppVersion: '0.1.0',
    permissions: ['scene:read'],
  }

  async activate(ctx: PluginContext): Promise<void> {
    await super.activate(ctx)
    ctx.ui.registerPanel('my-panel', MyPanelComponent, { title: '내 패널' })
  }

  async deactivate(): Promise<void> {
    this.ctx.ui.unregisterPanel('my-panel')
  }
}
```

### 플러그인 레지스트리 등록

`packages/plugins/registry.json`에 플러그인 정보 추가 후 GitHub에 커밋.  
앱 내 플러그인 관리자에서 GitHub를 통해 설치/업데이트 가능.

---

## 8. 데이터 저장 위치

앱 데이터는 OS별 표준 경로에 저장됩니다:

| 플랫폼  | 경로                                                       |
| ------- | ---------------------------------------------------------- |
| Windows | `C:\Users\<사용자>\AppData\Roaming\com.arki.spaceplanner\` |
| macOS   | `~/Library/Application Support/com.arki.spaceplanner/`     |
| Linux   | `~/.local/share/com.arki.spaceplanner/`                    |

---

## 9. 문제 해결

### Rust 빌드 오류

```bash
# Rust 최신 버전으로 업데이트
rustup update stable

# Cargo 캐시 초기화
cargo clean
```

### WebGL 성능 저하

`src-tauri/tauri.conf.json`의 `additionalBrowserArgs`에 아래 추가:

```
--enable-gpu --enable-webgl --ignore-gpu-blocklist --enable-zero-copy
```

### Next.js 빌드 오류

```bash
cd packages/web
rm -rf .next out
npm run build
```

### Three.js SSR 오류

3D 컴포넌트는 반드시 `dynamic` + `ssr: false`로 임포트:

```tsx
import dynamic from 'next/dynamic'
const ThreeViewer3D = dynamic(() => import('@/components/editor/ThreeViewer3D'), { ssr: false })
```

---

## 10. 아키텍처 개요

```
arki-3d/
├── src-tauri/              # Rust/Tauri 네이티브 레이어
│   ├── src/lib.rs          # 플러그인 초기화, SQLite 마이그레이션
│   └── tauri.conf.json     # 앱 설정 (창 크기, CSP, 번들 설정)
├── packages/
│   ├── web/                # Next.js 프론트엔드 (→ out/ 정적 빌드)
│   ├── engine/             # 순수 TS 2D/3D 엔진
│   └── plugins/            # 플러그인 패키지
│       ├── core/           # 플러그인 프레임워크 (타입, 레지스트리, 로더)
│       ├── ai-design/      # AI 디자인 어시스턴트
│       ├── estimation/     # 자동 견적
│       ├── pdf-export/     # PDF 내보내기
│       └── furniture-lib/  # 가구 라이브러리
└── .github/workflows/      # CI/CD 자동 빌드
```
