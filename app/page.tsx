import Link from 'next/link'
import Logo from '@/components/Logo'
import TrustBadges from '@/components/TrustBadges'
import CTAButton from '@/components/CTAButton'
import TrackPageView from '@/components/TrackPageView'

export default function OnboardingPage() {
  return (
    <main className="flex flex-col min-h-screen px-5 pb-28">
      <TrackPageView event="onboarding_viewed" />
      {/* 헤더 */}
      <header className="pt-6 pb-4">
        <Logo />
      </header>

      {/* 히어로 */}
      <section className="flex-1 flex flex-col justify-center gap-6 py-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-gray-900">
            헬스장 환불,<br />직접 받으세요
          </h1>
          <h2 className="text-xl font-bold text-[#2563EB]">
            3분 만에 법적 청구서를 완성하세요
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            폐업 · 중도해지 · 단순변심 모두 가능<br />
            공정위 고시 기반 · 소비자원 바로 연결
          </p>
        </div>

        {/* 신뢰 지표 */}
        <TrustBadges />
      </section>

      {/* 면책 및 처리방침 고지 */}
      <footer className="pb-28 pt-4 text-center text-[11px] leading-5 text-gray-400">
        <p>
          본 서비스는 공개된 법령·고시를 바탕으로 금액을 계산하고 서식을 제공하는 도구이며,
          법률 자문을 제공하지 않습니다.
        </p>
        <Link href="/privacy" className="mt-2 inline-block underline">
          개인정보 처리방침
        </Link>
      </footer>

      {/* 하단 고정 CTA */}
      <CTAButton href="/form" label="무료 환급액 계산하기" sublabel="3초 소요 · 무료 · 회원가입 불필요" />
    </main>
  )
}
