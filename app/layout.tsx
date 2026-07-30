import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

/*
  Pretendard 셀프호스팅.
  이전에는 globals.css 에서 jsdelivr CDN 을 @import 했다. 문제 두 가지:
  ① CSS 내부 @import 라 Tailwind 뒤에 직렬 요청된다
  ② 정적 전체 웨이트를 받아 실측 3.9MB 가 전송됐다
  next/font 는 같은 도메인에서 서빙하고 preload·swap 을 자동으로 붙인다.
  웨이트는 Regular(400)/Bold(700) 두 개만 쓴다 —
  한글 폰트는 웨이트당 765~800KB 라 늘릴수록 그대로 비용이다.
*/
const pretendard = localFont({
  src: [
    { path: '../fonts/Pretendard-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/Pretendard-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-pretendard',
  display: 'swap',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://claimauto.aphelion.ai.kr'
const TITLE = '헬스장 환불 얼마 받을 수 있나 — 1분 계산 | ClaimAuto'
const DESCRIPTION = '계약서에 「환불 불가」라고 써 있어도 포기하지 마세요. 공정위 기준으로 내 환급액을 1분 만에 계산하고, 법적 근거가 담긴 내용증명까지 무료로 만들어 드립니다.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s | ClaimAuto',
  },
  description: DESCRIPTION,
  keywords: [
    '헬스장 환불', '헬스장 중도해지', '헬스장 환불 방법', '헬스장 환급', '헬스장 환불 거부',
    '헬스장 해지', '헬스장 계약 취소', '공정위 소비자분쟁해결기준', '체육시설 환불',
    '소비자원 헬스장', '헬스장 환불 청구서', '헬스장 내용증명',
  ],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'ClaimAuto',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
  other: {
    // 네이버 서치어드바이저 등록 후 NEXT_PUBLIC_NAVER_SITE_VERIFICATION 을 설정한다.
    // 값이 없으면 태그 자체를 내보내지 않는다 — 플레이스홀더 문자열을 그대로 노출하면
    // 검증에 실패할 뿐 아니라 잘못된 값이 색인된다.
    ...(process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION
      ? { 'naver-site-verification': process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION }
      : {}),
    'google-site-verification': 'MuG7QuyMYNNuqErNDo0oi1fuM0E7kPsXskw_0n-F9o4',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  /*
    확대를 막으면 WCAG 1.4.4 위반이다 — 저시력 사용자가 본문을 키울 수 없다.
    iOS 에서 입력창 포커스 시 자동 줌이 싫으면 input font-size 를 16px 이상으로
    두는 것이 올바른 해법이고, 이 앱은 이미 그렇게 되어 있다.
  */
  maximumScale: 5,
  userScalable: true,
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'ClaimAuto',
      description: DESCRIPTION,
      inLanguage: 'ko-KR',
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '헬스장 중도해지 시 환불받을 수 있나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '네. 공정거래위원회 「소비자분쟁해결기준」(체육시설업)에 따라 기이용료와 위약금(이용료의 1/10)을 제외한 잔액을 환불받을 수 있습니다.',
          },
        },
        {
          '@type': 'Question',
          name: '헬스장이 환불을 거부하면 어떻게 하나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '한국소비자원(ccn.go.kr)에 피해구제를 신청하세요. 소비자원이 업체에 공문을 발송하는 것만으로 합의에 이르는 경우가 많습니다. 조정 불성립 시 소액소송으로 법원에 직접 청구할 수 있습니다.',
          },
        },
        {
          '@type': 'Question',
          name: '할인·프로모션으로 가입했는데 환불 기준이 어떻게 되나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '실제 납부한 금액 기준으로 계산합니다. 업체가 정상가 기준으로 계산하는 것은 소비자분쟁해결기준에 위배됩니다.',
          },
        },
        {
          '@type': 'Question',
          name: '헬스장이 폐업했는데 환불을 받을 수 있나요?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '폐업은 사업자 귀책 사유이므로 잔여 이용료에 위약금(이용료의 1/10)을 더한 금액을 환불받을 수 있습니다. 카드 결제 시 카드사 차지백도 병행 가능합니다.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="skip-link">본문으로 건너뛰기</a>
        {/*
          폰 기준(375px)을 유지하되 데스크톱에서 화면 중앙의 좁은 기둥으로 보이지 않게 한다.
          방문자의 16.4%(44/267)가 이미 데스크톱이고, 검색 색인이 열려 비율이 오를 것이다.
          md 이상에서 컨테이너를 600px 로 넓히고 위아래 여백을 줘서
          '모바일 스크린샷을 백지에 붙인 것' 같은 인상을 없앤다.
        */}
        <div
          className="
            layout-wrapper relative mx-auto min-h-dvh max-w-[375px] bg-[#F8FAFC]
            shadow-[0_2px_48px_-8px_rgba(37,99,235,0.12)]
            md:my-10 md:min-h-0 md:max-w-[600px] md:rounded-3xl md:shadow-[0_8px_64px_-12px_rgba(37,99,235,0.18)]
          "
        >
          {children}
        </div>
      </body>
    </html>
  )
}
