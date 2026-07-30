import type { Metadata, Viewport } from 'next'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://claimauto.aphelion.ai.kr'
const TITLE = 'ClaimAuto — 헬스장 환불 청구 자동화'
const DESCRIPTION = '헬스장 환불, 얼마 받을 수 있는지 1분 만에 확인하세요. 공정위 고시 기반 계산 후 법적 근거가 담긴 청구서를 무료로 만들어 드립니다.'

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
  maximumScale: 1,
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
            text: '한국소비자원(ccn.go.kr)에 피해구제를 신청하세요. 소비자원이 업체에 공문을 발송하면 70% 이상이 자진 환불로 해결됩니다. 조정 불성립 시 소액소송으로 법원에 직접 청구할 수 있습니다.',
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
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50">
        <div className="layout-wrapper mx-auto max-w-[375px] min-h-screen relative bg-[#F8FAFC] shadow-[0_0_60px_rgba(0,0,0,0.08)]">
          {children}
        </div>
      </body>
    </html>
  )
}
