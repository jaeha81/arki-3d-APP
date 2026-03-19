# Android APK 빌드 가이드

Capacitor를 이용해 Next.js 웹앱을 Android APK로 패키징하는 전체 흐름을 설명합니다.

---

## 아키텍처

```
Next.js (packages/web)
    ↓ next build (output: 'export')
packages/web/out/          ← 정적 HTML/JS/CSS
    ↓ npx cap copy android
android/app/src/main/assets/public/   ← WebView에서 로딩
    ↓ Android Studio Build
app-debug.apk / app-release.apk
```

---

## 사전 요구사항

| 도구           | 버전          | 확인 명령                  |
| -------------- | ------------- | -------------------------- |
| Node.js        | 20 이상       | `node -v`                  |
| npm            | 10 이상       | `npm -v`                   |
| Java (JDK)     | 17 이상       | `java -version`            |
| Android Studio | Hedgehog 이상 | —                          |
| Android SDK    | API 33+ 권장  | Android Studio SDK Manager |

---

## 최초 1회: Android 프로젝트 초기화

```bash
# 1. 루트에서 의존성 설치
npm install

# 2. Capacitor Android 플랫폼 추가 (android/ 디렉토리 생성)
npx cap add android
```

> `android/` 디렉토리가 생성되며, git에 커밋하거나 .gitignore에 제외할 수 있습니다.

---

## 빌드 흐름

### 방법 A — 루트 스크립트 (권장)

```bash
# Next.js 빌드 → Capacitor copy → Android Studio 열기
npm run cap:copy   # next build + cap copy android
npm run cap:open   # Android Studio 실행
```

Android Studio에서:
`Build > Build Bundle(s) / APK(s) > Build APK(s)`

APK 경로: `android/app/build/outputs/apk/debug/app-debug.apk`

### 방법 B — packages/web에서 직접

```bash
cd packages/web
npm run build:apk
# 위 명령은: next build → cap copy android → cap sync android
```

이후 Android Studio는 별도로 열어야 합니다:

```bash
npm run cap:open  # 루트에서 실행
```

---

## 개별 Capacitor 명령

| 명령                | 루트 스크립트      | 설명                            |
| ------------------- | ------------------ | ------------------------------- |
| Next.js 빌드 + 복사 | `npm run cap:copy` | 웹 에셋을 android/ 로 복사      |
| 플러그인 동기화     | `npm run cap:sync` | 네이티브 플러그인 변경사항 반영 |
| Android Studio 열기 | `npm run cap:open` | IDE로 네이티브 프로젝트 열기    |

---

## 주요 설정 파일

### `capacitor.config.ts` (루트)

```typescript
{
  appId: 'com.arki.spaceplanner',   // Android 앱 패키지명
  appName: 'Arki-3D',
  webDir: 'packages/web/out',       // next build 출력 디렉토리
  server: {
    androidScheme: 'https',         // HTTPS 스킴으로 WebView 실행
  },
}
```

### `packages/web/next.config.ts`

`output: 'export'` — Next.js를 순수 정적 파일로 빌드합니다.
`trailingSlash: true` — 정적 호스팅 및 WebView 라우팅 호환성.
`images.unoptimized: true` — 정적 export 시 이미지 최적화 서버 불필요.

### `packages/web/lib/capacitor.ts`

플랫폼 감지 유틸리티:

```typescript
import { isAndroid, isWeb, isNative, getPreference, setPreference } from '@/lib/capacitor'

if (isAndroid) {
  // Android 전용 코드
}

await setPreference('theme', 'dark')
const theme = await getPreference('theme')
```

---

## Release APK 서명 (배포용)

디버그 APK가 아닌 서명된 Release APK가 필요한 경우:

1. Android Studio > `Build > Generate Signed Bundle / APK`
2. 키스토어 생성 또는 기존 키스토어 선택
3. `Release` 빌드 변형 선택
4. APK 생성 완료

또는 `android/app/build.gradle`에 서명 설정을 추가하여 CLI로 빌드:

```bash
cd android
./gradlew assembleRelease
```

---

## 문제 해결

### `out/` 디렉토리가 없을 때

```bash
cd packages/web && npm run build
```

### Android SDK를 찾지 못할 때

`android/local.properties` 파일에 SDK 경로 추가:

```
sdk.dir=/Users/<username>/Library/Android/sdk
```

Windows:

```
sdk.dir=C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk
```

### Capacitor 버전 불일치 오류

```bash
npm run cap:sync
```

### WebView에서 API 요청이 실패할 때

`capacitor.config.ts`의 `server.androidScheme`이 `'https'`인지 확인하고,
백엔드 CORS 설정에 `capacitor://localhost`와 `https://localhost`를 허용 origin으로 추가합니다.
