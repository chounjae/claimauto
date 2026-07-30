'use client'

import Link from 'next/link'
import { track } from '@/lib/analytics'

interface CTAButtonProps {
  href: string
  label: string
  sublabel?: string
}

/**
 * 하단 고정 CTA.
 *
 * 색: primary(#2563EB) 로 통일했다. 이전에는 이 버튼만 accent(#10B981) 였다.
 * 화면마다 주 버튼 색이 달라지면 "무엇이 주 동작인지"의 신호가 흐려진다.
 * accent 는 이제 상태 표시(사업자 귀책 시 위약금 가산 등)에만 쓴다.
 *
 * 레이아웃: 폰에서는 화면 하단 고정, md 이상에서는 문서 흐름 안으로 들어간다.
 * 데스크톱에서 375px 폭 알약이 화면 아래에 떠 있으면 폰 목업처럼 보인다.
 *
 * 그림자: 순수 검정 대신 버튼 색조를 띤 그림자를 쓴다. 광원이 하나로 읽힌다.
 */
export default function CTAButton({ href, label, sublabel }: CTAButtonProps) {
  return (
    <div
      className="
        fixed bottom-0 left-1/2 w-full max-w-[375px] -translate-x-1/2 p-4
        bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent
        md:static md:left-auto md:max-w-none md:translate-x-0 md:bg-none md:p-0 md:pt-2
      "
    >
      <Link
        href={href}
        onClick={() => track('cta_clicked', { href, label })}
        className="
          flex h-[52px] w-full items-center justify-center rounded-xl
          bg-[#2563EB] text-base font-bold text-white
          shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)]
          transition-all duration-200
          hover:bg-[#1D4ED8] hover:shadow-[0_8px_24px_-6px_rgba(37,99,235,0.65)]
          active:scale-[0.98] active:shadow-[0_3px_12px_-4px_rgba(37,99,235,0.5)]
        "
      >
        {label}
      </Link>
      {sublabel && (
        <p className="mt-2 text-center text-xs text-gray-400">{sublabel}</p>
      )}
    </div>
  )
}
