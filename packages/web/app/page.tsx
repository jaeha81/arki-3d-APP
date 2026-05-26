import Link from 'next/link'
import { Box, Layers, Users, Calculator, Cloud, Moon, ChevronRight, Check } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Box className="h-7 w-7 text-[hsl(var(--primary))]" />
            <span className="text-xl font-bold tracking-tight">SpacePlanner</span>
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

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-20 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-4 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
          B2B SaaS — 건축·인테리어 전용 설계 플랫폼
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          건축/인테리어 설계의{' '}
          <span className="text-[hsl(var(--primary))]">새로운 기준</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[hsl(var(--muted-foreground))]">
          2D 도면과 3D 시각화를 하나의 화면에서 동시에 편집하세요.
          실시간 동기화로 설계 작업 시간을 절반으로 줄여드립니다.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:opacity-90"
          >
            무료로 시작하기
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-6 py-3 text-base font-semibold transition hover:bg-[hsl(var(--accent))]"
          >
            데모 보기
          </Link>
        </div>

        {/* Stats Bar */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: '1,200+', label: '완성된 프로젝트' },
            { value: '80+', label: '파트너 사무소' },
            { value: '4가지', label: '요금제 플랜' },
            { value: '무료', label: '체험 시작' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-center"
            >
              <div className="text-2xl font-bold text-[hsl(var(--primary))]">{stat.value}</div>
              <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</div>
            </div>
          ))}
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
            <h2 className="text-3xl font-bold">3단계로 시작하세요</h2>
            <p className="mt-3 text-[hsl(var(--muted-foreground))]">복잡한 설정 없이 바로 설계 작업을 시작할 수 있습니다</p>
          </div>
          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: '프로젝트 생성',
                desc: '프로젝트 이름과 기본 정보를 입력하고 새 프로젝트를 만드세요. 30초면 충분합니다.',
              },
              {
                step: '02',
                title: '2D 도면 작성',
                desc: '직관적인 캔버스에서 벽, 문, 창문을 배치하고 공간을 설계하세요.',
              },
              {
                step: '03',
                title: '3D 뷰 확인',
                desc: '자동으로 생성된 3D 공간을 회전하고 가구를 배치하여 완성도를 높이세요.',
              },
            ].map((item, i) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-lg font-bold text-white shadow-lg">
                  {item.step}
                </div>
                {i < 2 && (
                  <div className="absolute left-[calc(50%+28px)] top-7 hidden h-0.5 w-[calc(100%-56px)] bg-[hsl(var(--border))] sm:block" />
                )}
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
            <h2 className="text-3xl font-bold">합리적인 요금제</h2>
            <p className="mt-3 text-[hsl(var(--muted-foreground))]">Toss Payments로 간편하게 결제하세요</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: 'Free',
                price: '₩0',
                period: '/월',
                desc: '개인 테스트용',
                features: ['프로젝트 3개', '기본 2D/3D 편집', '1GB 저장공간'],
                cta: '무료 시작',
                highlight: false,
              },
              {
                name: 'Starter',
                price: '₩19,900',
                period: '/월',
                desc: '소규모 사무소',
                features: ['프로젝트 20개', '팀원 3명', '10GB 저장공간', '이메일 지원'],
                cta: '시작하기',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '₩49,900',
                period: '/월',
                desc: '전문 사무소',
                features: ['프로젝트 무제한', '팀원 무제한', '100GB 저장공간', '견적 자동화', '우선 지원'],
                cta: '시작하기',
                highlight: true,
                badge: '인기',
              },
              {
                name: 'Enterprise',
                price: '문의',
                period: '',
                desc: '대형 건설사',
                features: ['맞춤형 설정', '전용 서버', '전담 매니저', 'API 연동', 'SLA 보장'],
                cta: '문의하기',
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
                  href={plan.name === 'Enterprise' ? '/contact' : '/register'}
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
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">실제 사용자의 이야기</h2>
            <p className="mt-3 text-[hsl(var(--muted-foreground))]">SpacePlanner를 사용하는 전문가들의 후기</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                quote: '2D와 3D를 동시에 볼 수 있어서 클라이언트 미팅 준비 시간이 확실히 줄었습니다. 특히 가구 배치 시뮬레이션 기능이 큰 도움이 됩니다.',
                name: '김건축',
                role: '소장, 에이앤디건축사무소',
                initials: 'K',
              },
              {
                quote: '인테리어 시안 작업을 SpacePlanner로 바꾸고 나서 고객 만족도가 올라갔습니다. 공간감을 직관적으로 전달할 수 있어요.',
                name: '이디자인',
                role: '수석 디자이너, 모던스페이스 인테리어',
                initials: 'L',
              },
              {
                quote: '견적 자동화 기능이 정말 편합니다. 면적 계산에 쓰던 시간을 절약해서 더 많은 프로젝트를 수주할 수 있게 됐습니다.',
                name: '박시공',
                role: '대표, 한빛종합건설',
                initials: 'P',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"
              >
                <p className="mb-5 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--primary))]/20 text-sm font-bold text-[hsl(var(--primary))]">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
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
              <span className="font-bold">SpacePlanner</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-[hsl(var(--muted-foreground))]">
              <Link href="/login" className="hover:text-[hsl(var(--foreground))]">로그인</Link>
              <Link href="/register" className="hover:text-[hsl(var(--foreground))]">회원가입</Link>
              <Link href="/projects" className="hover:text-[hsl(var(--foreground))]">대시보드</Link>
              <Link href="/contact" className="hover:text-[hsl(var(--foreground))]">문의하기</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
            © 2026 SpacePlanner. All rights reserved. 결제: Toss Payments
          </div>
        </div>
      </footer>
    </div>
  )
}
