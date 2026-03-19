# Arki-3D

> 인테리어 시공업체를 위한 3D 공간 설계 + AI 챗봇 앱

---

## 📱 Android APK 다운로드

<div align="center">

### ➡️ [Arki-3D-v0.1.0.apk 다운로드](https://github.com/jaeha81/arki-3d-APP/releases/download/v0.1.0/Arki-3D-v0.1.0.apk)

**파일 크기: 5.1MB** · Android 7.0 이상

[![GitHub release](https://img.shields.io/github/v/release/jaeha81/arki-3d-APP?label=최신버전&style=for-the-badge)](https://github.com/jaeha81/arki-3d-APP/releases/latest)

</div>

### 설치 방법

1. 위 링크를 Android 기기에서 열거나, PC에서 다운로드 후 기기로 전송
2. **설정 → 보안 → 출처를 알 수 없는 앱 허용** (최초 1회)
3. 다운로드된 `Arki-3D-v0.1.0.apk` 파일 탭하여 설치
4. 설치 완료 후 앱 실행

> 💡 Chrome에서 직접 다운로드 시: 다운로드 완료 알림에서 **"열기"** 탭

---

## ✨ 주요 기능

| 기능                     | 설명                                          |
| ------------------------ | --------------------------------------------- |
| **2D 도면 편집**         | 벽 그리기, 문·창문 배치, 치수선, Undo/Redo    |
| **3D 실시간 뷰어**       | 도면 → 3D 자동 변환, 가구 배치, 카메라 컨트롤 |
| **AI 디자인 어시스턴트** | "거실을 모던하게" → Claude AI가 자동 배치     |
| **자동 견적**            | 자재+시공비 산출 (한국 단가 기준)             |
| **PDF 견적서**           | 인쇄 가능한 견적서 생성                       |
| **가구 라이브러리**      | 3D 가구 50종 (거실·침실·주방·서재)            |
| **플러그인 확장**        | 앱 내 플러그인 관리자로 기능 추가             |

---

## 📸 스크린샷

> 앱 스크린샷은 추후 추가 예정

---

## 🔌 플러그인 시스템

설치 후 앱 내 **플러그인 관리자**에서 추가 기능 설치 가능:

| 플러그인        | 기능                  | 기본 포함 |
| --------------- | --------------------- | --------- |
| `ai-design`     | Claude AI 디자인 제안 | ✅        |
| `estimation`    | 자재+시공비 자동 견적 | ✅        |
| `pdf-export`    | 견적서 PDF 생성       | ✅        |
| `furniture-lib` | 3D 가구 라이브러리    | ✅        |

---

## 🛠 개발자 빌드

### 요구사항

- Node.js 20+
- Android Studio + Android SDK 35
- Java 17+

### 빌드

```bash
git clone https://github.com/jaeha81/arki-3d-APP.git
cd arki-3d-APP
npm install --legacy-peer-deps
npm run web:build          # Next.js 정적 빌드
npx cap copy android       # 웹 에셋 복사
npx cap sync android       # 플러그인 동기화
cd android
./gradlew assembleDebug    # APK 빌드
# → android/app/build/outputs/apk/debug/app-debug.apk
```

### GitHub Actions 자동 빌드

태그를 푸시하면 자동으로 APK가 Releases에 업로드됩니다:

```bash
git tag v0.2.0
git push origin v0.2.0
```

---

## 📋 릴리즈 이력

| 버전                                                                 | 날짜       | 변경사항    |
| -------------------------------------------------------------------- | ---------- | ----------- |
| [v0.1.0](https://github.com/jaeha81/arki-3d-APP/releases/tag/v0.1.0) | 2026-03-20 | 최초 릴리즈 |

---

## 기술 스택

| 레이어            | 기술                                              |
| ----------------- | ------------------------------------------------- |
| **Frontend**      | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **3D 엔진**       | Three.js + React Three Fiber                      |
| **상태 관리**     | Zustand + TanStack Query                          |
| **모바일 패키징** | Capacitor v7 (Android APK)                        |
| **데스크탑**      | Tauri v2 (.msi/.dmg/.AppImage)                    |
| **AI**            | Claude API (Anthropic)                            |
| **Backend**       | FastAPI + PostgreSQL + Redis                      |

---

<div align="center">
  <sub>Made with ❤️ for interior designers</sub>
</div>
