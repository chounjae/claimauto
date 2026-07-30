import Link from 'next/link'
import Logo from '@/components/Logo'

export const metadata = { title: '페이지를 찾을 수 없습니다' }

/**
 * 커스텀 404.
 * 기본 Next.js 404 는 브랜드도 없고 돌아갈 길도 안내하지 않는다.
 * 이 서비스는 커뮤니티 링크로 유입되므로 오래된 링크를 타고 들어오는 경우가 생긴다.
 */
export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col px-5 pb-16 md:min-h-0 md:px-10">
      <header className="pt-6 pb-4">
        <Logo />
      </header>

      <div className="flex flex-1 flex-col justify-center gap-6 py-10">
        <div className="flex flex-col gap-2">
          <p className="tnum text-5xl font-bold tracking-tight text-gray-200">404</p>
          <h1 className="balance text-xl font-bold text-gray-900">
            찾으시는 페이지가 없습니다
          </h1>
          <p className="pretty text-sm leading-relaxed text-gray-500">
            주소가 바뀌었거나 링크가 오래된 것일 수 있습니다.
            환불액 계산은 아래에서 바로 시작할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link
            href="/form"
            className="flex h-[52px] w-full items-center justify-center rounded-xl bg-[#2563EB] text-base font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-200 hover:bg-[#1D4ED8] active:scale-[0.98]"
          >
            환급액 계산하기
          </Link>
          <Link
            href="/"
            className="flex h-[46px] w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            홈으로
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs leading-6 text-gray-500">
          <p className="font-semibold text-gray-800">찾으시던 게 이것인가요?</p>
          <ul className="mt-1 flex flex-col gap-0.5">
            <li><Link href="/guide" className="text-[#2563EB] underline">소비자원 신고 가이드</Link></li>
            <li><Link href="/feedback" className="text-[#2563EB] underline">의견 보내기</Link></li>
            <li><Link href="/privacy" className="text-[#2563EB] underline">개인정보 처리방침</Link></li>
          </ul>
        </div>
      </div>
    </main>
  )
}
