import Link from 'next/link'
import { Box, Layers, Users, Calculator, Cloud, Moon, ChevronRight, Check, ArrowRight, Building2, Zap, FileText } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Box className="h-7 w-7 text-[hsl(var(--primary))]" />
            <span className="text-xl font-bold tracking-tight">JH-3D</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--accent))]"
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              무료 시작
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — 2-column: 텍스트 + SVG path-draw 평면도 */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div>
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
              건축·인테리어 사무소 전용 B2B SaaS
            </div>
            <h1 className="animate-fade-up animation-delay-100 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[3.25rem]">
              2D 도면을 그리면{' '}
              <span className="text-[hsl(var(--primary))]">3D로 즉시</span>
              {' '}변환됩니다
            </h1>
            <p className="animate-fade-up animation-delay-200 mt-6 text-lg text-[hsl(var(--muted-foreground))] leading-relaxed">
              벽을 그리는 순간 3D 공간이 완성됩니다. AI 가구 배치·견적 자동화·클라이언트 공유까지 —
              설계 소요 시간을 절반으로 줄이고 수주율을 높이세요.
            </p>
            <div className="animate-fade-up animation-delay-300 mt-10 flex flex-col items-start gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:opacity-90"
              >
                14일 무료 체험
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-6 py-3 text-base font-semibold transition hover:bg-[hsl(var(--accent))]"
              >
                요금제 보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="animate-fade-up animation-delay-500 mt-12 grid grid-cols-3 gap-4">
              {[
                { value: '50%', label: '설계 시간 단축' },
                { value: '14일', label: '무료 체험' },
                { value: '한국 단가', label: '자동 견적' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-center"
                >
                  <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                  <div className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: SVG path-draw 평면도 애니메이션 */}
          <div className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--muted))]/40 to-[hsl(var(--background))] p-6 shadow-xl">
              {/* window chrome */}
              <div className="mb-4 flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <div className="ml-3 text-xs text-[hsl(var(--muted-foreground))]">평면도.jh3d</div>
              </div>

              {/* SVG 평면도 — path-draw 애니메이션 */}
              <svg
                viewBox="0 0 400 320"
                className="w-full"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="인터랙티브 3D 평면도 미리보기"
              >
                {/* Grid */}
                <defs>
                  <pattern id="hero-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--grid-color))" strokeWidth="0.4" />
                  </pattern>
                </defs>
                <rect width="400" height="320" fill="url(#hero-grid)" opacity="0.6" />

                {/* 외벽 — path-draw */}
                <rect
                  x="50" y="40" width="300" height="240"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  rx="1"
                  className="animate-path-draw"
                  style={{ '--path-len': '1080' } as React.CSSProperties}
                />

                {/* 내부 칸막이 벽 */}
                <line
                  x1="200" y1="40" x2="200" y2="200"
                  stroke="hsl(var(--foreground))" strokeWidth="2.5"
                  className="animate-path-draw animation-delay-500"
                  style={{ '--path-len': '160' } as React.CSSProperties}
                />
                <line
                  x1="50" y1="200" x2="200" y2="200"
                  stroke="hsl(var(--foreground))" strokeWidth="2"
                  className="animate-path-draw animation-delay-800"
                  style={{ '--path-len': '150' } as React.CSSProperties}
                />

                {/* 문 호 */}
                <path
                  d="M 200 200 A 30 30 0 0 1 170 200"
                  fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4 2"
                  className="animate-path-fill animation-delay-1200"
                />
                <line x1="200" y1="200" x2="200" y2="230" stroke="hsl(var(--foreground))" strokeWidth="1.5"
                  className="animate-path-fill animation-delay-1200"
                />

                {/* 창문 */}
                <rect x="100" y="38" width="50" height="5" fill="hsl(var(--primary))" rx="1" opacity="0.8"
                  className="animate-path-fill animation-delay-1200"
                />
                <rect x="240" y="38" width="50" height="5" fill="hsl(var(--primary))" rx="1" opacity="0.8"
                  className="animate-path-fill animation-delay-1200"
                />

                {/* 가구 — 거실 소파 */}
                <rect x="60" y="230" width="90" height="35" rx="4" fill="#9b8466" opacity="0.85"
                  className="animate-path-fill animation-delay-1600"
                />
                {/* 침대 */}
                <rect x="225" y="60" width="80" height="110" rx="4" fill="#b0a898" opacity="0.85"
                  className="animate-path-fill animation-delay-1600"
                />

                {/* 치수선 */}
                <line x1="50" y1="295" x2="350" y2="295" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8"
                  className="animate-path-fill animation-delay-1600"
                />
                <text x="200" y="308" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))"
                  className="animate-path-fill animation-delay-1600"
                >
                  9,600mm
                </text>

                {/* 3D 변환 화살표 힌트 */}
                <text x="20" y="18" fontSize="8" fill="hsl(var(--muted-foreground))" className="animate-path-fill animation-delay-1600">
                  2D 도면 →
                </text>
              </svg>

              {/* 3D 변환 배지 */}
              <div className="animate-path-fill animation-delay-1600 mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  {['실시간 3D', 'AI 견적'].map(b => (
                    <span key={b} className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                      {b}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-[hsl(var(--muted-foreground))]">자동 동기화 중...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editor UI Showcase */}
      <section className="py-20 border-t border-[hsl(var(--border))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">실제 작업 화면</h2>
            <p className="mt-3 text-[hsl(var(--muted-foreground))]">
              2D 도면과 3D 뷰가 하나의 화면에서 실시간으로 동기화됩니다
            </p>
          </div>

          {/* App Shell Mockup */}
          <div className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/60 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/70" />
                <div className="h-3 w-3 rounded-full bg-amber-400/70" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/70" />
              </div>
              <div className="ml-2 flex-1 max-w-[240px] rounded-md bg-[hsl(var(--background))] border border-[hsl(var(--border))] px-3 py-1 text-xs text-[hsl(var(--muted-foreground))]">
                jh-3d.app/editor/proj-001
              </div>
            </div>

            {/* Editor body */}
            <div className="flex h-[380px]">
              {/* Left sidebar */}
              <div className="hidden w-14 flex-shrink-0 flex-col items-center gap-3 border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 py-4 sm:flex">
                {[Layers, Box, Users, Calculator].map((Icon, i) => (
                  <div
                    key={i}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                      i === 0 ? 'bg-[hsl(var(--primary))] text-white' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                ))}
              </div>

              {/* 2D Canvas panel */}
              <div className="relative flex-1 border-r border-[hsl(var(--border))] bg-[hsl(var(--editor-bg))]">
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1.5 text-xs font-medium">
                  <Layers className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                  2D 평면도
                </div>
                {/* Grid */}
                <svg className="absolute inset-0 h-full w-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="hsl(var(--grid-color))" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
                {/* Floor plan outline */}
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
                  <rect x="60" y="50" width="280" height="200" fill="none" stroke="hsl(var(--foreground))" strokeWidth="3" rx="1" />
                  <line x1="200" y1="50" x2="200" y2="200" stroke="hsl(var(--foreground))" strokeWidth="3" />
                  <line x1="60" y1="175" x2="200" y2="175" stroke="hsl(var(--foreground))" strokeWidth="2" />
                  <path d="M 200 200 A 25 25 0 0 1 175 200" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4 2" />
                  <line x1="200" y1="200" x2="200" y2="225" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
                  <line x1="60" y1="270" x2="340" y2="270" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
                  <text x="200" y="282" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">9,600mm</text>
                  <rect x="110" y="48" width="40" height="4" fill="hsl(var(--primary))" rx="1" opacity="0.8" />
                  <rect x="260" y="48" width="40" height="4" fill="hsl(var(--primary))" rx="1" opacity="0.8" />
                </svg>
              </div>

              {/* 3D Viewport panel */}
              <div className="relative hidden flex-1 overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))]/30 to-[hsl(var(--background))] lg:block">
                <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))]/90 px-2.5 py-1.5 text-xs font-medium backdrop-blur-sm">
                  <Box className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                  3D 뷰
                </div>
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 400 320"
                  preserveAspectRatio="xMidYMid meet"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polygon points="200,260 340,180 200,100 60,180" fill="#f0efeb" stroke="#d8d6d2" strokeWidth="1" />
                  <line x1="200" y1="100" x2="200" y2="260" stroke="#e0deda" strokeWidth="0.5" />
                  <line x1="130" y1="140" x2="270" y2="140" stroke="#e0deda" strokeWidth="0.5" />
                  <line x1="95" y1="160" x2="305" y2="160" stroke="#e0deda" strokeWidth="0.5" />
                  <line x1="130" y1="220" x2="270" y2="220" stroke="#e0deda" strokeWidth="0.5" />
                  <polygon points="60,180 60,100 200,20 200,100" fill="#e8e6e2" stroke="#ccc" strokeWidth="1" />
                  <polygon points="200,100 200,20 340,100 340,180" fill="#dddbd7" stroke="#ccc" strokeWidth="1" />
                  <polygon points="200,180 200,120 130,160 130,220" fill="#d8d6d2" stroke="#bbb" strokeWidth="0.8" opacity="0.8" />
                  <polygon points="80,200 80,180 140,148 140,168" fill="#9b8466" stroke="#7a6448" strokeWidth="0.8" />
                  <polygon points="80,200 140,168 140,175 80,207" fill="#8a7356" stroke="#7a6448" strokeWidth="0.8" />
                  <polygon points="80,200 80,207 140,175 140,168" fill="#a08870" stroke="#7a6448" strokeWidth="0.8" />
                  <polygon points="255,145 255,120 310,90 310,115" fill="#b8b0a0" stroke="#999" strokeWidth="0.8" />
                  <polygon points="255,145 310,115 310,122 255,152" fill="#a8a090" stroke="#999" strokeWidth="0.8" />
                  <polygon points="255,145 255,152 310,122 310,115" fill="#c0b8a8" stroke="#999" strokeWidth="0.8" />
                  <rect x="90" y="60" width="30" height="22" fill="#a8d4f0" opacity="0.7" stroke="#7ab4d8" strokeWidth="0.8" />
                  <line x1="105" y1="60" x2="105" y2="82" stroke="#7ab4d8" strokeWidth="0.5" />
                  <line x1="90" y1="71" x2="120" y2="71" stroke="#7ab4d8" strokeWidth="0.5" />
                  <rect x="260" y="52" width="30" height="22" fill="#a8d4f0" opacity="0.7" stroke="#7ab4d8" strokeWidth="0.8" />
                  <line x1="275" y1="52" x2="275" y2="74" stroke="#7ab4d8" strokeWidth="0.5" />
                  <line x1="260" y1="63" x2="290" y2="63" stroke="#7ab4d8" strokeWidth="0.5" />
                  <polygon points="155,195 155,182 195,160 195,173" fill="#c8b890" stroke="#a89870" strokeWidth="0.8" />
                  <polygon points="155,195 195,173 195,178 155,200" fill="#b8a880" stroke="#a89870" strokeWidth="0.8" />
                </svg>
                <div className="absolute bottom-3 right-3 z-10 flex gap-1">
                  {['아이소메트릭', '2D→3D 변환'].map(label => (
                    <div key={label} className="rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))] backdrop-blur-sm">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tech badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {[
              'WebGL 렌더링',
              'InstancedMesh 최적화',
              'LOD 자동 적용',
              '실시간 그림자',
              'GLTF 가구 라이브러리',
            ].map(badge => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3 py-1 text-xs font-medium text-[hsl(var(--muted-foreground))]"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-[hsl(var(--muted))]/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">필요한 기능, 전부 갖췄습니다</h2>
            <p className="mt-3 text-[hsl(var(--muted-foreground))]">
              전문 건축·인테리어 사무소를 위해 설계된 핵심 기능들
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Layers,
                title: '2D/3D 동시 편집',
                desc: '도면을 그리는 순간 3D 뷰가 실시간으로 동기화됩니다. 반복 작업 없이 한 화면에서 모두 처리하세요.',
              },
              {
                icon: Box,
                title: '실내 가구 배치',
                desc: 'GLTF 기반 3D 가구 모델 라이브러리에서 드래그 앤 드롭으로 간편하게 배치하세요.',
              },
              {
                icon: Users,
                title: '팀 협업',
                desc: '프로젝트를 팀원과 공유하고 공유 뷰어로 클라이언트에게 실시간 프레젠테이션하세요.',
              },
              {
                icon: Calculator,
                title: '견적 자동화',
                desc: '공간별 면적을 자동 계산하고 자재·시공 견적을 즉시 산출합니다.',
              },
              {
                icon: Cloud,
                title: '클라우드 저장',
                desc: '모든 프로젝트는 클라우드에 안전하게 저장됩니다. 어디서든 이어서 작업하세요.',
              },
              {
                icon: Moon,
                title: '다크모드 지원',
                desc: '야간 작업에 최적화된 다크모드를 기본 지원합니다. 눈의 피로를 줄이세요.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10">
                  <feature.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">5단계 완성 워크플로우</h2>
            <p className="mt-3 text-[hsl(var(--muted-foreground))]">2D 도면 → 3D 시각화 → AI 디자인 → 견적 → 클라이언트 공유까지 한 번에</p>
          </div>
          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-5">
            {[
              {
                step: '01',
                icon: Building2,
                title: '2D 도면 작성',
                desc: '벽·문·창문을 캔버스에 배치. 스냅·치수선 자동 적용.',
              },
              {
                step: '02',
                icon: Box,
                title: '실시간 3D 변환',
                desc: '도면 그리는 즉시 3D로 자동 변환. 회전·줌으로 공간감 확인.',
              },
              {
                step: '03',
                icon: Zap,
                title: 'AI 디자인 제안',
                desc: '"모던하게 꾸며줘" 한 마디로 가구 자동 배치 + 컨셉 제안.',
              },
              {
                step: '04',
                icon: Calculator,
                title: '자동 견적 생성',
                desc: '자재·시공비 한국 단가 기준 자동 산출. PDF 견적서 즉시 출력.',
              },
              {
                step: '05',
                icon: FileText,
                title: '클라이언트 공유',
                desc: '링크 한 번으로 3D 도면·견적 공유. 수주율이 올라갑니다.',
              },
            ].map((item, i) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))] shadow-lg">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                {i < 4 && (
                  <div className="absolute left-[calc(50%+28px)] top-7 hidden h-0.5 w-[calc(100%-56px)] bg-[hsl(var(--border))] sm:block" />
                )}
                <div className="mb-1 text-xs font-bold text-[hsl(var(--primary))]">{item.step}</div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-[hsl(var(--muted))]/40 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">합리적인 B2B 요금제</h2>
            <p className="mt-3 text-[hsl(var(--muted-foreground))]">
              팀 규모에 맞게 선택하세요. Toss Payments로 간편 결제.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                name: 'Studio',
                price: '₩49,000',
                period: '/월',
                desc: '1~3인 건축/인테리어 스튜디오',
                features: ['프로젝트 20개', '팀원 3명', '50GB 저장공간', 'AI 크레딧 50회/월', 'PDF 견적서'],
                cta: '시작하기',
                highlight: false,
              },
              {
                name: 'Firm',
                price: '₩99,000',
                period: '/월',
                desc: '5~20인 전문 건축사무소',
                features: ['프로젝트 무제한', '팀원 무제한', '500GB 저장공간', 'AI 크레딧 무제한', '우선 지원'],
                cta: '시작하기',
                highlight: true,
                badge: '추천',
              },
              {
                name: 'Enterprise',
                price: '문의',
                period: '',
                desc: '대형 건설사 / 맞춤 계약',
                features: ['전용 서버', '전담 매니저', 'API 연동', 'SLA 보장', '커스텀 에셋'],
                cta: '영업팀 문의',
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.highlight
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 shadow-lg'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--primary))] px-3 py-0.5 text-xs font-semibold text-white">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{plan.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">{plan.period}</span>
                </div>
                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 flex-shrink-0 text-[hsl(var(--primary))]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className={`rounded-xl py-2.5 text-center text-sm font-semibold transition ${
                    plan.highlight
                      ? 'bg-[hsl(var(--primary))] text-white hover:opacity-90'
                      : 'border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary))] hover:underline"
            >
              전체 기능 비교 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Beta Partner Program (testimonials 대체) */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))]/8 to-[hsl(var(--muted))]/40 border border-[hsl(var(--border))] p-8 sm:p-12">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary))] mb-4">
                  얼리 액세스
                </div>
                <h2 className="text-3xl font-bold leading-tight">
                  베타 파트너 사무소를<br />모집합니다
                </h2>
                <p className="mt-4 text-[hsl(var(--muted-foreground))] leading-relaxed">
                  건축·인테리어 사무소를 운영하고 계신가요?
                  JH-3D 베타 파트너로 참여하시면 <strong className="text-[hsl(var(--foreground))]">6개월 무료</strong> 사용과
                  전담 온보딩을 제공합니다. 여러분의 현장 피드백으로 제품을 함께 만들어갑니다.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    '6개월 Firm 플랜 무료 제공',
                    '1:1 온보딩 및 전담 지원',
                    '기능 요청 우선 반영',
                    '정식 출시 시 할인 혜택',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 flex-shrink-0 text-[hsl(var(--primary))]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-3 text-sm font-semibold text-white shadow transition hover:opacity-90"
                  >
                    베타 파트너 신청하기
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { icon: Building2, label: '건축사사무소', desc: '소규모 ~ 중형 건축사사무소' },
                  { icon: Layers, label: '인테리어 디자인', desc: '주거·상업 공간 인테리어' },
                  { icon: Calculator, label: '시공·시설 관리', desc: '견적·관리 업무 자동화' },
                  { icon: Users, label: '부동산 개발', desc: '분양·모델하우스 프레젠테이션' },
                ].map(item => (
                  <div key={item.label} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                    <item.icon className="mb-2 h-5 w-5 text-[hsl(var(--primary))]" />
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[hsl(var(--primary))] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold text-white">지금 바로 시작하세요</h2>
          <p className="mt-4 text-base text-white/80">
            신용카드 없이 무료 플랜으로 시작할 수 있습니다.
            언제든지 업그레이드하거나 취소할 수 있어요.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-[hsl(var(--primary))] shadow transition hover:bg-white/90"
            >
              무료로 시작하기
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
            >
              이미 계정이 있으신가요?
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Box className="h-6 w-6 text-[hsl(var(--primary))]" />
              <span className="font-bold">JH-3D</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-[hsl(var(--muted-foreground))]">
              <Link href="/login" className="hover:text-[hsl(var(--foreground))]">로그인</Link>
              <Link href="/register" className="hover:text-[hsl(var(--foreground))]">회원가입</Link>
              <Link href="/pricing" className="hover:text-[hsl(var(--foreground))]">요금제</Link>
              <Link href="/projects" className="hover:text-[hsl(var(--foreground))]">대시보드</Link>
              <Link href="/contact" className="hover:text-[hsl(var(--foreground))]">문의하기</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
            © 2026 JH-3D. All rights reserved. 결제: Toss Payments
          </div>
        </div>
      </footer>
    </div>
  )
}
