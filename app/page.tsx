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
        {/*
          첫 화면의 일은 두 가지다.
          ① 가장 큰 오해를 깬다 — 커뮤니티 조사에서 "계약서에 서명했으니 끝"이라는 믿음이
             창업자의 가설 3개보다 관측 빈도가 높았다(6건).
          ② "얼마"를 먼저 말한다 — 같은 조사에서 사용자의 진짜 질문은
             "환불이 되냐"가 아니라 "얼마 받냐"였다(6건).
             결과 도달자 29명 중 15명이 금액을 바꿔가며 재계산한 것과도 맞물린다.
        */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-gray-900">
            헬스장 환불,<br />못 받고 넘어가지 마세요
          </h1>
          <h2 className="text-lg font-bold leading-snug text-[#2563EB]">
            계약서에 「환불 불가」라고 써 있어도<br />포기하지 마세요
          </h2>
          <p className="text-sm leading-relaxed text-gray-500">
            공정위 기준으로 <strong className="font-semibold text-gray-700">내 환급액을 1분 만에</strong> 계산하고,
            법적 근거가 담긴 내용증명까지 만들어 드립니다.
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
        <div className="mt-2 flex items-center justify-center gap-3">
          <Link href="/privacy" className="underline">개인정보 처리방침</Link>
          <span>·</span>
          <Link href="/feedback" className="underline">의견 보내기</Link>
        </div>
      </footer>

      {/* 하단 고정 CTA */}
      <CTAButton href="/form" label="무료 환급액 계산하기" sublabel="무료 · 회원가입 불필요" />
    </main>
  )
}
